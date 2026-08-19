import {
  classifyDomain,
  calculateMoodDelta,
  initSiteLists,
} from "./mood-rules.js";
import { applyMoodDelta, applyHungerDecay, initPetState } from "./state.js";
import { checkAndNotify } from "./notifications.js";

const ALARM_NAME = "pet-tick";
const ALARM_PERIOD_MINUTES = 5;

chrome.runtime.onInstalled.addListener(() => {
  initPetState();
  initSiteLists();
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD_MINUTES });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD_MINUTES });
});

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function getSession() {
  const { currentDomain, sessionStart } = await chrome.storage.session.get([
    "currentDomain",
    "sessionStart",
  ]);
  return {
    currentDomain: currentDomain || null,
    sessionStart: sessionStart || null,
  };
}

async function setSession(domain, start) {
  await chrome.storage.session.set({
    currentDomain: domain,
    sessionStart: start,
  });
}

async function switchDomain(newDomain) {
  const now = Date.now();
  const { currentDomain, sessionStart } = await getSession();

  if (currentDomain && sessionStart) {
    const elapsedMs = now - sessionStart;
    await accumulateTime(currentDomain, elapsedMs);
  }

  await setSession(newDomain, newDomain ? now : null);
}

async function accumulateTime(domain, elapsedMs) {
  const key = `time:${domain}`;
  const stored = await chrome.storage.local.get(key);
  const previous = stored[key] || 0;
  await chrome.storage.local.set({ [key]: previous + elapsedMs });

  const category = await classifyDomain(domain); // <-- await adicionado aqui
  const delta = calculateMoodDelta(category, elapsedMs);
  await applyMoodDelta(delta);

  const { pet } = await chrome.storage.local.get("pet");
  if (pet) await checkAndNotify(pet);
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    switchDomain(getDomain(tab.url));
  } catch (err) {
    console.error("[bg] erro em onActivated:", err);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    switchDomain(getDomain(changeInfo.url));
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    switchDomain(null);
  } else {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    switchDomain(tab ? getDomain(tab.url) : null);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const { pet } = await chrome.storage.local.get("pet");
    if (!pet) return;

    const elapsedMs = Date.now() - pet.lastUpdated;
    await applyHungerDecay(elapsedMs);

    const { pet: updatedPet } = await chrome.storage.local.get("pet");
    await checkAndNotify(updatedPet);
  }
});
