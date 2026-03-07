# Virtual AI Stylist

100% fullstack Telegram Mini App – telefon orqali login, AI orqali kiyim tavsiyalari.

## Arxitektura

| Qism | Texnologiya |
|------|-------------|
| **Mini Web App** | Next.js 14, TypeScript, Tailwind, Zustand |
| **Backend** | Node.js, Express |
| **Bot** | node-telegram-bot-api (login telefon orqali) |
| **AI** | Groq (bepul tier – Llama 3.3 70B) |
| **DB** | SQLite (better-sqlite3) |

## Flow

1. User botga `/start` bosadi → Bot telefon so'raydi
2. User telefon ulashadi → Bot saqlaydi, "Hush kelibsiz" + **Mini App ochish** tugmasi
3. Tugma bosilganda Mini App ochiladi, **auto-login** (initData)
4. Profile: Telegram maʼlumotlari (username, telefon, ism, rasm)

## Boshlash

### 1. Backend

```bash
cd server
npm install
cp ../.env.example .env
# .env ni to'ldiring: BOT_TOKEN, GROQ_API_KEY, WEB_APP_URL
npm run dev
```

Backend: `http://localhost:3001`

### 2. Frontend (Mini App)

```bash
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

### 3. Telegram Bot

1. [@BotFather](https://t.me/BotFather) – `/newbot`
2. `BOT_TOKEN` ni `.env` ga yozing
3. Bot → Bot Settings → Menu Button yoki Web App URL:
   - `WEB_APP_URL`: mini app manzili (masalan `https://your-app.vercel.app`)

### 4. Groq API

1. [console.groq.com](https://console.groq.com) – hisob oching
2. API key yarating (bepul tier)
3. `GROQ_API_KEY` ni `.env` ga qo'ying

## Loyiha struktura

```
virtual-ai-stylist/
├── server/                 # Express backend
│   ├── bot/                # Telegram bot (login, Web App tugma)
│   ├── db/                 # SQLite, migrations
│   ├── routes/             # auth, styles, generate-style, user, wardrobe, weather
│   ├── services/           # Groq AI
│   └── index.js
├── src/                    # Next.js Mini App
│   ├── app/
│   ├── components/
│   ├── lib/api.ts          # Backend API client
│   └── providers/
└── docs/
    └── MINI_WEB_APP_API.md # To'liq API hujjati
```

## API Hujjati

Barcha endpointlar va request/response formatlari: [docs/MINI_WEB_APP_API.md](docs/MINI_WEB_APP_API.md)

## Environment

**server/.env**

```
PORT=3001
BOT_TOKEN=...
WEB_APP_URL=https://...
GROQ_API_KEY=...
```

**.env.local (Next.js)**

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## License

MIT
