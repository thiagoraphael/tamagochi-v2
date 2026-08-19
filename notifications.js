import { shouldNotify, markNotified } from "./state.js";

const NOTIFICATION_RULES = [
  {
    type: "hunger",
    check: (pet) => pet.hunger > 80,
    title: "Seu bichinho está com fome! 🍔",
    message: "Passe um tempo longe de sites de distração pra alimentá-lo."
  },
  {
    type: "happiness",
    check: (pet) => pet.happiness < 30,
    title: "Seu bichinho está triste 😢",
    message: "Ele precisa de um tempo em sites produtivos pra se animar."
  },
  {
    type: "energy",
    check: (pet) => pet.energy < 30,
    title: "Seu bichinho está exausto 😴",
    message: "Considere um tempo fora do navegador pra ele recuperar energia."
  }
];

export async function checkAndNotify(pet) {
  for (const rule of NOTIFICATION_RULES) {
    if (rule.check(pet) && (await shouldNotify(rule.type))) {
      chrome.notifications.create(`pet-${rule.type}-${Date.now()}`, {
        type: "basic",
        iconUrl: "../icons/icon128.png",
        title: rule.title,
        message: rule.message,
        priority: 1
      });
      await markNotified(rule.type);
    }
  }
}