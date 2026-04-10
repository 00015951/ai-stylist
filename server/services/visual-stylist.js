/**
 * Visual Stylist Service — powered by Groq compound-beta
 *
 * compound-beta has built-in web search (Exa + Tavily) and can visit websites.
 * It searches the internet for:
 *  1. Fashion editorial/lookbook images (Pinterest, Vogue, fashion sites)
 *  2. Real product listings on Uzum.uz, Wildberries.uz, Trendyol, AliExpress
 * Returns structured JSON with 3 complete looks.
 */

import OpenAI from "openai";

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

const SYSTEM_PROMPT = `You are a world-class AI fashion stylist with real-time internet access.

When given a fashion request, you MUST:
1. Search the internet for 3 different inspiring fashion outfit photos (from Pinterest, Vogue, ELLE, Lookbook, fashion blogs)
2. Create 3 complete, diverse outfit looks based on web search results
3. For each outfit item (top, bottom, shoes, accessories), search Uzum.uz OR Wildberries.uz OR Trendyol.com for real products and get actual product page URLs

IMPORTANT RULES:
- Search for REAL product pages (not just search result pages)
- Uzum.uz product URLs look like: https://uzum.uz/uz/product/PRODUCT-NAME-123456
- Wildberries.uz product URLs look like: https://www.wildberries.uz/catalog/123456/detail.aspx
- Trendyol URLs look like: https://www.trendyol.com/brand/product-p-123456
- For images: find direct image URLs (.jpg .png .webp) from Pinterest (i.pinimg.com) or fashion sites
- Return ONLY valid JSON. No markdown. No text before or after JSON. Just the JSON object.`;

function buildPrompt(userRequest, language, profile = {}) {
  const langNote =
    language === "uz"
      ? "Respond in Uzbek language."
      : language === "ru"
        ? "Respond in Russian language."
        : "Respond in English.";

  const profileNote = profile.gender
    ? `User: ${profile.gender}, ${profile.height || 170}cm, ${profile.weight || 60}kg, body type: ${profile.bodyType || "average"}, budget: ${profile.budget || "medium"}.`
    : "";

  const season = (() => {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return "spring";
    if (m >= 6 && m <= 8) return "summer";
    if (m >= 9 && m <= 11) return "autumn";
    return "winter";
  })();

  return `${langNote} ${profileNote}

User wants fashion looks for: "${userRequest}"
Current season: ${season} 2025

Please do the following:
1. Search the web for 3 different inspiring outfit images matching "${userRequest}" (search Pinterest, Vogue, fashion blogs)
2. For each look, search Uzum.uz, Wildberries.uz, or Trendyol for real products matching each item
3. Get actual product page URLs (not search pages) and product image URLs where possible

Return EXACTLY this JSON structure (no markdown, no text, just JSON):
{
  "summary": "2-sentence description of the style direction for this request",
  "looks": [
    {
      "id": 1,
      "title": "Look name (e.g. Casual Chic, Street Style, Elegant Evening)",
      "imageUrl": "REAL image URL from web search - must be a direct image URL from Pinterest (i.pinimg.com) or fashion magazine",
      "style": "casual|elegant|streetwear|sporty|bohemian|business",
      "whyItWorks": "1-2 sentences why this look works, in ${language === "uz" ? "Uzbek" : language === "ru" ? "Russian" : "English"}",
      "colorPalette": "main colors used",
      "items": [
        {
          "type": "top",
          "name": "specific product name in ${language === "uz" ? "Uzbek" : language === "ru" ? "Russian" : "English"}",
          "nameEn": "product name in English for searching",
          "shopName": "Uzum.uz",
          "shopUrl": "https://uzum.uz/uz/product/REAL-PRODUCT-URL",
          "imageUrl": "product image URL if found, otherwise null",
          "price": "approximate price range (e.g. 150,000-300,000 so'm)"
        },
        {
          "type": "bottom",
          "name": "specific product name",
          "nameEn": "product name in English",
          "shopName": "Wildberries.uz",
          "shopUrl": "https://www.wildberries.uz/catalog/REAL-ID/detail.aspx",
          "imageUrl": "product image URL if found, otherwise null",
          "price": "approximate price range"
        },
        {
          "type": "shoes",
          "name": "specific shoe name",
          "nameEn": "shoe name in English",
          "shopName": "Trendyol",
          "shopUrl": "https://www.trendyol.com/REAL-PRODUCT-URL",
          "imageUrl": "product image URL if found, otherwise null",
          "price": "approximate price range"
        },
        {
          "type": "accessories",
          "name": "accessory name",
          "nameEn": "accessory name in English",
          "shopName": "AliExpress",
          "shopUrl": "https://www.aliexpress.com/item/REAL-ITEM-ID.html",
          "imageUrl": "product image URL if found, otherwise null",
          "price": "approximate price range"
        }
      ]
    }
  ]
}

Make all 3 looks DIFFERENT from each other. Vary the style, colors, and silhouette.`;
}

