import { NextRequest, NextResponse } from "next/server";

/**
 * Mock API Route: Generate Style
 * Simulates AI processing and returns styling recommendations
 * 
 * In production, this would connect to an actual AI service
 * (e.g., OpenAI, custom ML model) for real styling advice.
 */

interface RequestBody {
  occasion: string;
  language?: string;
  profile?: {
    height: number;
    weight: number;
    gender: string;
    bodyType: string;
    defaultEvent?: string;
    budget?: string;
  };
  stylePreferences?: string[];
  /** Optional: for "what to wear today" — temp in °C, condition */
  weather?: { tempC: number; condition: string; city?: string };
  /** Trend-inspired vs classic look */
  trendInspired?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { occasion, language, profile, stylePreferences = [], trendInspired } = body;

    if (!occasion?.trim()) {
      return NextResponse.json(
        { error: "Occasion description is required" },
        { status: 400 }
      );
    }

    // Simulate AI processing delay (1-2 seconds)
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000)
    );

    // Generate mock persona summary based on profile
    const height = profile?.height ?? 170;
    const weight = profile?.weight ?? 70;
    const bodyType = profile?.bodyType ?? "average";
    const gender = profile?.gender ?? "other";
    const budget = profile?.budget ?? "medium";

    const lang = language === "ru" || language === "uz" ? language : "en";

    const personaSummary = generatePersonaSummary({
      height,
      weight,
      bodyType,
      gender,
      occasion,
      stylePreferences,
      weather: body.weather,
      language: lang,
    });

    // Generate 3–5 outfit options with explanations
    const outfits = generateMultipleOutfits(occasion, stylePreferences, body.weather, budget, lang, trendInspired);
    const first = outfits[0]!;
    const colorAdvice = generateColorAdvice(occasion, stylePreferences, body.weather, lang);

    return NextResponse.json({
      personaSummary,
      occasion: occasion.trim(),
      outfits,
      outfit: first.outfit,
      imageUrl: first.imageUrl,
      shopping: first.shopping,
      colorAdvice,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate style recommendation" },
      { status: 500 }
    );
  }
}

const PERSONA = {
  en: {
    bodyDesc: (bodyType: string) =>
      bodyType === "slim"
        ? "slim and elegant proportions"
        : bodyType === "athletic"
          ? "athletic build with defined silhouette"
          : bodyType === "plus"
            ? "comfortable and confident proportions"
            : "balanced and versatile proportions",
    styleNote: (prefs: string[]) =>
      prefs.length > 0
        ? ` Your preference for ${prefs.join(" and ")} styles has been factored into this recommendation.`
        : "",
    weatherNote: (w: { city?: string; tempC: number; condition: string }) =>
      ` Weather in ${w.city ?? "your area"} (${w.tempC}°C, ${w.condition}) was considered for layering and fabric choices.`,
    main: (h: number, w: number, bodyDesc: string, styleNote: string, weatherNote: string) =>
      `Based on your profile (${h}cm, ${w}kg) with ${bodyDesc}, these looks are tailored to flatter your frame. The pieces selected create visual balance and suit your occasion perfectly.${styleNote}${weatherNote}`,
  },
  ru: {
    bodyDesc: (bodyType: string) =>
      bodyType === "slim"
        ? "стройными и изящными пропорциями"
        : bodyType === "athletic"
          ? "атлетичным силуэтом"
          : bodyType === "plus"
            ? "комфортными и уверенными пропорциями"
            : "сбалансированными и универсальными пропорциями",
    styleNote: (prefs: string[]) =>
      prefs.length > 0
        ? ` Ваши предпочтения по стилям (${prefs.join(", ")}) учтены в рекомендациях.`
        : "",
    weatherNote: (w: { city?: string; tempC: number; condition: string }) =>
      ` Погода в ${w.city ?? "вашем городе"} (${w.tempC}°C, ${w.condition}) учтена при подборе слоёв и тканей.`,
    main: (h: number, w: number, bodyDesc: string, styleNote: string, weatherNote: string) =>
      `По вашему профилю (${h} см, ${w} кг) с ${bodyDesc} подобраны образы, которые подчеркнут силуэт. Вещи создают баланс и идеально подходят к поводу.${styleNote}${weatherNote}`,
  },
  uz: {
    bodyDesc: (bodyType: string) =>
      bodyType === "slim"
        ? "ingichka va nafis proporsiyalar"
        : bodyType === "athletic"
          ? "atletik siluet"
          : bodyType === "plus"
            ? "qulay va ishonchli proporsiyalar"
            : "muvozanatli va universal proporsiyalar",
    styleNote: (prefs: string[]) =>
      prefs.length > 0
        ? ` Sizning uslub afzalliklaringiz (${prefs.join(", ")}) tavsiyalarda hisobga olindi.`
        : "",
    weatherNote: (w: { city?: string; tempC: number; condition: string }) =>
      ` Ob-havo (${w.city ?? "shahringiz"}, ${w.tempC}°C, ${w.condition}) qatlamlar va matolar tanlashda hisobga olindi.`,
    main: (h: number, w: number, bodyDesc: string, styleNote: string, weatherNote: string) =>
      `Profilingiz boʻyicha (${h} sm, ${w} kg) ${bodyDesc} — bu looklar siluetingizni yorqin koʻrsatadi. Tanlangan buyumlar muvozanat yaratadi va saboqingizga mos keladi.${styleNote}${weatherNote}`,
  },
};

