const DEFAULT_DISTRACTION_SITES = [
  "youtube.com", "instagram.com", "tiktok.com",
  "twitter.com", "x.com", "netflix.com", "facebook.com", "reddit.com"
];

const DEFAULT_PRODUCTIVE_SITES = [
  "github.com", "stackoverflow.com", "developer.mozilla.org", "docs.google.com"
];

const MOOD_RATE_PER_MINUTE = {
  distraction: -1,
  productive: +1,
  offline: +0.5,
  neutral: 0
};

// Garante que as listas existem no storage na primeira execução
export async function initSiteLists() {
  const { distractionSites, productiveSites } = await chrome.storage.local.get([
    "distractionSites", "productiveSites"
  ]);
  if (!distractionSites) {
    await chrome.storage.local.set({ distractionSites: DEFAULT_DISTRACTION_SITES });
  }
  if (!productiveSites) {
    await chrome.storage.local.set({ productiveSites: DEFAULT_PRODUCTIVE_SITES });
  }
}

export async function classifyDomain(domain) {
  if (!domain) return "offline";

  const { distractionSites, productiveSites } = await chrome.storage.local.get([
    "distractionSites", "productiveSites"
  ]);

  const distraction = distractionSites || DEFAULT_DISTRACTION_SITES;
  const productive = productiveSites || DEFAULT_PRODUCTIVE_SITES;

  if (distraction.some((site) => domain.includes(site))) return "distraction";
  if (productive.some((site) => domain.includes(site))) return "productive";
  return "neutral";
}

export function calculateMoodDelta(category, elapsedMs) {
  const minutes = elapsedMs / 60000;
  return MOOD_RATE_PER_MINUTE[category] * minutes;
}