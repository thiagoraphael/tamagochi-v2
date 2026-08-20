import { initSiteLists } from "../mood-rules.js";
import { getSprite } from "../sprites.js";
import { PALETTES, getPaletteByShell } from "../palettes.js";

const SPECIES = [
  { id: "gato", label: "GATO" },
  { id: "cachorro", label: "CACHORRO" },
  { id: "dino", label: "DINO" },
  { id: "coelho", label: "COELHO" }
];

const DEFAULT_APPEARANCE = { shellColor: PALETTES[0].shell, species: "gato" };

function applyPaletteVars(palette) {
  document.documentElement.style.setProperty("--shell-color", palette.shell);
  document.documentElement.style.setProperty("--frame-color", palette.frame);
  document.documentElement.style.setProperty("--button-color", palette.button);
}

async function loadAppearance() {
  const { appearance } = await chrome.storage.local.get("appearance");
  return appearance || DEFAULT_APPEARANCE;
}

async function saveAppearance(appearance) {
  await chrome.storage.local.set({ appearance });
}

function renderSpriteInto(container, species, mood) {
  const grid = getSprite(species, mood);
  container.innerHTML = "";
  grid.join("").split("").forEach((ch) => {
    const px = document.createElement("div");
    px.className = "pixel";
    px.style.background = ch === "#" ? "#3C4A34" : "transparent";
    container.appendChild(px);
  });
}

function renderPaletteRow(container, currentShell, onPick) {
  container.innerHTML = "";
  PALETTES.forEach((p) => {
    const btn = document.createElement("button");
    btn.className = "palette-swatch";
    btn.style.background = p.shell;
    btn.title = p.name;
    if (p.shell === currentShell) {
      btn.style.boxShadow = "0 0 0 2px #FBFAF7, 0 0 0 4px #2B2A31";
    } else {
      btn.style.boxShadow = "inset 0 2px 0 rgba(255,255,255,.35), 0 0 0 1px rgba(0,0,0,.14)";
    }
    const inner = document.createElement("div");
    inner.className = "palette-swatch-frame";
    inner.style.background = p.frame;
    btn.appendChild(inner);
    btn.addEventListener("click", () => onPick(p.shell));
    container.appendChild(btn);
  });
}

function renderSpeciesGrid(container, currentSpecies, onPick) {
  container.innerHTML = "";
  SPECIES.forEach((s) => {
    const card = document.createElement("div");
    card.className = "species-card" + (s.id === currentSpecies ? " selected" : "");

    const screen = document.createElement("div");
    screen.className = "species-screen";
    const texture = document.createElement("div");
    texture.className = "species-screen-texture";
    const sprite = document.createElement("div");
    sprite.className = "species-sprite";
    screen.appendChild(texture);
    screen.appendChild(sprite);

    const name = document.createElement("span");
    name.className = "species-name";
    name.textContent = s.label;

    card.appendChild(screen);
    card.appendChild(name);
    card.addEventListener("click", () => onPick(s.id));
    container.appendChild(card);

    renderSpriteInto(sprite, s.id, "happy");
  });
}

// --- Sites (distração/produtivo) ---

async function loadSites() {
  const { distractionSites, productiveSites } = await chrome.storage.local.get([
    "distractionSites", "productiveSites"
  ]);
  return { distraction: distractionSites, productive: productiveSites };
}

async function saveSites(distraction, productive) {
  await chrome.storage.local.set({
    distractionSites: distraction,
    productiveSites: productive
  });
}

function normalizeDomain(input) {
  let value = input.trim().toLowerCase();
  try {
    if (value.includes("://")) value = new URL(value).hostname;
  } catch {
    // mantém como está
  }
  return value.replace(/\/$/, "");
}

function renderList(listEl, countEl, sites, onRemove) {
  listEl.innerHTML = "";
  sites.forEach((site) => {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = site;
    const btn = document.createElement("button");
    btn.textContent = "×";
    btn.title = "Remover";
    btn.addEventListener("click", () => onRemove(site));
    li.appendChild(span);
    li.appendChild(btn);
    listEl.appendChild(li);
  });
  countEl.textContent = sites.length === 1 ? "1 site na lista" : `${sites.length} sites na lista`;
}

async function init() {
  await initSiteLists();

  // --- Aparência ---
  let appearance = await loadAppearance();
  const paletteRow = document.getElementById("palette-row");
  const paletteCaption = document.getElementById("palette-caption");
  const speciesGrid = document.getElementById("species-grid");

  function refreshAppearance() {
    const palette = getPaletteByShell(appearance.shellColor);
    applyPaletteVars(palette);

    renderPaletteRow(paletteRow, appearance.shellColor, async (shellColor) => {
      appearance = { ...appearance, shellColor };
      await saveAppearance(appearance);
      refreshAppearance();
    });

    paletteCaption.innerHTML = `Selecionado: <strong>${palette.name}</strong> · moldura + botões acompanham a casca.`;

    renderSpeciesGrid(speciesGrid, appearance.species, async (species) => {
      appearance = { ...appearance, species };
      await saveAppearance(appearance);
      refreshAppearance();
    });
  }

  refreshAppearance();

  // --- Sites ---
  let { distraction, productive } = await loadSites();

  const distractionList = document.getElementById("distraction-list");
  const productiveList = document.getElementById("productive-list");
  const distractionCount = document.getElementById("distraction-count");
  const productiveCount = document.getElementById("productive-count");

  function refreshSites() {
    renderList(distractionList, distractionCount, distraction, async (site) => {
      distraction = distraction.filter((s) => s !== site);
      await saveSites(distraction, productive);
      refreshSites();
    });
    renderList(productiveList, productiveCount, productive, async (site) => {
      productive = productive.filter((s) => s !== site);
      await saveSites(distraction, productive);
      refreshSites();
    });
  }

  refreshSites();

  document.getElementById("add-distraction-btn").addEventListener("click", async () => {
    const input = document.getElementById("distraction-input");
    const value = normalizeDomain(input.value);
    if (value && !distraction.includes(value)) {
      distraction.push(value);
      await saveSites(distraction, productive);
      input.value = "";
      refreshSites();
    }
  });

  document.getElementById("add-productive-btn").addEventListener("click", async () => {
    const input = document.getElementById("productive-input");
    const value = normalizeDomain(input.value);
    if (value && !productive.includes(value)) {
      productive.push(value);
      await saveSites(distraction, productive);
      input.value = "";
      refreshSites();
    }
  });
}

init();