function generatePersonaSummary(params: {
  height: number;
  weight: number;
  bodyType: string;
  gender: string;
  occasion: string;
  stylePreferences: string[];
  weather?: { tempC: number; condition: string; city?: string };
  language?: "en" | "ru" | "uz";
}): string {
  const { height, weight, bodyType, stylePreferences, weather, language = "en" } = params;
  const L = PERSONA[language] ?? PERSONA.en;
  const bodyDesc = L.bodyDesc(bodyType);
  const styleNote = L.styleNote(stylePreferences);
  const weatherNote = weather ? L.weatherNote(weather) : "";
  return L.main(height, weight, bodyDesc, styleNote, weatherNote);
}

function generateMockOutfit(
  occasion: string,
  stylePreferences: string[],
  trendInspired?: boolean
): { top: string; bottom: string; shoes: string; accessories: string } {
  const occasionLower = occasion.toLowerCase();

  // Context-aware suggestions
  const isFormal =
    occasionLower.includes("business") ||
    occasionLower.includes("office") ||
    occasionLower.includes("interview") ||
    occasionLower.includes("wedding");

  const isCasual =
    occasionLower.includes("brunch") ||
    occasionLower.includes("casual") ||
    occasionLower.includes("weekend");

  const isDate =
    occasionLower.includes("date") || occasionLower.includes("dinner");

  const isRainy = occasionLower.includes("rain") || occasionLower.includes("rainy");
  const isOutdoor =
    occasionLower.includes("outdoor") ||
    occasionLower.includes("park") ||
    occasionLower.includes("walk");

  // Default style preference
  const pref = stylePreferences[0] ?? "casual";

  if (isFormal && pref !== "streetwear") {
    return {
      top: "Crisp white dress shirt or tailored blouse",
      bottom: "Tailored trousers or pencil skirt in navy or black",
      shoes: "Classic oxford shoes or leather loafers",
      accessories: "Minimal watch, subtle belt, structured bag",
    };
  }

  if (isDate) {
    return {
      top: "Soft knit sweater or silk blouse in a complementary color",
      bottom: "Dark wash jeans or midi skirt",
      shoes: "Ankle boots or elegant heels",
      accessories: "Delicate jewelry, crossbody bag",
    };
  }

  if (isRainy) {
    return {
      top: "Water-resistant jacket over layers (turtleneck or thermal)",
      bottom: "Water-resistant trousers or dark jeans",
      shoes: "Waterproof boots or sneakers",
      accessories: "Compact umbrella, crossbody bag with weather protection",
    };
  }

  if (pref === "streetwear" || trendInspired) {
    return {
      top: trendInspired
        ? "Oversized blazer or soft-shoulder knit (2026 trend)"
        : "Oversized hoodie or graphic tee with bomber jacket",
      bottom: trendInspired
        ? "Wide-leg trousers or viral TikTok cargo pants"
        : "Cargo pants or wide-leg joggers",
      shoes: "Chunky sneakers or high-top kicks",
      accessories: trendInspired ? "Minimal jewelry, structured bag" : "Cap, chain necklace, backpack",
    };
  }

  if (pref === "business") {
    return {
      top: "Blazer with a crisp shirt or blouse",
      bottom: "Tailored chinos or tailored dress",
      shoes: "Monk straps or block heels",
      accessories: "Leather briefcase, minimal watch",
    };
  }

  if (pref === "sporty") {
    return {
      top: "Moisture-wicking top or athletic tee",
      bottom: "Flexible joggers or athletic leggings",
      shoes: "Running shoes or training sneakers",
      accessories: "Fitness tracker, sports bag",
    };
  }

  // Default casual
  return {
    top: trendInspired
      ? "Relaxed linen shirt or pastel knit (spring 2026 trend)"
      : "Comfortable cotton t-shirt or relaxed blouse",
    bottom: trendInspired ? "Wide-leg chinos or midi skirt" : "Well-fitted jeans or chinos",
    shoes: "Clean white sneakers or loafers",
    accessories: "Minimal jewelry, tote or messenger bag",
  };
}

