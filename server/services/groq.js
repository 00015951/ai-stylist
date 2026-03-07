import OpenAI from "openai";

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

const SYSTEM_PROMPT = `You are an AI fashion stylist. Given an occasion, user profile, style preferences, and optional weather, suggest 1-5 outfit recommendations in JSON format.

Respond ONLY with valid JSON in this exact structure:
{
  "personaSummary": "1-2 sentences about why these looks suit the user",
  "outfits": [
    {
      "outfit": {
        "top": "specific item description",
        "bottom": "specific item description",
        "shoes": "specific item description",
        "accessories": "specific item description"
      },
      "whyItWorks": "1 sentence",
      "shopping": {
        "top": {"brands": ["A","B"], "stores": ["X","Y"]},
        "bottom": {...},
        "shoes": {...},
        "accessories": {...}
      }
    }
  ],
  "colorAdvice": "2-3 sentences on color choices for this occasion"
}

Use the first outfit from outfits array. Include 3-5 outfit options. Be specific and practical.`;

export async function generateStyle(params) {
  const {
    occasion,
    language = "en",
    profile = {},
    stylePreferences = [],
    weather,
    trendInspired = false,
  } = params;

  const langNote =
    language === "uz"
      ? "Respond in Uzbek (Latin)."
      : language === "ru"
        ? "Respond in Russian."
        : "Respond in English.";

  const userPrompt = `Occasion: ${occasion}
Profile: height ${profile.height ?? 170}cm, weight ${profile.weight ?? 70}kg, gender ${profile.gender ?? "other"}, body type ${profile.bodyType ?? "average"}
Style preferences: ${stylePreferences.join(", ") || "casual"}
${weather ? `Weather: ${weather.tempC}°C, ${weather.condition}${weather.city ? ` in ${weather.city}` : ""}` : ""}
${trendInspired ? "Include some 2025-2026 fashion trends." : ""}

${langNote} Return ONLY valid JSON, no markdown.`;

  try {
    if (!groq) return fallbackResponse(occasion, stylePreferences);
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim() || "{}";
    let parsed;
    try {
      const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = fallbackResponse(occasion, stylePreferences);
    }

    const first = parsed.outfits?.[0];
    return {
      personaSummary: parsed.personaSummary || "Here are your outfit recommendations.",
      occasion,
      outfits: parsed.outfits || [first],
      outfit: first?.outfit || parsed.outfit || fallbackOutfit(),
      imageUrl: getOutfitImage(stylePreferences[0]),
      colorAdvice: parsed.colorAdvice || "",
      shopping: first?.shopping,
    };
  } catch (err) {
    console.error("[Groq] Error:", err?.message || err);
    return fallbackResponse(occasion, stylePreferences);
  }
}

function fallbackOutfit() {
  return {
    top: "Cotton t-shirt or blouse",
    bottom: "Well-fitted jeans or chinos",
    shoes: "White sneakers or loafers",
    accessories: "Minimal watch, tote bag",
  };
}

function fallbackResponse(occasion, stylePreferences) {
  const pref = stylePreferences[0] || "casual";
  return {
    personaSummary: `Based on your occasion "${occasion}", here are outfit ideas tailored to ${pref} style.`,
    occasion,
    outfits: [
      {
        outfit: fallbackOutfit(),
        whyItWorks: "Versatile and comfortable for most occasions.",
        shopping: {
          top: { brands: ["Uniqlo", "Zara"], stores: ["Uniqlo", "H&M"] },
          bottom: { brands: ["Levi's", "Gap"], stores: ["Zara", "ASOS"] },
          shoes: { brands: ["Nike", "Converse"], stores: ["ASOS", "Zalando"] },
          accessories: { brands: ["Fossil", "Muji"], stores: ["Amazon", "ASOS"] },
        },
      },
    ],
    outfit: fallbackOutfit(),
    imageUrl: getOutfitImage(pref),
    colorAdvice: "Neutrals work well. Add one accent color.",
    shopping: {
      top: { brands: ["Uniqlo", "Zara"], stores: ["Uniqlo", "H&M"] },
      bottom: { brands: ["Levi's", "Gap"], stores: ["Zara", "ASOS"] },
      shoes: { brands: ["Nike", "Converse"], stores: ["ASOS", "Zalando"] },
      accessories: { brands: ["Fossil", "Muji"], stores: ["Amazon", "ASOS"] },
    },
  };
}

const OUTFIT_IMAGES = {
  casual: "https://stockmann.ru/istk/kJ7eucI5BKCWPSIXgC6-J6sYcfhkiSpQRKukKT5p4jA/rs:fill:747::1/g:no/bG9jYWw6Ly8vdXBsb2FkLy9jbXMvc3RhdGljL2Zhc2hpb24tYmxvZy9hcnRpY2xlLzY3ZDk4YzkzNzRkMWMyNzA2OTAzZDMyYy9ibG9jay82N2Q5OGU1OTBhNzliMWQ1MjgwMjVkZTMvaWVhdGlYN3dYMDg1NnAwSU9ZWWw0MWY3SUFRYldKcmN1c2VURWNtcy5qcGc.jpg",
  business: "https://raslov.ua/wp-content/uploads/2022/02/aksessuary-pod-delovoj-stil-zhenshhiny-min.jpg",
  streetwear: "https://techwear-outfits.com/cdn/shop/files/womens-streetwear-pants-techwear-458.webp",
  elegant: "https://www.myfashionlife.com/wp-content/uploads/2023/03/elegantandclassy_5-1-819x1024.jpg",
  sporty: "https://images.pexels.com/photos/7235677/pexels-photo-7235677.jpeg",
  bohemian: "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg",
};

function getOutfitImage(pref) {
  return OUTFIT_IMAGES[pref] || OUTFIT_IMAGES.casual;
}
