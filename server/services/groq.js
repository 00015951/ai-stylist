import OpenAI from "openai";

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

const DEFAULT_CHAT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/* ------------------------------------------------------------------ */
/* Season & Date helpers                                               */
/* ------------------------------------------------------------------ */

function getCurrentSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

function getCurrentMonthYear() {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* Fashion context                                                      */
/* ------------------------------------------------------------------ */

const FASHION_TRENDS_2026 = `2026 Spring/Summer Trending:
- Quiet luxury: minimalist clean lines, neutral tones (beige, ivory, camel, cream, sand)
- Dopamine dressing: bold vibrant colors (electric yellow, coral orange, cobalt blue, fuchsia)
- Utility aesthetic: cargo pants/jackets, functional pockets, relaxed military-inspired
- Sheer & translucent layering: mesh tops, organza over basics, see-through fabrics
- Oversized blazers with strong structured shoulders
- Wide-leg and barrel-leg trousers, flared denim
- Platform shoes, chunky loafers, Mary Janes, kitten heels, ballet flats
- Crochet and knit textures for tops and bags
- Monochromatic head-to-toe color looks
- Y2K revival: metallic accents, butterfly details, low-rise cuts, mini skirts
- Linen, cotton and breathable natural fabrics
- Athleisure fusion: elevated sporty pieces for everyday`;

/* ------------------------------------------------------------------ */
/* Shopping link builders (Uzbekistan + International)                */
/* ------------------------------------------------------------------ */

const SHOPS = [
  {
    store: "Uzum",
    buildUrl: (q) => `https://uzum.uz/uz/search?query=${q}`,
    label: "Uzum.uz",
    flag: "🇺🇿",
  },
  {
    store: "Wildberries",
    buildUrl: (q) => `https://www.wildberries.uz/catalog/0/search.aspx?search=${q}`,
    label: "Wildberries.uz",
    flag: "🇺🇿",
  },
  {
    store: "AliExpress",
    buildUrl: (q) => `https://www.aliexpress.com/wholesale?SearchText=${q}`,
    label: "AliExpress",
    flag: "🌍",
  },
  {
    store: "Trendyol",
    buildUrl: (q) => `https://www.trendyol.com/sr?q=${q}`,
    label: "Trendyol",
    flag: "🌍",
  },
  {
    store: "Lamoda",
    buildUrl: (q) => `https://www.lamoda.uz/catalogsearch/result/?q=${q}`,
    label: "Lamoda.uz",
    flag: "🇺🇿",
  },
  {
    store: "SHEIN",
    buildUrl: (q) => `https://www.shein.com/pdsearch/${q}/`,
    label: "SHEIN",
    flag: "🌍",
  },
];

function buildItemShoppingLinks(itemName) {
  if (!itemName) return null;
  // Use a concise query: take first 6 words of the item name for cleaner search results
  const shortName = itemName.split(" ").slice(0, 6).join(" ");
  const query = encodeURIComponent(shortName);
  return {
    brands: [],
    stores: SHOPS.map((s) => s.store),
    links: SHOPS.map((s) => ({
      store: s.store,
      url: s.buildUrl(query),
      label: `${s.flag} ${s.label}`,
    })),
  };
}

function buildOutfitShopping(outfit) {
  if (!outfit) return null;
  return {
    top: buildItemShoppingLinks(outfit.top),
    bottom: buildItemShoppingLinks(outfit.bottom),
    shoes: buildItemShoppingLinks(outfit.shoes),
    accessories: buildItemShoppingLinks(outfit.accessories),
  };
}

/* ------------------------------------------------------------------ */
/* Placeholder images by mood                                          */
/* ------------------------------------------------------------------ */

// Curated high-quality editorial fashion photos (Unsplash CDN — no API key needed).
// Multiple per occasion/style so each Look tab shows a unique, relevant photo (cycled by idx).
const PLACEHOLDER_IMAGES = {
  // ── Occasion-specific ──────────────────────────────────────────────
  university: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=768&h=1024&fit=crop&q=85",
  ],
  party: [
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=768&h=1024&fit=crop&q=85",
  ],
  date: [
    "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=768&h=1024&fit=crop&q=85",
  ],
  work: [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85",
  ],
  wedding: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=768&h=1024&fit=crop&q=85",
  ],
  travel: [
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=768&h=1024&fit=crop&q=85",
  ],
  // ── Style-specific ─────────────────────────────────────────────────
  casual: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=768&h=1024&fit=crop&q=85",
  ],
  business: [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85",
  ],
  streetwear: [
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=768&h=1024&fit=crop&q=85",
  ],
  elegant: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=768&h=1024&fit=crop&q=85",
  ],
  sporty: [
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=768&h=1024&fit=crop&q=85",
  ],
  bohemian: [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=768&h=1024&fit=crop&q=85",
  ],
  minimalist: [
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=768&h=1024&fit=crop&q=85",
  ],
  vintage: [
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=768&h=1024&fit=crop&q=85",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=768&h=1024&fit=crop&q=85",
  ],
};