import { OUTFIT_IMAGES } from "@/lib/outfit-images";

function getOutfitImageUrl(_occasion: string, stylePreferences: string[]): string {
  const pref = stylePreferences[0] ?? "casual";
  return OUTFIT_IMAGES[pref] ?? OUTFIT_IMAGES.casual;
}

type OutfitSuggestion = {
  outfit: { top: string; bottom: string; shoes: string; accessories: string };
  imageUrl?: string;
  whyItWorks: string;
  shopping?: ReturnType<typeof generateShoppingSuggestions>;
};

const WHY_IT_WORKS: Record<"en" | "ru" | "uz", Record<string, string>> = {
  en: {
    primary: "This look aligns with your occasion and style preferences. The proportions and pieces are chosen to flatter your body type and create a cohesive outfit.",
    formal2: "A slightly softer take on formal: still professional but with more personality. Ideal if you want to stand out without breaking dress code.",
    date2: "Elegant and memorable without being overdressed. The silhouette is flattering and the fabrics feel special for the occasion.",
    casual2: "A versatile second option you can wear all day. Easy to layer if the weather changes.",
    rainy3: "Built for comfort and protection without sacrificing style. Layers let you adapt as you move between indoors and out.",
    streetwear3: "On-trend and comfortable. The relaxed fit works for your body type and keeps the look current.",
    polished3: "Polished but easy to wear. You can dress it up or down with one swap (e.g. shoes or jacket).",
    budget4: "All pieces are easy to find at budget-friendly retailers. Mix and match with what you already own.",
    hero5: "Focus on one hero piece and keep the rest simple. This formula works for almost any occasion.",
  },
  ru: {
    primary: "Образ подобран под ваш повод и стилевые предпочтения. Пропорции и вещи подчеркивают тип фигуры и создают цельный look.",
    formal2: "Более мягкий деловой вариант: по-прежнему профессионально, но с характером. Идеально, если хотите выделиться, не нарушая дресс-код.",
    date2: "Элегантно и запоминающеся без перебора. Силуэт идёт фигуре, ткани уместны для повода.",
    casual2: "Универсальный второй вариант на весь день. Удобно слоить при смене погоды.",
    rainy3: "Удобство и защита без потери стиля. Слои помогут адаптироваться между улицей и помещением.",
    streetwear3: "В тренде и комфортно. Расслабленный крой подходит вашему типу фигуры и держит образ актуальным.",
    polished3: "Аккуратно и легко носить. Можно усилить или упростить образ одной заменой (обувь или жакет).",
    budget4: "Все вещи легко найти в недорогих магазинах. Комбинируйте с тем, что уже есть в гардеробе.",
    hero5: "Один яркий акцент — остальное спокойное. Такая схема подходит почти для любого повода.",
  },
  uz: {
    primary: "Look saboqingiz va uslub afzalliklaringizga moslashtirilgan. Proporsiyalar va buyumlar tana tipingizni yorqin koʻrsatadi va yaxlit image yaratadi.",
    formal2: "Rasmiy uslubning yumshoqroq varianti: professional, lekin shaxsiyat bilan. Dress-kodni buzmasdan ajralib turish uchun mos.",
    date2: "Zebozor va esda qolarli, ortiqcha boʻlmasdan. Siluet sizga mos, matolar saboq uchun mos.",
    casual2: "Kun boʻyi kiyish mumkin boʻlgan universal ikkinchi variant. Ob-havo oʻzgarganda qatlamlash oson.",
    rainy3: "Uslubsiz qolmasdan qulaylik va himoya. Qatlamlar ichkarida va tashqarida moslashishga yordam beradi.",
    streetwear3: "Trendda va qulay. Boʻsh kiyim tana tipingizga mos va lookni zamonaviy qiladi.",
    polished3: "Zeboli va oson kiyiladi. Bitta almashtirish (masalan, oyoq kiyim yoki jilet) bilan lookni oshirishingiz yoki soddalashtirishingiz mumkin.",
    budget4: "Barcha buyumlarni arzon doʻkonlarda topish oson. Mavjud garderobingiz bilan uygʻunlashtiring.",
    hero5: "Bitta diqqatga sazovor buyum — qolgani soddа. Bu formula deyarli har qanday saboq uchun ishlaydi.",
  },
};

