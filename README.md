# 🐣 Tamagotchi da Produtividade

Extensão de navegador (Chrome, Manifest V3) que conecta o estado de um bichinho virtual aos seus hábitos de navegação: ele fica feliz e saudável quando você evita sites de distração, e cansado/triste quando passa muito tempo neles.

O projeto é uma evolução de um jogo de Tamagotchi feito anteriormente em JavaScript puro, agora conectado a dados reais de comportamento de navegação — unindo front-end/game dev com raciocínio de dados e hábitos.

## Funcionalidades

- 🐾 Bichinho virtual com estados visuais (feliz, cansado, triste, com fome)
- ⏱️ Rastreamento de tempo por aba/domínio, com classificação em sites de distração, produtivos e neutros
- 💛 Sistema de humor com 3 atributos: felicidade, energia e fome, que evoluem com o tempo de navegação e com o tempo real
- 🖼️ Interface via popup (clique no ícone) e via nova aba (new tab override), com ranking dos sites mais usados no dia
- 🔔 Notificações leves quando o bichinho precisa de atenção
- 💾 Persistência local via `chrome.storage` — nenhum dado sai do navegador, sem backend

## Stack

- JavaScript (ES Modules)
- Chrome Extension Manifest V3
- `chrome.tabs`, `chrome.storage` (local e session), `chrome.alarms`, `chrome.notifications`

## Arquitetura

```
tamagotchi-produtividade/
├── manifest.json
├── background.js       # service worker: rastreamento de aba/domínio, orquestração
├── mood-rules.js        # lógica pura: classificação de domínio e cálculo de humor
├── state.js             # persistência do estado do pet (storage.local)
├── notifications.js     # regras de notificação
├── popup/                # UI do popup (clique no ícone)
├── newtab/               # UI da nova aba (mais espaço, mostra ranking de sites)
├── assets/               # sprites do bichinho
└── icons/                 # ícones da extensão
```

A lógica de humor (`mood-rules.js`) é separada do storage (`state.js` e `background.js`) para ficar fácil de testar e ajustar as regras sem mexer na integração com as APIs do Chrome.

## Como instalar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/tamagotchi-produtividade.git
   ```
2. Abra `chrome://extensions` no Chrome.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto.
5. Clique no ícone da extensão ou abra uma nova aba para ver o bichinho.

## Personalizando as regras

As listas de sites e as taxas de humor ficam em `mood-rules.js`:

```js
export const DISTRACTION_SITES = ["youtube.com", "instagram.com", ...];
export const PRODUCTIVE_SITES = ["github.com", "stackoverflow.com", ...];

const MOOD_RATE_PER_MINUTE = {
  distraction: -1,
  productive: +1,
  offline: +0.5,
  neutral: 0
};
```

## Próximos passos

- [ ] Tornar as taxas de humor e a lista de sites configuráveis pela UI
- [ ] Extrair a lógica de renderização compartilhada entre popup e newtab
- [ ] Publicar na Chrome Web Store
- [ ] Gráfico de histórico de humor ao longo dos dias

## Licença

MIT