/* ------------------------------------------------------------------ */
/* Fashion image lookup — occasion + style → curated Unsplash photo   */
/* ------------------------------------------------------------------ */

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Map common Uzbek/Russian occasion words to English for better Unsplash search results
const OCCASION_EN_MAP = [
  [/свидани|ужин|kechki uchrashuv/i, "romantic dinner date night outfit fashion"],
  [/вечеринк|party|ziyofat|tadbir/i, "party night out fashion outfit"],
  [/офис|work|ish|meeting|interview/i, "business professional office outfit fashion"],
  [/свадьб|nikoh|to.?y|wedding/i, "wedding formal elegant outfit fashion"],
  [/универ|student|campus|talaba/i, "casual university student outfit fashion"],
  [/sayohat|travel|trip|airport/i, "travel airport casual outfit fashion"],
  [/спорт|sport|athletic/i, "sporty athletic outfit fashion"],
];

function buildSearchQuery(occasionStr = "", stylePreferences = [], outfit = {}) {
  const occ = (occasionStr || "").split(/[/,]/)[0].trim();
  // Check if occasion maps to a known English query
  for (const [pattern, engQuery] of OCCASION_EN_MAP) {
    if (pattern.test(occ)) return engQuery;
  }
  // Fallback: combine outfit top + style + occasion
  const style = stylePreferences[0] ?? "casual";
  const topHint = (outfit.top || "").split(" ").slice(0, 4).join(" ");
  return [topHint, occ, style, "fashion editorial outfit"].filter(Boolean).join(" ");
}

/**
 * Returns the best image URL for an outfit.
 * Priority: Unsplash API search (free key) → curated occasion-matched fallback.
 * Zero extra LLM tokens — imageSearch query comes from the main outfit generation JSON.
 */
async function fetchUnsplashImage(outfit = {}, stylePreferences = [], occasion = "", idx = 0) {
  // 1. Try Unsplash API (needs UNSPLASH_ACCESS_KEY — free at unsplash.com/developers)
  if (UNSPLASH_KEY) {
    try {
      const query = outfit._imageSearch || buildSearchQuery(occasion, stylePreferences, outfit);
      const params = new URLSearchParams({
        query,
        orientation: "portrait",
        content_filter: "high",
        page: String(idx + 1),
        per_page: "1",
      });
      const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
        headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      });
      if (res.ok) {
        const data = await res.json();
        const url = data?.results?.[0]?.urls?.regular;
        if (url) return url;
      }
    } catch { /* fall through */ }
  }

  // 2. Curated occasion/style-matched fallback (no key needed, always works)
  return getPlaceholderImage(stylePreferences, occasion, idx);
}

/**
 * Returns a curated editorial Unsplash image matched to occasion + style.
 * Each outfit idx gets a different image → unique per Look tab.
 */
