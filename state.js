export const DEFAULT_PET_STATE = {
  happiness: 70,
  energy: 70,
  hunger: 50,
  lastUpdated: Date.now(),
  createdAt: Date.now()
};

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export async function initPetState() {
  const { pet } = await chrome.storage.local.get("pet");
  if (!pet) {
    await chrome.storage.local.set({ pet: DEFAULT_PET_STATE });
  }
}

export async function applyMoodDelta(delta) {
  const { pet } = await chrome.storage.local.get("pet");
  const current = pet || DEFAULT_PET_STATE;

  const updated = {
    ...current,
    happiness: clamp(current.happiness + delta, 0, 100),
    energy: clamp(current.energy + delta * 0.5, 0, 100),
    lastUpdated: Date.now()
  };

  await chrome.storage.local.set({ pet: updated });
}

const HUNGER_INCREASE_PER_MINUTE = 0.5; // fome sobe com o tempo, sempre

export async function applyHungerDecay(elapsedMs) {
  const { pet } = await chrome.storage.local.get("pet");
  const current = pet || DEFAULT_PET_STATE;

  const minutes = elapsedMs / 60000;
  const updated = {
    ...current,
    hunger: clamp(current.hunger + HUNGER_INCREASE_PER_MINUTE * minutes, 0, 100),
    lastUpdated: Date.now()
  };

  await chrome.storage.local.set({ pet: updated });
}

const NOTIFY_COOLDOWN_MS = 30 * 60 * 1000; // 30 min entre notificações do mesmo tipo

export async function shouldNotify(type) {
  const key = `lastNotified:${type}`;
  const stored = await chrome.storage.local.get(key);
  const last = stored[key] || 0;
  return Date.now() - last > NOTIFY_COOLDOWN_MS;
}

export async function markNotified(type) {
  const key = `lastNotified:${type}`;
  await chrome.storage.local.set({ [key]: Date.now() });
}