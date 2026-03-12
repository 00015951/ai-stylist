import { NextRequest, NextResponse } from "next/server";
import { SEASON_PALETTES, type SeasonType } from "@/lib/color-seasons";

/**
 * Personal color analysis — selfie → skin/hair/eyes → season type + palette
 * Mock: random season. In production use vision API (OpenAI, Google, etc.)
 */

interface RequestBody {
  imageBase64?: string;
  language?: string;
}

const SEASONS: SeasonType[] = ["winter", "summer", "spring", "autumn"];

const SEASON_DESC: Record<
  SeasonType,
  Record<"en" | "ru" | "uz", string>
> = {
  winter: {
    en: "Cool undertones, high contrast. Best in jewel tones, black, white, true red.",
    ru: "Холодный подтон, высокий контраст. Идеально: изумруд, чёрный, белый, красный.",
    uz: "Salqin undertone, yuqori kontrast. Qimmatbaho ranglar, qora, oq, toʻgʻri qizil.",
  },
  summer: {
    en: "Cool, soft undertones. Best in dusty rose, lavender, soft blues, muted tones.",
    ru: "Холодный, мягкий подтон. Идеально: пыльная роза, лаванда, мягкий синий.",
    uz: "Salqin, yumshoq undertone. Chang rangida atirgul, lavanda, yumshoq koʻk.",
  },
  spring: {
    en: "Warm, light undertones. Best in peach, gold, coral, warm pastels.",
    ru: "Тёплый, светлый подтон. Идеально: персиковый, золотой, коралл, тёплая пастель.",
    uz: "Issiq, yorqin undertone. Shaftoli, oltin, marjon, issiq pastel.",
  },
  autumn: {
    en: "Warm, earthy undertones. Best in rust, olive, mustard, terracotta.",
    ru: "Тёплый, землистый подтон. Идеально: ржавчина, олива, горчица, терракота.",
    uz: "Issiq, yer ranglari. Zang, zaytun, xantal, terrakota.",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { language } = body;

    // Simulate processing (in prod: call vision API on imageBase64)
    await new Promise((r) => setTimeout(r, 1200));

    // Mock: pick season (in prod: analyze skin/hair/eyes)
    const season: SeasonType =
      SEASONS[Math.floor(Math.random() * SEASONS.length)]!;
    const palette = SEASON_PALETTES[season];
    const desc =
      SEASON_DESC[season][
        (language === "ru" || language === "uz" ? language : "en") as
          | "en"
          | "ru"
          | "uz"
      ];

    return NextResponse.json({
      season,
      seasonName: palette.name,
      palette: palette.hex,
      description: desc,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze colors" },
      { status: 500 }
    );
  }
}