function getPlaceholderImage(stylePreferences = [], occasion = "", idx = 0) {
  const occ = (occasion || "").toLowerCase();
  const pref = (stylePreferences[0] || "casual").toLowerCase();

  let arr;

  // Occasion-first matching (most specific)
  if (occ.includes("university") || occ.includes("universite") || occ.includes("talaba") || occ.includes("student") || occ.includes("school") || occ.includes("campus") || occ.includes("akadem")) {
    arr = PLACEHOLDER_IMAGES.university;
  } else if (occ.includes("party") || occ.includes("ziyofat") || occ.includes("вечеринк") || occ.includes("tadbir") || occ.includes("club") || occ.includes("concert")) {
    arr = PLACEHOLDER_IMAGES.party;
  } else if (occ.includes("date") || occ.includes("uchrashuv") || occ.includes("свидание") || occ.includes("ужин") || occ.includes("dinner") || occ.includes("kechki") || occ.includes("romantic") || occ.includes("restoran")) {
    arr = PLACEHOLDER_IMAGES.date;
  } else if (occ.includes("work") || occ.includes("office") || occ.includes("ish") || occ.includes("офис") || occ.includes("деловой") || occ.includes("meeting") || occ.includes("business") || occ.includes("intervyu") || occ.includes("interview")) {
    arr = PLACEHOLDER_IMAGES.work;
  } else if (occ.includes("wedding") || occ.includes("nikoh") || occ.includes("свадьба") || occ.includes("to'y") || occ.includes("toy") || occ.includes("engagement")) {
    arr = PLACEHOLDER_IMAGES.wedding;
  } else if (occ.includes("travel") || occ.includes("sayohat") || occ.includes("путешест") || occ.includes("trip") || occ.includes("airport")) {
    arr = PLACEHOLDER_IMAGES.travel;
  } else if (pref === "streetwear" || pref === "street") {
    arr = PLACEHOLDER_IMAGES.streetwear;
  } else if (pref === "sporty" || pref === "sport" || pref === "athletic") {
    arr = PLACEHOLDER_IMAGES.sporty;
  } else if (pref === "elegant" || pref === "formal") {
    arr = PLACEHOLDER_IMAGES.elegant;
  } else if (pref === "business") {
    arr = PLACEHOLDER_IMAGES.business;
  } else if (pref === "bohemian" || pref === "boho") {
    arr = PLACEHOLDER_IMAGES.bohemian;
  } else if (pref === "minimalist" || pref === "minimal") {
    arr = PLACEHOLDER_IMAGES.minimalist;
  } else if (pref === "vintage") {
    arr = PLACEHOLDER_IMAGES.vintage;
  } else {
    arr = PLACEHOLDER_IMAGES.casual;
  }

  return arr[idx % arr.length];
}

/* ------------------------------------------------------------------ */
/* System prompt builder                                               */
/* ------------------------------------------------------------------ */

function buildSystemPrompt(season, monthYear) {
  return `You are a warm, knowledgeable AI fashion stylist. Today: ${monthYear} (${season} season).

${FASHION_TRENDS_2026}

Task: given occasion, user profile, style preferences, and optional weather — generate 3-5 DIVERSE, UNIQUE outfit options.
- CRITICAL: Each request must produce COMPLETELY DIFFERENT outfits — vary colors, silhouettes, fabrics, styles
- Use SPECIFIC, SEARCHABLE product names (e.g. "white linen oversized button-up shirt", "beige barrel-leg trousers")
- Names should be easy to search on Uzum.uz, AliExpress, Trendyol, Wildberries
- Be warm, encouraging, and practical
- Always consider the current ${season} season in fabric/color choices
- Make each outfit visually distinct from the others (different color palette, different vibe)
- Respond in the same language as the user prompt

Return ONLY valid JSON (no markdown fences, no extra text):
{
  "personaSummary": "Warm 1-2 sentences why these outfits are perfect for this person and occasion",
  "outfits": [
    {
      "outfit": {
        "top": "specific searchable item name",
        "bottom": "specific searchable item name",
        "shoes": "specific searchable item name",
        "accessories": "specific searchable item name"
      },
      "whyItWorks": "One warm encouraging sentence explaining why this outfit works",
      "imageSearch": "3-5 English keywords for Unsplash image search that best represents this look visually, e.g. 'elegant evening dress woman fashion editorial'"
    }
  ],
  "colorAdvice": "2-3 sentences on colors that work beautifully for this ${season} occasion"
}`;
}

