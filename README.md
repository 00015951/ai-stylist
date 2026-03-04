# Virtual AI Stylist

A Telegram Mini App (TWA) for personalized outfit recommendations. Built as a graduation project for Business Information Systems.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Icons:** Lucide React
- **SDK:** @twa-dev/sdk (Telegram Web App integration)
- **State:** Zustand with persistence

## Features

- **Multi-step Onboarding**
  - Welcome screen
  - Profile setup (height, weight, gender, body type)
  - Style preferences (Casual, Business, Streetwear, etc.)

- **Generate Look**
  - Describe your occasion (e.g., "Dinner date in rainy weather")
  - AI-style mock recommendations via API

- **Results Dashboard**
  - Persona summary based on profile
  - Outfit card (Top, Bottom, Shoes, Accessories)
  - Save to Favorites

- **Wardrobe**
  - View saved outfits
  - Remove from favorites

- **Profile**
  - View/edit profile
  - Re-do onboarding

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser, or test inside Telegram via [@BotFather](https://t.me/BotFather) → create bot → set up Web App URL.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/generate-style/ # Mock AI styling API
│   ├── onboarding/         # Multi-step onboarding
│   ├── results/            # Generated outfit results
│   ├── wardrobe/           # Saved outfits
│   └── profile/            # User profile
├── components/
│   ├── layout/             # Mobile layout, bottom nav
│   ├── onboarding/         # Onboarding steps
│   ├── home/               # Home page (Generate Look)
│   └── ui/                 # Shadcn components
├── providers/              # TelegramProvider
├── store/                  # Zustand store
└── lib/                    # Utilities
```

## API

### POST /api/generate-style

Request body:

```json
{
  "occasion": "Dinner date in rainy weather",
  "profile": {
    "height": 170,
    "weight": 70,
    "gender": "other",
    "bodyType": "average"
  },
  "stylePreferences": ["casual", "elegant"]
}
```

Returns mock outfit recommendations. Replace with a real AI service for production.

## HCI Principles

- **Mobile-first:** Fixed bottom navigation, touch targets ≥ 44px
- **Visibility:** Progress bar during onboarding
- **Feedback:** Loading states, haptic feedback in Telegram
- **Consistency:** Shadcn/UI design system
- **Error prevention:** Form validation, clear CTAs

## License

MIT
