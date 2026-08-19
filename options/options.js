import { initSiteLists } from "../mood-rules.js";

const SHELL_COLORS = [
  { name: "roxo", hex: "#7F77DD" },
  { name: "rosa", hex: "#D4537E" },
  { name: "verde", hex: "#639922" },
  { name: "azul", hex: "#378ADD" },
  { name: "coral", hex: "#D85A30" },
];

const PET_SPECIES = [
  { key: "gato", label: "Gato" },
  { key: "cachorro", label: "Cachorro" },
  { key: "dino", label: "Dino" },
  { key: "coelho", label: "Coelho" },
];

const DEFAULT_APPEARANCE = { shellColor: "#7F77DD", species: "gato" };

async function loadAppearance() {
  const { appearance } = await chrome.storage.local.get("appearance");
  return appearance || DEFAULT_APPEARANCE;
}

async function saveAppearance(appearance) {
  await chrome.storage.local.set({ appearance });
  showFeedback("Salvo!");
}

function renderShellColors(container, current, onSelect) {
  container.innerHTML = "";
  SHELL_COLORS.forEach((c) => {
    const btn = document.createElement("button");
    btn.style.background = c.hex;
    btn.setAttribute("aria-label", c.name);
    if (c.hex === current) btn.classList.add("selected");
    btn.addEventListener("click", () => onSelect(c.hex));
    container.appendChild(btn);
  });
}

function renderSpecies(container, current, onSelect) {
  container.innerHTML = "";
  PET_SPECIES.forEach((s) => {
    const btn = document.createElement("button");
    btn.textContent = s.label;
    if (s.key === current) btn.classList.add("selected");
    btn.addEventListener("click", () => onSelect(s.key));
    container.appendChild(btn);
  });
}

async function loadSites() {
  const { distractionSites, productiveSites } = await chrome.storage.local.get([
    "distractionSites",
    "productiveSites",
  ]);
  return { distraction: distractionSites, productive: productiveSites };
}

async function saveSites(distraction, productive) {
  await chrome.storage.local.set({
    distractionSites: distraction,
    productiveSites: productive,
  });
  showFeedback("Salvo!");
}

function normalizeDomain(input) {
  let value = input.trim().toLowerCase();
  try {
    // se o usuário colou uma URL completa, extrai só o hostname
    if (value.includes("://")) {
      value = new URL(value).hostname;
    }
  } catch {
    // não era uma URL válida, mantém como está (provavelmente já é só o domínio)
  }
  return value.replace(/\/$/, ""); // remove barra final se sobrar
}

function showFeedback(text) {
  const el = document.getElementById("save-feedback");
  el.textContent = text;
  setTimeout(() => (el.textContent = ""), 1500);
}

function renderList(listEl, sites, onRemove) {
  listEl.innerHTML = "";
  sites.forEach((site) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = site;
    const btn = document.createElement("button");
    btn.textContent = "Remover";
    btn.addEventListener("click", () => onRemove(site));
    li.appendChild(span);
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

async function init() {
  await initSiteLists();

  let appearance = await loadAppearance();
  const shellContainer = document.getElementById("shell-colors");
  const speciesContainer = document.getElementById("pet-species");

  function refreshAppearance() {
    renderShellColors(shellContainer, appearance.shellColor, async (hex) => {
      appearance = { ...appearance, shellColor: hex };
      await saveAppearance(appearance);
      refreshAppearance();
    });
    renderSpecies(speciesContainer, appearance.species, async (key) => {
      appearance = { ...appearance, species: key };
      await saveAppearance(appearance);
      refreshAppearance();
    });
  }

  refreshAppearance();

  let { distraction, productive } = await loadSites();

  refresh();

  document
    .getElementById("add-distraction-btn")
    .addEventListener("click", async () => {
      const input = document.getElementById("distraction-input");
      const value = normalizeDomain(input.value);
      if (value && !distraction.includes(value)) {
        distraction.push(value);
        await saveSites(distraction, productive);
        input.value = "";
        refresh();
      }
    });

  document
    .getElementById("add-productive-btn")
    .addEventListener("click", async () => {
      const input = document.getElementById("productive-input");
      const value = normalizeDomain(input.value);
      if (value && !productive.includes(value)) {
        productive.push(value);
        await saveSites(distraction, productive);
        input.value = "";
        refresh();
      }
    });
}

init();