/* ------------------------------------------------------------------ */
/* Markdown reply builder (for forceGenerate)                          */
/* ------------------------------------------------------------------ */

export function buildGenerateReply(language, occasion, result) {
  const season = getCurrentSeason();
  const first = result?.outfits?.[0];
  const shops = "**Uzum.uz**, **Wildberries.uz**, **Trendyol**, **AliExpress**, **SHEIN**";

  if (language === "uz") {
    return [
      `## Lookingiz tayyor! ✨`,
      ``,
      result.personaSummary,
      ``,
      first
        ? [
            `**Asosiy look:**`,
            `- 👕 Ustki: ${first.outfit.top}`,
            `- 👖 Pastki: ${first.outfit.bottom}`,
            `- 👟 Oyoq kiyim: ${first.outfit.shoes}`,
            `- 💍 Aksessuarlar: ${first.outfit.accessories}`,
          ].join("\n")
        : "",
      ``,
      `🛍️ Kiyimlarni ${shops} dan topishingiz mumkin.`,
      result.colorAdvice ? `\n🎨 ${result.colorAdvice}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (language === "ru") {
    return [
      `## Ваш образ готов! ✨`,
      ``,
      result.personaSummary,
      ``,
      first
        ? [
            `**Основной образ:**`,
            `- 👕 Верх: ${first.outfit.top}`,
            `- 👖 Низ: ${first.outfit.bottom}`,
            `- 👟 Обувь: ${first.outfit.shoes}`,
            `- 💍 Аксессуары: ${first.outfit.accessories}`,
          ].join("\n")
        : "",
      ``,
      `🛍️ Найдите эти вещи на ${shops}.`,
      result.colorAdvice ? `\n🎨 ${result.colorAdvice}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `## Your look is ready! ✨`,
    ``,
    result.personaSummary,
    ``,
    first
      ? [
          `**Featured outfit:**`,
          `- 👕 Top: ${first.outfit.top}`,
          `- 👖 Bottom: ${first.outfit.bottom}`,
          `- 👟 Shoes: ${first.outfit.shoes}`,
          `- 💍 Accessories: ${first.outfit.accessories}`,
        ].join("\n")
      : "",
    ``,
    `🛍️ Shop these items on ${shops}.`,
    result.colorAdvice ? `\n🎨 ${result.colorAdvice}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* Main generateStyle export                                           */
/* ------------------------------------------------------------------ */

export async function generateStyle(params) {
  const {
    occasion,
    language = "en",
    profile = {},
    stylePreferences = [],
    weather,
    trendInspired = false,
  } = params;

  const season = getCurrentSeason();
  const monthYear = getCurrentMonthYear();

  const langNote =
    language === "uz"
      ? "Respond in Uzbek (Latin script)."
      : language === "ru"
        ? "Respond in Russian."
        : "Respond in English.";

  const weatherLine = weather
    ? `Current weather: ${weather.tempC}°C, ${weather.condition}${weather.city ? ` in ${weather.city}` : ""}. Choose clothing appropriate for this weather.`
    : `Season: ${season}. Choose ${season}-appropriate, comfortable clothing.`;

  const variationSeed = Math.floor(Math.random() * 1000);
  const colorVariants = [
    "Focus on warm earthy tones (terracotta, rust, camel).",
    "Focus on cool neutral palette (grey, slate, ivory).",
    "Include one bold statement color piece.",
    "Go monochromatic with tonal dressing.",
    "Mix prints and textures for visual interest.",
    "Keep it minimal and clean-lined.",
    "Use vibrant dopamine dressing colors.",
    "Embrace relaxed oversized silhouettes.",
  ];
  const colorHint = colorVariants[variationSeed % colorVariants.length];

  const userPrompt = `Occasion: ${occasion}
Profile: height ${profile.height ?? 170}cm, weight ${profile.weight ?? 70}kg, gender ${profile.gender ?? "other"}, body type ${profile.bodyType ?? "average"}
Style: ${stylePreferences.join(", ") || "casual"}
Budget: ${profile.budget ?? "medium"}
${weatherLine}
${trendInspired ? "Include 2026 spring/summer trends in the outfits." : ""}
Style direction for this session: ${colorHint}
Variation seed: ${variationSeed} — use this to ensure completely fresh outfit ideas.
${langNote} Return ONLY valid JSON.`;

  try {
    if (!groq) return fallbackResponse(occasion, stylePreferences, season);

    const completion = await groq.chat.completions.create({
      model: DEFAULT_CHAT_MODEL,
      messages: [
        { role: "system", content: buildSystemPrompt(season, monthYear) },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.95,
      max_tokens: 2048,
    });

    const text =
      completion.choices[0]?.message?.content?.trim() || "{}";
    let parsed;
    try {
      const cleaned = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }

    if (!parsed || !Array.isArray(parsed.outfits) || !parsed.outfits.length) {
      return fallbackResponse(occasion, stylePreferences, season);
    }

    const outfitsWithLinks = await Promise.all(
      parsed.outfits.map(async (o, idx) => {
        // Pass AI's imageSearch hint into the outfit object for fetchUnsplashImage
        const outfitWithHint = { ...o.outfit, _imageSearch: o.imageSearch || "" };
        const imageUrl = await fetchUnsplashImage(
          outfitWithHint,
          stylePreferences,
          occasion,
          idx
        );
        return {
          ...o,
          imageUrl,
          shopping: buildOutfitShopping(o.outfit),
        };
      })
    );

    const first = outfitsWithLinks[0];
    return {
      personaSummary:
        parsed.personaSummary || "Here are your outfit recommendations!",
      occasion,
      outfits: outfitsWithLinks,
      outfit: first?.outfit || fallbackOutfit(),
      imageUrl: first?.imageUrl || getPlaceholderImage(stylePreferences, occasion),
      colorAdvice: parsed.colorAdvice || "",
      shopping: first?.shopping || null,
    };
  } catch (err) {
    console.error("[Groq] Error:", err?.message || err);
    return fallbackResponse(occasion, stylePreferences, season);
  }
}

/* ------------------------------------------------------------------ */
/* Fallback helpers                                                     */
/* ------------------------------------------------------------------ */

function fallbackOutfit() {
  return {
    top: "White cotton oversized t-shirt",
    bottom: "Beige straight-leg chinos",
    shoes: "White leather sneakers",
    accessories: "Minimal watch, canvas tote bag",
  };
}

function fallbackResponse(occasion, stylePreferences, season = "spring") {
  const outfit = fallbackOutfit();
  return {
    personaSummary: `Great choice! Here are some fresh ${season} outfit ideas for "${occasion}" — you'll look amazing!`,
    occasion,
    outfits: [
      {
        outfit,
        whyItWorks: "Versatile, comfortable and perfect for the occasion.",
        imageUrl: getPlaceholderImage(stylePreferences || [], occasion),
        shopping: buildOutfitShopping(outfit),
      },
    ],
    outfit,
    imageUrl: getPlaceholderImage(stylePreferences || [], occasion),
    colorAdvice: `For ${season}, neutrals and earth tones look fresh and polished. Add one pop of color for personality.`,
    shopping: buildOutfitShopping(outfit),
  };
}
