import { getSprite } from "../sprites.js";

const DEFAULT_APPEARANCE = { shellColor: "#7F77DD", species: "gato" };

function determineMood(pet) {
  if (pet.hunger > 80) return "hungry";
  if (pet.happiness < 30) return "sad";
  if (pet.energy < 30) return "tired";
  return "happy";
}

const MOOD_TEXT_MAP = {
  happy: "Seu bichinho está feliz!",
  tired: "Seu bichinho está cansado...",
  sad: "Seu bichinho está triste.",
  hungry: "Seu bichinho está com fome!"
};

function renderSprite(species, mood) {
  const grid = getSprite(species, mood);
  const container = document.getElementById("pet-sprite");
  container.innerHTML = "";
  grid.forEach((row) => {
    row.split("").forEach((cell) => {
      const px = document.createElement("div");
      px.className = "pixel";
      px.style.background = cell === "1" ? "#3C4A34" : "transparent";
      container.appendChild(px);
    });
  });
}

async function renderPet() {
  const { pet, appearance } = await chrome.storage.local.get(["pet", "appearance"]);
  if (!pet) return;

  const { shellColor, species } = appearance || DEFAULT_APPEARANCE;
  const mood = determineMood(pet);

  document.getElementById("device").style.background = shellColor;
  document.getElementById("pet-mood-text").textContent = MOOD_TEXT_MAP[mood];
  renderSprite(species, mood);

  document.getElementById("happiness-bar").style.width = pet.happiness + "%";
  document.getElementById("energy-bar").style.width = pet.energy + "%";
  document.getElementById("hunger-bar").style.width = pet.hunger + "%";

  document.getElementById("happiness-value").textContent = pet.happiness.toFixed(1);
  document.getElementById("energy-value").textContent = pet.energy.toFixed(1);
  document.getElementById("hunger-value").textContent = pet.hunger.toFixed(1);
}

async function renderTopSites() {
  const all = await chrome.storage.local.get(null);
  const timeEntries = Object.entries(all)
    .filter(([key]) => key.startsWith("time:"))
    .map(([key, ms]) => ({ domain: key.replace("time:", ""), ms }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 5);

  const list = document.getElementById("top-sites-list");
  list.innerHTML = "";

  for (const entry of timeEntries) {
    const minutes = (entry.ms / 60000).toFixed(1);
    const li = document.createElement("li");
    li.textContent = `${entry.domain} — ${minutes} min`;
    list.appendChild(li);
  }
}

function render() {
  renderPet();
  renderTopSites();
}

render();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local") render();
});

document.getElementById("btn-options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById("btn-refresh").addEventListener("click", () => {
  render();
});