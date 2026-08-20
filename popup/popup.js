import { getSprite } from "../sprites.js";
import { getPaletteByShell, PALETTES } from "../palettes.js";

const DEFAULT_APPEARANCE = { shellColor: PALETTES[0].shell, species: "gato" };

const SPECIES_LABELS = { gato: "GATO", cachorro: "CACHORRO", dino: "DINO", coelho: "COELHO" };

function determineMood(pet) {
  if (pet.hunger > 80) return "hungry";
  if (pet.happiness < 30) return "sad";
  if (pet.energy < 30) return "tired";
  return "happy";
}

const MOOD_CONTENT = {
  happy:  { title: "Feliz e saudável", status: "FOCO OK" },
  tired:  { title: "Cansadinho…", status: "BAIXA ENERGIA" },
  sad:    { title: "Meio pra baixo", status: "PRECISA DE FOCO" },
  hungry: { title: "Com fome de foco", status: "FOME !!" }
};

function moodBlurb(mood, pet) {
  if (mood === "hungry") return "Alimente-o passando um tempo num site produtivo.";
  if (mood === "sad") return "Ele sente falta do seu foco. Evite as distrações de hoje.";
  if (mood === "tired") return "Energia baixa — considere um tempo fora do navegador.";
  return "Você está mantendo o foco. Continue assim!";
}

function renderSprite(species, mood, frameColor) {
  const grid = getSprite(species, mood);
  const container = document.getElementById("pet-sprite");
  container.innerHTML = "";
  grid.join("").split("").forEach((ch) => {
    const px = document.createElement("div");
    px.className = "pixel";
    px.style.background = ch === "#" ? "#3C4A34" : "transparent";
    container.appendChild(px);
  });
}

function formatClock() {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

async function render() {
  const { pet, appearance } = await chrome.storage.local.get(["pet", "appearance"]);
  if (!pet) return;

  const { shellColor, species } = appearance || DEFAULT_APPEARANCE;
  const palette = getPaletteByShell(shellColor);
  const mood = determineMood(pet);
  const content = MOOD_CONTENT[mood];

  document.documentElement.style.setProperty("--shell-color", palette.shell);
  document.documentElement.style.setProperty("--frame-color", palette.frame);
  document.documentElement.style.setProperty("--button-color", palette.button);

  document.getElementById("species-label").textContent = SPECIES_LABELS[species] || "GATO";
  document.getElementById("clock").textContent = formatClock();
  document.getElementById("lcd-status").textContent = content.status;
  document.getElementById("mood-title").textContent = content.title;
  document.getElementById("mood-blurb").textContent = moodBlurb(mood, pet);

  renderSprite(species, mood, palette.frame);

  document.getElementById("happiness-bar").style.width = pet.happiness + "%";
  document.getElementById("energy-bar").style.width = pet.energy + "%";
  document.getElementById("hunger-bar").style.width = pet.hunger + "%";

  document.getElementById("happiness-bar").style.background = palette.frame;
  document.getElementById("energy-bar").style.background = palette.shell;
  document.getElementById("hunger-bar").style.background = palette.button;

  document.getElementById("happiness-value").textContent = pet.happiness.toFixed(1);
  document.getElementById("energy-value").textContent = pet.energy.toFixed(1);
  document.getElementById("hunger-value").textContent = pet.hunger.toFixed(1);

  const days = Math.max(1, Math.floor((Date.now() - pet.createdAt) / 86400000));
  document.getElementById("streak").textContent = `${days} dia${days > 1 ? "s" : ""} de uso`;
}

render();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.pet || changes.appearance)) render();
});

document.getElementById("btn-options").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById("open-options-link").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

document.getElementById("btn-refresh").addEventListener("click", () => {
  render();
});