function parseJsonFromText(text) {
  if (!text) return null;
  try {
    // Remove markdown fences
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    // Find the first { and last }
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;

    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function buildFallbackSearchUrl(shopName, itemName) {
  const q = encodeURIComponent(itemName);
  const map = {
    "Uzum.uz": `https://uzum.uz/uz/search?query=${q}`,
    "Wildberries.uz": `https://www.wildberries.uz/catalog/0/search.aspx?search=${q}`,
    Trendyol: `https://www.trendyol.com/sr?q=${q}`,
    AliExpress: `https://www.aliexpress.com/wholesale?SearchText=${q}`,
    SHEIN: `https://www.shein.com/pdsearch/${q}/`,
    "Lamoda.uz": `https://www.lamoda.uz/catalogsearch/result/?q=${q}`,
  };
  return map[shopName] || `https://uzum.uz/uz/search?query=${q}`;
}

// Validate and sanitize a look returned by the model
function sanitizeLooks(looks = []) {
  const storeRota = ["Uzum.uz", "Wildberries.uz", "Trendyol", "AliExpress"];
  return looks.map((look, li) => ({
    id: look.id ?? li + 1,
    title: look.title || `Look ${li + 1}`,
    imageUrl: look.imageUrl || null,
    style: look.style || "casual",
    whyItWorks: look.whyItWorks || "",
    colorPalette: look.colorPalette || "",
    items: (look.items || []).map((item, ii) => {
      const shopName = item.shopName || storeRota[ii % storeRota.length];
      const shopUrl =
        item.shopUrl && item.shopUrl.startsWith("http") && !item.shopUrl.includes("search?query") && !item.shopUrl.includes("SearchText")
          ? item.shopUrl
          : buildFallbackSearchUrl(shopName, item.nameEn || item.name || "fashion item");
      return {
        type: item.type || "top",
        name: item.name || item.nameEn || "Fashion item",
        shopName,
        shopUrl,
        imageUrl: item.imageUrl && item.imageUrl.startsWith("http") ? item.imageUrl : null,
        price: item.price || null,
      };
    }),
  }));
}

export async function generateVisualLooks(userRequest, language = "uz", profile = {}) {
  if (!groq) {
    return {
      error: "GROQ_API_KEY not configured",
      looks: [],
      summary: "",
    };
  }

  try {
    const prompt = buildPrompt(userRequest, language, profile);

    const response = await groq.chat.completions.create({
      model: "compound-beta",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 5000,
    });

    const rawContent = response.choices[0]?.message?.content || "";
    console.log("[VisualStylist] Raw response length:", rawContent.length);

    const parsed = parseJsonFromText(rawContent);

    if (!parsed || !Array.isArray(parsed.looks) || parsed.looks.length === 0) {
      console.warn("[VisualStylist] Failed to parse JSON, raw:", rawContent.slice(0, 300));
      return {
        error: "Could not parse looks from AI response",
        rawResponse: rawContent.slice(0, 500),
        looks: [],
        summary: "",
      };
    }

    return {
      summary: parsed.summary || "",
      looks: sanitizeLooks(parsed.looks),
    };
  } catch (err) {
    console.error("[VisualStylist] Error:", err?.message || err);
    return {
      error: err?.message || "Unknown error",
      looks: [],
      summary: "",
    };
  }
}