function generateMultipleOutfits(
  occasion: string,
  stylePreferences: string[],
  weather?: { tempC: number; condition: string },
  budget?: string,
  language: "en" | "ru" | "uz" = "en",
  trendInspired?: boolean
): OutfitSuggestion[] {
  const pref = stylePreferences[0] ?? "casual";
  const occasionLower = occasion.toLowerCase();
  const isFormal =
    occasionLower.includes("business") ||
    occasionLower.includes("office") ||
    occasionLower.includes("interview") ||
    occasionLower.includes("wedding");
  const isDate =
    occasionLower.includes("date") || occasionLower.includes("dinner");
  const isRainy =
    occasionLower.includes("rain") ||
    occasionLower.includes("rainy") ||
    weather?.condition?.toLowerCase().includes("rain");
  const isCold = weather ? weather.tempC < 15 : false;

  const L = WHY_IT_WORKS[language] ?? WHY_IT_WORKS.en;
  const suggestions: OutfitSuggestion[] = [];

  const primary = generateMockOutfit(occasion, stylePreferences, trendInspired);
  const primaryShopping = generateShoppingSuggestions(occasion, stylePreferences);

  suggestions.push({
    outfit: primary,
    imageUrl: getOutfitImageUrl(occasion, stylePreferences),
    whyItWorks: L.primary,
    shopping: primaryShopping,
  });

  if (isFormal) {
    suggestions.push({
      outfit: {
        top: "Structured blazer with silk cami or fine knit",
        bottom: "High-waisted tailored trousers or midi skirt",
        shoes: "Block heels or leather loafers",
        accessories: "Structured tote, minimal jewelry, belt",
      },
      imageUrl: OUTFIT_IMAGES.business ?? OUTFIT_IMAGES.casual,
      whyItWorks: L.formal2,
      shopping: primaryShopping,
    });
  } else if (isDate) {
    suggestions.push({
      outfit: {
        top: "Silk blouse or soft cashmere sweater",
        bottom: "Wide-leg trousers or wrap skirt",
        shoes: "Strappy heels or ankle boots",
        accessories: "Clutch, delicate earrings, subtle perfume",
      },
      imageUrl: OUTFIT_IMAGES.elegant ?? OUTFIT_IMAGES.casual,
      whyItWorks: L.date2,
      shopping: primaryShopping,
    });
  } else {
    suggestions.push({
      outfit: {
        top: "Relaxed linen shirt or cotton tee with cardigan",
        bottom: "Chinos or midi denim skirt",
        shoes: "Loafers or clean sneakers",
        accessories: "Tote bag, simple watch, sunglasses",
      },
      imageUrl: OUTFIT_IMAGES.casual,
      whyItWorks: L.casual2,
      shopping: primaryShopping,
    });
  }

  if (isRainy || isCold) {
    suggestions.push({
      outfit: {
        top: "Water-resistant jacket or coat over knit layer",
        bottom: "Dark jeans or water-resistant trousers",
        shoes: "Waterproof boots or weatherproof sneakers",
        accessories: "Umbrella, crossbody bag, scarf",
      },
      imageUrl: OUTFIT_IMAGES.sporty ?? OUTFIT_IMAGES.casual,
      whyItWorks: L.rainy3,
      shopping: primaryShopping,
    });
  } else if (pref === "streetwear" || pref === "sporty") {
    suggestions.push({
      outfit: {
        top: "Oversized tee or hoodie with utility vest",
        bottom: "Cargo pants or joggers",
        shoes: "Chunky sneakers or high-tops",
        accessories: "Cap, backpack, chain or minimal jewelry",
      },
      imageUrl: OUTFIT_IMAGES[pref] ?? OUTFIT_IMAGES.casual,
      whyItWorks: L.streetwear3,
      shopping: primaryShopping,
    });
  } else {
    suggestions.push({
      outfit: {
        top: "Blouse or fine knit with optional blazer",
        bottom: "Tailored trousers or smart jeans",
        shoes: "Ankle boots or loafers",
        accessories: "Belt, watch, small crossbody or tote",
      },
      imageUrl: OUTFIT_IMAGES[pref] ?? OUTFIT_IMAGES.casual,
      whyItWorks: L.polished3,
      shopping: primaryShopping,
    });
  }

  if (budget === "low") {
    suggestions.push({
      outfit: {
        top: "Affordable basics: Uniqlo-style tee or blouse",
        bottom: "High-street jeans or chinos",
        shoes: "Classic white sneakers or simple flats",
        accessories: "Minimal jewelry, high-street bag",
      },
      imageUrl: OUTFIT_IMAGES.casual,
      whyItWorks: L.budget4,
      shopping: primaryShopping,
    });
  }
  if (suggestions.length < 5) {
    suggestions.push({
      outfit: {
        top: "Statement top or knit in a color you love",
        bottom: "Neutral bottom (black, navy, beige) to balance",
        shoes: "Comfortable heels or smart sneakers",
        accessories: "One standout accessory (bag or jewelry)",
      },
      imageUrl: OUTFIT_IMAGES.elegant ?? OUTFIT_IMAGES.casual,
      whyItWorks: L.hero5,
      shopping: primaryShopping,
    });
  }

  return suggestions.slice(0, 5);
}

