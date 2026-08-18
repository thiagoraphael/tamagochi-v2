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

async function render() {
  const { pet } = await chrome.storage.local.get("pet");
  if (!pet) return;

  const visualState = determineVisualState(pet);

  document.getElementById("pet-sprite").src = SPRITE_MAP[visualState];
  document.getElementById("pet-mood-text").textContent = MOOD_TEXT_MAP[visualState];
  document.getElementById("happiness-bar").value = pet.happiness;
  document.getElementById("energy-bar").value = pet.energy;
  document.getElementById("hunger-bar").value = pet.hunger;
}

render();

// Atualiza em tempo real se o storage mudar enquanto o popup está aberto
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.pet) {
    render();
  }
});