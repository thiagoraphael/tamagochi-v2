# 🐣 Tamagotchi da Produtividade

Extensão de navegador (Chrome, Manifest V3) que conecta o estado de um bichinho virtual aos seus hábitos de navegação: ele fica feliz e saudável quando você evita sites de distração, e cansado/triste quando passa muito tempo neles.

O projeto é uma evolução de um jogo de Tamagotchi feito anteriormente em JavaScript puro, agora conectado a dados reais de comportamento de navegação — unindo front-end/game dev com raciocínio de dados e hábitos.

## Screenshots

| Popup | Configurações |
|---|---|
| _adicionar print_ | _adicionar print_ |

## Funcionalidades

- 🐾 Bichinho virtual com estados visuais (feliz, cansado, triste, com fome), renderizado em pixel art dentro de uma tela LCD estilo Tamagotchi original
- 🎨 Personalização: escolha a cor da casca do dispositivo e a espécie do bichinho (gato, cachorro, dino, coelho) pela página de Configurações
- ⏱️ Rastreamento de tempo por aba/domínio, com classificação em sites de distração, produtivos e neutros
- 💛 Sistema de humor com 3 atributos: felicidade, energia e fome, que evoluem com o tempo de navegação e com o tempo real
- ⚙️ Página de Configurações para adicionar/remover sites das categorias de distração e produtivos, sem precisar editar código
- 🖼️ Interface via popup (clique no ícone), com ranking dos sites mais usados no dia
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
├── mood-rules.js         # lógica pura: classificação de domínio (lê listas do storage) e cálculo de humor
├── state.js              # persistência do estado do pet (storage.local)
├── notifications.js      # regras de notificação
├── sprites.js             # matrizes de pixel art por espécie x estado de humor
├── popup/                 # UI do popup (clique no ícone) — visual de dispositivo Tamagotchi
├── options/                # página de Configurações: sites, cor da casca e espécie do bichinho
├── newtab/                # UI alternativa de nova aba (código mantido, override desativado no manifest)
└── icons/                  # ícones da extensão
```

A lógica de humor (`mood-rules.js`) é separada do storage (`state.js` e `background.js`) para ficar fácil de testar e ajustar as regras sem mexer na integração com as APIs do Chrome. As listas de sites e a aparência (cor/espécie) vivem em `chrome.storage.local` e são editadas pela página de Configurações — nada precisa ser alterado no código para personalizar a extensão.

## Como instalar localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/tamagotchi-produtividade.git
   ```
2. Abra `chrome://extensions` no Chrome.
3. Ative o **Modo do desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto.
5. Clique no ícone da extensão na barra de ferramentas para ver o bichinho.

## Personalizando

Clique com o botão direito no ícone da extensão → **Opções** (ou pelo botão de engrenagem no próprio popup) para:

- Adicionar ou remover sites das categorias de distração e produtivos
- Escolher a cor da casca do dispositivo
- Escolher a espécie do bichinho

As taxas de humor (quanto cada categoria de site afeta felicidade/energia por minuto) ainda ficam fixas em `mood-rules.js`, caso queira ajustar o equilíbrio do jogo:

```js
const MOOD_RATE_PER_MINUTE = {
  distraction: -1,
  productive: +1,
  offline: +0.5,
  neutral: 0
};
```

## Próximos passos

- [ ] Tornar as taxas de humor configuráveis pela UI de Configurações
- [ ] Extrair a lógica de renderização compartilhada entre popup e newtab
- [ ] Aplicar o visual de dispositivo também na página de Configurações
- [ ] Reativar a nova aba como opção configurável (toggle em Configurações), em vez de override fixo
- [ ] Publicar na Chrome Web Store
- [ ] Gráfico de histórico de humor ao longo dos dias

## Licença

MIT