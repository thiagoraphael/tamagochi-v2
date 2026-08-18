import { classifyDomain, calculateMoodDelta } from "./mood-rules.js";
import { applyMoodDelta, initPetState } from "./state.js";

let currentDomain = null;
let sessionStart = null;

chrome.runtime.onInstalled.addListener(() => {
  initPetState();
});

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

async function switchDomain(newDomain) {
  const now = Date.now();
  if (currentDomain && sessionStart) {
    const elapsedMs = now - sessionStart;
    await accumulateTime(currentDomain, elapsedMs);
  }
  currentDomain = newDomain;
  sessionStart = newDomain ? now : null;
}

async function accumulateTime(domain, elapsedMs) {
  const key = `time:${domain}`;
  const stored = await chrome.storage.local.get(key);
  const previous = stored[key] || 0;
  await chrome.storage.local.set({ [key]: previous + elapsedMs });

  const category = classifyDomain(domain);
  const delta = calculateMoodDelta(category, elapsedMs);
  await applyMoodDelta(delta);
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  switchDomain(getDomain(tab.url));
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

import { applyHungerDecay } from "./state.js";

const ALARM_NAME = "pet-tick";
const ALARM_PERIOD_MINUTES = 5; // checa a cada 5 min (mínimo permitido é 1)

chrome.runtime.onInstalled.addListener(() => {
  initPetState();
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD_MINUTES });
});

// Garante que o alarme também exista se o service worker reiniciar
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD_MINUTES });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const { pet } = await chrome.storage.local.get("pet");
    if (!pet) return;

    const now = Date.now();
    const elapsedMs = now - pet.lastUpdated;
    await applyHungerDecay(elapsedMs);
  }
});