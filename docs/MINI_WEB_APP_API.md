# Mini Web App API Documentation

Backend API for Virtual AI Stylist Telegram Mini App.

## Base URL

- Development: `http://localhost:3001`
- Production: `https://your-api-domain.com`

## Authentication

Mini app runs inside Telegram. All protected endpoints require **Telegram initData**.

### 1. Login (auto on app open)

When the user opens the mini app from the bot, Telegram injects `initData` into `window.Telegram.WebApp.initData`.

**Call `POST /api/auth/telegram`** with initData to validate and get user:

```http
POST /api/auth/telegram
Content-Type: application/json

{
  "initData": "query_hash=xxx&user=..."
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "telegramId": 123456789,
    "phone": "998901234567",
    "firstName": "Ism",
    "lastName": "Familiya",
    "username": "username",
    "fullName": "Ism Familiya",
    "photoUrl": null
  }
}
```

### 2. Protected endpoints

For all protected endpoints, send initData in **one** of:
- Header: `X-Telegram-Init-Data: <initData>`
- Body: `{ "initData": "<initData>", ... }`
- Query: `?initData=<initData>`

---

## Endpoints

### Public (no auth)

#### `POST /api/auth/telegram`
Validate initData and return/create user.

**Request:**
```json
{ "initData": "..." }
```

**Response:** `{ user: { ... } }`

---

#### `GET /api/styles`
List all style categories (casual, business, streetwear, etc.).

**Response:**
```json
{
  "styles": [
    {
      "id": 1,
      "key": "casual",
      "name": { "en": "Casual", "ru": "...", "uz": "..." },
      "imageUrl": "https://...",
      "description": null
    }
  ]
}
```

---

#### `GET /api/weather?city=Tashkent`
Get weather for a city (Open-Meteo API).

**Response:**
```json
{
  "city": "Tashkent",
  "tempC": 25,
  "condition": "Partly cloudy"
}
```

---

### Protected (require initData)

#### `POST /api/generate-style`
Generate outfit recommendations using AI (Groq Llama).

**Headers:** `X-Telegram-Init-Data: <initData>`

**Request:**
```json
{
  "occasion": "Dinner date in rainy weather",
  "language": "en",
  "profile": {
    "height": 170,
    "weight": 70,
    "gender": "other",
    "bodyType": "average",
    "budget": "medium"
  },
  "stylePreferences": ["casual", "elegant"],
  "weather": {
    "tempC": 18,
    "condition": "Rain",
    "city": "Tashkent"
  },
  "trendInspired": false
}
```

**Response:**
```json
{
  "personaSummary": "...",
  "occasion": "Dinner date in rainy weather",
  "outfits": [
    {
      "outfit": {
        "top": "Silk blouse or soft knit",
        "bottom": "Dark jeans or midi skirt",
        "shoes": "Ankle boots",
        "accessories": "Delicate jewelry, crossbody bag"
      },
      "whyItWorks": "...",
      "imageUrl": "https://...",
      "shopping": {
        "top": { "brands": ["..."], "stores": ["..."] },
        "bottom": { ... },
        "shoes": { ... },
        "accessories": { ... }
      }
    }
  ],
  "outfit": { "top": "...", "bottom": "...", "shoes": "...", "accessories": "..." },
  "imageUrl": "https://...",
  "colorAdvice": "...",
  "shopping": { ... }
}
```

---

#### `GET /api/user/profile`
Get full profile: Telegram data + onboarding profile.

**Headers:** `X-Telegram-Init-Data: <initData>`

**Response:**
```json
{
  "telegram": {
    "id": 1,
    "telegramId": 123456789,
    "phone": "998901234567",
    "firstName": "Ism",
    "lastName": "Familiya",
    "username": "username",
    "fullName": "Ism Familiya",
    "photoUrl": null
  },
  "onboarding": {
    "height": 170,
    "weight": 70,
    "gender": "other",
    "bodyType": "average",
    "defaultEvent": "date",
    "budget": "medium",
    "stylePreferences": ["casual", "elegant"]
  }
}
```

---

#### `PUT /api/user/profile`
Update onboarding profile.

**Request:**
```json
{
  "height": 175,
  "weight": 72,
  "gender": "male",
  "bodyType": "athletic",
  "defaultEvent": "work",
  "budget": "high",
  "stylePreferences": ["casual", "business"]
}
```

**Response:** `{ "ok": true }`

---

#### `GET /api/wardrobe`
List saved outfits (favorites).

**Response:**
```json
{
  "favorites": [
    {
      "id": "1",
      "occasion": "Date night",
      "imageUrl": "https://...",
      "outfit": { "top": "...", "bottom": "...", "shoes": "...", "accessories": "..." },
      "personaSummary": "...",
      "shopping": { ... },
      "createdAt": "2025-03-07T12:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/wardrobe`
Save outfit to favorites.

**Request:**
```json
{
  "occasion": "Date night",
  "imageUrl": "https://...",
  "outfit": {
    "top": "Silk blouse",
    "bottom": "Dark jeans",
    "shoes": "Ankle boots",
    "accessories": "Crossbody bag"
  },
  "personaSummary": "...",
  "shopping": { ... }
}
```

**Response:** `201` + saved outfit object with `id`, `createdAt`

---

#### `DELETE /api/wardrobe/:id`
Remove outfit from favorites.

**Response:** `{ "ok": true }`

---

## Error Responses

- `400` – Bad request (missing/invalid params)
- `401` – Unauthorized (invalid or expired initData)
- `404` – Not found
- `500` – Server error

```json
{ "error": "Error message" }
```

---

## Telegram Bot Flow

1. User sends `/start` → Bot asks for phone number
2. User shares contact → Bot saves user, sends welcome + "Stilizni tanlash" + Web App button
3. User taps button → Mini app opens with `initData`
4. Mini app calls `POST /api/auth/telegram` with `initData` → auto-login
5. Profile shows Telegram data (username, phone, name, etc.)
