import { classifyDomain, calculateMoodDelta } from "./mood-rules.js";
import { applyMoodDelta, applyHungerDecay, initPetState } from "./state.js";

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

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// --- Sessão (domínio atual + início) persistida em storage.session ---
// storage.session sobrevive a suspensões do service worker,
// diferente de variáveis normais (que seriam perdidas).

async function getSession() {
  const { currentDomain, sessionStart } = await chrome.storage.session.get(["currentDomain", "sessionStart"]);
  return { currentDomain: currentDomain || null, sessionStart: sessionStart || null };
}

async function setSession(domain, start) {
  await chrome.storage.session.set({ currentDomain: domain, sessionStart: start });
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

  const category = classifyDomain(domain);
  const delta = calculateMoodDelta(category, elapsedMs);
  await applyMoodDelta(delta);
}

// --- Listeners de navegação ---

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

// --- Alarme de decaimento de fome ---

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    const { pet } = await chrome.storage.local.get("pet");
    if (!pet) return;

    const now = Date.now();
    const elapsedMs = now - pet.lastUpdated;
    await applyHungerDecay(elapsedMs);
  }
});