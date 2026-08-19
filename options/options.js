import { initSiteLists } from "../mood-rules.js";

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
  await initSiteLists(); // garante defaults se for a primeira vez

  let { distraction, productive } = await loadSites();

  const distractionList = document.getElementById("distraction-list");
  const productiveList = document.getElementById("productive-list");

  function refresh() {
    renderList(distractionList, distraction, async (site) => {
      distraction = distraction.filter((s) => s !== site);
      await saveSites(distraction, productive);
      refresh();
    });
    renderList(productiveList, productive, async (site) => {
      productive = productive.filter((s) => s !== site);
      await saveSites(distraction, productive);
      refresh();
    });
  }

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
