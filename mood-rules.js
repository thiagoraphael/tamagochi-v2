export const DISTRACTION_SITES = [
  "youtube.com",
  "instagram.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
  "netflix.com",
  "facebook.com",
  "reddit.com"
];

export const PRODUCTIVE_SITES = [
  "github.com",
  "stackoverflow.com",
  "developer.mozilla.org",
  "docs.google.com"
];

const MOOD_RATE_PER_MINUTE = {
  distraction: -1,
  productive: +1,
  offline: +0.5,
  neutral: 0
};

export function classifyDomain(domain) {
  if (!domain) return "offline";
  if (DISTRACTION_SITES.some(site => domain.includes(site))) return "distraction";
  if (PRODUCTIVE_SITES.some(site => domain.includes(site))) return "productive";
  return "neutral";
}

export function calculateMoodDelta(category, elapsedMs) {
  const minutes = elapsedMs / 60000;
  return MOOD_RATE_PER_MINUTE[category] * minutes;
}