const COLOR_ADVICE: Record<"en" | "ru" | "uz", Record<string, string>> = {
  en: {
    formal: "Stick to neutrals (navy, black, grey, white) for a classic look. Add one subtle accent—e.g. burgundy or forest green—in a tie, scarf, or bag for personality without breaking formality.",
    date: "Soft tones (blush, cream, sage, dusty rose) feel romantic and flattering. If you prefer darker looks, deep burgundy or emerald paired with neutrals works well for evening.",
    streetwear: "Bold accents (bright sneakers, graphic tees, colored caps) work great. Balance with neutral bottoms. Monochrome (all black or all white) is always a strong streetwear option.",
    bohemian: "Earthy and warm: terracotta, mustard, olive, rust, and cream. Mix patterns in similar tones rather than clashing colors. Natural fabrics enhance the boho feel.",
    casual: "Neutrals (white, beige, grey, denim blue) form a versatile base. Add one or two colors you love—soft pink, sage, or camel—for a fresh, easy-to-style look that works in most settings.",
  },
  ru: {
    formal: "Придерживайтесь нейтральных оттенков (тёмно-синий, чёрный, серый, белый) для классического вида. Один спокойный акцент — например бордо или тёмно-зелёный — в галстуке, шарфе или сумке добавит характер без нарушения формальности.",
    date: "Мягкие тона (румянец, крем, шалфей, пыльная роза) выглядят романтично и идут большинству. Для вечера также хорошо работают тёмный бордо или изумрудный с нейтральными.",
    streetwear: "Яркие акценты (кроссовки, принтовые футболки, цветные кепки) отлично работают. Балансируйте нейтральным низом. Монохром (полностью чёрный или белый) — всегда сильный стритвир-вариант.",
    bohemian: "Тёплые природные тона: терракот, горчичный, олива, ржавчина, крем. Сочетайте принты в одной гамме, избегая контрастных столкновений. Натуральные ткани усиливают бохо-настроение.",
    casual: "Нейтрали (белый, бежевый, серый, деним) — универсальная база. Добавьте один-два любимых цвета — нежно-розовый, шалфей или верблюжий — для свежего и простого в сочетаниях образа.",
  },
  uz: {
    formal: "Klassik look uchun neytral ranglar (toʻq koʻk, qora, kulrang, oq)dan foydalaning. Rasmiylikni buzmasdan bironta past ovozdagi rang (masalan, bordo yoki toʻq yashil) — galstuk, sharf yoki sumkada — shaxsiyat qoʻshadi.",
    date: "Yumshoq tonlar (qizil, krem, maysa, chang rangida atirgul) romantik va yoqimli. Kechalik uchun toʻq bordo yoki zumrad yoki neytral bilan yaxshi ishlaydi.",
    streetwear: "Jasur aksentlar (yorqin krossovkalar, grafik futbolkalar, rangli kepkalar) juda yaxshi. Neytral pastki bilan muvozanatlang. Monoxrom (butunlay qora yoki oq) doim kuchli streetwear variant.",
    bohemian: "Issiq yer ranglari: terrakota, xantal, zaytun, zang, krem. Bir xil tonlarda naqshlarni aralashtiring, keskin kontrastlardan saqlaning. Tabiiy matolar boho hissini kuchaytiradi.",
    casual: "Neytrallar (oq, bej, kulrang, denim) — universal asos. Sevimli bir-ikki rang (yumshoq pushti, maysa yoki tuya rang) qoʻshing — yangi va oson uygʻunlashadigan look uchun.",
  },
};

