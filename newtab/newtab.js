function determineVisualState(pet) {
  if (pet.hunger > 80) return "hungry";
  if (pet.happiness < 30) return "sad";
  if (pet.energy < 30) return "tired";
  return "happy";
}

const SPRITE_MAP = {
  happy: "../assets/pet-happy.svg",
  tired: "../assets/pet-tired.svg",
  sad: "../assets/pet-sad.svg",
  hungry: "../assets/pet-hungry.svg"
};

const MOOD_TEXT_MAP = {
  happy: "Seu bichinho está feliz! 🎉",
  tired: "Seu bichinho está cansado... 😴",
  sad: "Seu bichinho está triste. 😢",
  hungry: "Seu bichinho está com fome! 🍔"
};

async function renderPet() {
  const { pet } = await chrome.storage.local.get("pet");
  if (!pet) return;

  const visualState = determineVisualState(pet);

  document.getElementById("pet-sprite").src = SPRITE_MAP[visualState];
  document.getElementById("pet-mood-text").textContent = MOOD_TEXT_MAP[visualState];

  document.getElementById("happiness-bar").value = pet.happiness;
  document.getElementById("energy-bar").value = pet.energy;
  document.getElementById("hunger-bar").value = pet.hunger;

  document.getElementById("happiness-value").textContent = pet.happiness.toFixed(1);
  document.getElementById("energy-value").textContent = pet.energy.toFixed(1);
  document.getElementById("hunger-value").textContent = pet.hunger.toFixed(1);
}

async function renderTopSites() {
  const all = await chrome.storage.local.get(null); // pega tudo do storage
  const timeEntries = Object.entries(all)
    .filter(([key]) => key.startsWith("time:"))
    .map(([key, ms]) => ({ domain: key.replace("time:", ""), ms }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 5); // top 5

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
  if (area === "local") {
    render();
  }
});