function generateColorAdvice(
  occasion: string,
  stylePreferences: string[],
  weather?: { tempC: number; condition: string },
  language: "en" | "ru" | "uz" = "en"
): string {
  const pref = stylePreferences[0] ?? "casual";
  const occasionLower = occasion.toLowerCase();
  const isFormal =
    occasionLower.includes("business") ||
    occasionLower.includes("office") ||
    occasionLower.includes("wedding");
  const isDate =
    occasionLower.includes("date") || occasionLower.includes("dinner");

  const L = COLOR_ADVICE[language] ?? COLOR_ADVICE.en;
  if (isFormal) return L.formal;
  if (isDate) return L.date;
  if (pref === "streetwear" || pref === "sporty") return L.streetwear;
  if (pref === "bohemian") return L.bohemian;
  return L.casual;
}

function generateShoppingSuggestions(
  occasion: string,
  stylePreferences: string[]
): {
  top: { brands: string[]; stores: string[] };
  bottom: { brands: string[]; stores: string[] };
  shoes: { brands: string[]; stores: string[] };
  accessories: { brands: string[]; stores: string[] };
} {
  const occasionLower = occasion.toLowerCase();
  const pref = stylePreferences[0] ?? "casual";
  const isFormal =
    occasionLower.includes("business") ||
    occasionLower.includes("office") ||
    occasionLower.includes("wedding");

  // Format-appropriate brands and stores
  const formalTop = {
    brands: ["Hugo Boss", "Zara", "Massimo Dutti", "Charles Tyrwhitt"],
    stores: ["Zara", "H&M", "Mango", "Next"],
  };
  const casualTop = {
    brands: ["Uniqlo", "COS", "Everlane", "Gap"],
    stores: ["Uniqlo", "H&M", "Zara", "ASOS"],
  };
  const streetwearTop = {
    brands: ["Nike", "Adidas", "Stüssy", "Carhartt", "Palace"],
    stores: ["Nike", "ASOS", "Zalando", "End Clothing"],
  };

  const formalBottom = {
    brands: ["Reiss", "Suitsupply", "M&S", "Ted Baker"],
    stores: ["Zara", "H&M", "Mango", "John Lewis"],
  };
  const casualBottom = {
    brands: ["Levi's", "Gap", "Uniqlo", "Dickies"],
    stores: ["Levi's", "Uniqlo", "Zara", "ASOS"],
  };

  const formalShoes = {
    brands: ["Clarks", "Loake", "Church's", "Meermin"],
    stores: ["Clarks", "Zalando", "John Lewis", "Schuh"],
  };
  const casualShoes = {
    brands: ["Nike", "New Balance", "Converse", "Vans", "Veja"],
    stores: ["Nike", "ASOS", "Zalando", "Foot Locker"],
  };

  const accessories = {
    brands: ["Fossil", "Daniel Wellington", "Longchamp", "Muji"],
    stores: ["Amazon", "ASOS", "John Lewis", "Zalando"],
  };

  const useFormal = isFormal || pref === "business";
  return {
    top: useFormal ? formalTop : pref === "streetwear" ? streetwearTop : casualTop,
    bottom: useFormal ? formalBottom : casualBottom,
    shoes: useFormal ? formalShoes : casualShoes,
    accessories,
  };
}
