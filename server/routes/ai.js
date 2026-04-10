import { Router } from "express";
import { db } from "../db/init.js";
import OpenAI from "openai";
import { generateStyle, buildGenerateReply } from "../services/groq.js";

const router = Router();

const groq = process.env.GROQ_API_KEY
  ? new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

/* ------------------------------------------------------------------ */
/* Robust JSON extractor                                               */
/* AI sometimes returns JSON without outer {}, or with extra text      */
/* ------------------------------------------------------------------ */

function extractJson(raw) {
  if (!raw) return null;

  // 1. Strip markdown code fences
  let text = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // 2. Direct parse
  try { return JSON.parse(text); } catch {}

  // 3. Find first complete JSON object { ... }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }

  // 4. Missing braces — try wrapping
  if (text.includes('"reply"')) {
    try { return JSON.parse(`{${text}}`); } catch {}
  }

  // 5. Regex extract key fields
  const replyMatch = text.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
  if (replyMatch) {
    const actionMatch  = text.match(/"action"\s*:\s*"([^"]+)"/);
    const occasionMatch = text.match(/"occasion"\s*:\s*"([^"]+)"/);
    const askMatch     = text.match(/"askWeather"\s*:\s*(true|false)/);
    return {
      reply: replyMatch[1]
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"'),
      action: actionMatch?.[1] ?? "chat",
      occasion: occasionMatch?.[1] ?? "",
      askWeather: askMatch?.[1] === "true",
    };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function safeLang(language) {
  return language === "uz" || language === "ru" ? language : "en";
}

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

function mapEventToOccasion(defaultEvent, language) {
  const lang = safeLang(language);
  const v = (defaultEvent || "any").toLowerCase();
  if (v === "work") return lang === "uz" ? "Ish/ofis uchun" : lang === "ru" ? "Для офиса/работы" : "For work / office";
  if (v === "date") return lang === "uz" ? "Uchrashuv uchun" : lang === "ru" ? "Для свидания" : "For a date";
  if (v === "weekend") return lang === "uz" ? "Dam olish/ko'chaga chiqish" : lang === "ru" ? "Для выходного дня" : "For the weekend";
  if (v === "sport") return lang === "uz" ? "Sport/mashg'ulot uchun" : lang === "ru" ? "Для спорта/тренировки" : "For sport / training";
  if (v === "party") return lang === "uz" ? "Ziyofat/tadbir uchun" : lang === "ru" ? "Для вечеринки/ивента" : "For a party / event";
  if (v === "travel") return lang === "uz" ? "Sayohat uchun" : lang === "ru" ? "Для путешествия" : "For travel";
  if (v && v !== "any") return v;
  return lang === "uz" ? "Istalgan holat uchun" : lang === "ru" ? "Для любой ситуации" : "For any occasion";
}

function getStylesByKeys(keys) {
  try {
    const rows = db.prepare("SELECT * FROM styles ORDER BY id").all();
    const set = new Set((keys || []).map((k) => String(k || "").toLowerCase()).filter(Boolean));
    const result = [];
    for (const r of rows) {
      const key = String(r.key || "").toLowerCase();
      if (set.has(key)) {
        result.push({
          id: r.id,
          key: r.key,
          name: { en: r.name_en, ru: r.name_ru, uz: r.name_uz },
          imageUrl: r.image_url,
          description: r.description,
        });
      }
    }
    return result;
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Chat system prompt                                                  */
/* ------------------------------------------------------------------ */

function buildChatSystemPrompt(language, season, monthYear) {
  const TRENDS_SHORT =
    "2026 Trends: quiet luxury, dopamine colors, utility aesthetic, wide-leg trousers, platform shoes, Y2K revival.";

  const jsonSchema = `IMPORTANT: You MUST return a single valid JSON object and NOTHING else — no explanations, no markdown fences, no text before or after.
The JSON must start with { and end with }.

Schema:
{
  "reply": "your friendly message here (markdown allowed: **bold**, *italic*, ## heading, - list, [text](url))",
  "action": "chat",
  "occasion": "",
  "stylePreferences": [],
  "askWeather": false
}
Set action to "generate" only when user clearly requests an outfit/look AND you know the occasion.
Set askWeather to true only when you are asking the user for their city.`;

  if (language === "uz") {
    return `Siz "Styla" — do'stona va zamonaviy AI fashion stylist assistentisiz.
Hozirgi sana: ${monthYear} (${season} fasli, O'zbekiston).
${TRENDS_SHORT}

Qoidalar:
- Foydalanuvchi bilan issiq, do'stona gaplash 😊
- Kayfiyati va vaziyati haqida so'ra
- Ob-havo noma'lum bo'lsa, "Qaysi shahrdasiz? 🌤️" deb so'ra va askWeather: true qo'y
- Kiyim maslahatlarida aniq, do'konlarda topsa bo'ladigan nomlar ishlat
- Uzum.uz, Wildberries.uz, Trendyol, AliExpress, SHEIN do'konlarini tavsiya qil
- ${season} fasliga mos kiyimlar taklif qil
- reply da markdown ishlat: **qalin**, *kursiv*, ## sarlavha, - ro'yxat

${jsonSchema}`;
  }

  if (language === "ru") {
    return `Вы — "Styla", дружелюбный AI-стилист.
Текущая дата: ${monthYear} (сезон: ${season}, Узбекистан).
${TRENDS_SHORT}

Правила:
- Общайтесь тепло и по-дружески 😊
- Спрашивайте о настроении и поводе
- Если город неизвестен, спросите "В каком вы городе? 🌤️" и поставьте askWeather: true
- Используйте конкретные, поисковые названия вещей
- Упоминайте Uzum.uz, Wildberries.uz, Trendyol, AliExpress, SHEIN
- Одежда по сезону (${season})
- В reply используйте markdown: **жирный**, *курсив*, ## заголовок, - список

${jsonSchema}`;
  }

  return `You are "Styla" — a warm, friendly AI fashion stylist.
Current date: ${monthYear} (${season} season, Uzbekistan).
${TRENDS_SHORT}

Guidelines:
- Be warm and friendly, like a stylish best friend 😊
- Ask about mood and occasion
- If city unknown, ask "What city are you in? 🌤️" and set askWeather: true
- Use specific, searchable product names
- Mention Uzum.uz, Wildberries.uz, Trendyol, AliExpress, SHEIN
- Season-appropriate clothing (${season})
- Use markdown in reply: **bold**, *italic*, ## heading, - list

${jsonSchema}`;
}

/* ------------------------------------------------------------------ */
/* POST /api/ai/onboarding-preview                                     */
/* ------------------------------------------------------------------ */

router.post("/onboarding-preview", async (req, res) => {
  try {
    const body = req.body || {};
    const language = safeLang(body.language);
    const profile = body.profile || {};
    const season = getCurrentSeason();
    const monthYear = getCurrentMonthYear();

    const p = {
      height: Number(profile.height ?? 170),
      weight: Number(profile.weight ?? 70),
      gender: String(profile.gender ?? "other"),
      bodyType: String(profile.bodyType ?? "average"),
      defaultEvent: String(profile.defaultEvent ?? "any"),
      budget: String(profile.budget ?? "medium"),
    };
    const eventText = mapEventToOccasion(p.defaultEvent, language);

    if (!groq) {
      const keys = body.stylePreferences?.length
        ? body.stylePreferences
        : ["casual", "business", "streetwear"];
      const styles = getStylesByKeys(keys);
      const previewResult = await generateStyle({
        occasion: eventText, language, profile: p, stylePreferences: keys,
      });
      return res.json({
        message:
          language === "uz"
            ? "Profilingizga qarab mos look'lar tayyorladim! 🎉 Qaysi uslub sizga yaqinroq?"
            : language === "ru"
              ? "Подобрала образы специально для вас! 🎉 Какой стиль вам ближе?"
              : "I've curated some looks just for you! 🎉 Which style speaks to you?",
        recommendedStyles: styles,
        previewResult,
      });
    }

    const sys =
      language === "uz"
        ? `Siz onboarding AI fashion stylist yordamchisiz. Hozir ${monthYear} (${season} fasli). Profilga qarab 2-4 ta style key tanlang va qisqa, issiq xabar bering. Faqat JSON.`
        : language === "ru"
          ? `Вы — AI стилист для онбординга. Сейчас ${monthYear} (сезон ${season}). По профилю выберите 2-4 style key и напишите тёплое сообщение. Только JSON.`
          : `You are an AI stylist for onboarding. Now ${monthYear} (${season} season). Pick 2-4 style keys and write a warm message. Return JSON only.`;

    const user = `Profile: height ${p.height}cm, weight ${p.weight}kg, gender ${p.gender}, bodyType ${p.bodyType}, event ${p.defaultEvent}, budget ${p.budget}, season ${season}.
Allowed style keys: casual, business, streetwear, elegant, sporty, bohemian.
Return: { "message": "warm personalized greeting", "styleKeys": ["casual", "elegant"] }`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "{}";
    const parsed = extractJson(text) || {};

    const styleKeys = Array.isArray(parsed.styleKeys) ? parsed.styleKeys : [];
    const uniqueKeys = [...new Set(styleKeys.map((k) => String(k).toLowerCase()))].filter(Boolean).slice(0, 4);
    const styles = getStylesByKeys(uniqueKeys.length ? uniqueKeys : ["casual", "business"]);
    const previewResult = await generateStyle({
      occasion: eventText, language, profile: p,
      stylePreferences: uniqueKeys.length ? uniqueKeys : ["casual"],
    });

    res.json({
      message: typeof parsed.message === "string" && parsed.message.trim() ? parsed.message.trim() : "",
      recommendedStyles: styles,
      previewResult,
    });
  } catch (err) {
    console.error("[ai/onboarding-preview]", err);
    res.status(500).json({ error: "AI preview failed" });
  }
});

/* ------------------------------------------------------------------ */
/* POST /api/ai/chat                                                   */
/* Body: { language?, context?, messages: [{role, content}] }          */
/* context.forceGenerate = true → skip classification, go direct       */
/* ------------------------------------------------------------------ */

router.post("/chat", async (req, res) => {
  try {
    const body = req.body || {};
    const language = safeLang(body.language);
    const context = body.context || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const season = getCurrentSeason();
    const monthYear = getCurrentMonthYear();

    const profile = context.profile || {};
    const stylePreferences = Array.isArray(context.stylePreferences) ? context.stylePreferences : [];
    const defaultEvent = context.defaultEvent || profile.defaultEvent || "any";
    const budget = context.budget || profile.budget || "medium";
    const weather = context.weather || null;
    const trendInspired = context.trendInspired || false;
    const forceGenerate = context.forceGenerate === true;

    /* ---- forceGenerate path: skip chat AI, call generateStyle directly ---- */
    if (forceGenerate) {
      const lastMsg = messages[messages.length - 1]?.content || "";
      const occasion = lastMsg.trim() || mapEventToOccasion(defaultEvent, language);
      const sp = stylePreferences.length ? stylePreferences : ["casual"];

      const result = await generateStyle({
        occasion,
        language,
        profile,
        stylePreferences: sp,
        weather: weather || undefined,
        trendInspired,
      });

      try {
        const preview = result.personaSummary?.slice(0, 200) || occasion || "";
        db.prepare(
          "INSERT INTO ai_requests (user_id, occasion, response_preview) VALUES (?, ?, ?)"
        ).run(null, occasion || null, preview);
      } catch (_) {}

      const reply = buildGenerateReply(language, occasion, result);
      return res.json({ reply, result, action: "generate" });
    }

    /* ---- Normal chat path ---- */
    const systemPrompt = buildChatSystemPrompt(language, season, monthYear);

    const contextBlock = `User:
- gender: ${profile.gender ?? "not specified"}, height: ${profile.height ?? 170}cm, weight: ${profile.weight ?? 70}kg, bodyType: ${profile.bodyType ?? "average"}
- defaultEvent: ${defaultEvent}, budget: ${budget}
- stylePrefs: ${stylePreferences.join(", ") || "none"}
- season: ${season} (${monthYear})
${weather ? `- weather: ${weather.tempC}°C, ${weather.condition}${weather.city ? ` in ${weather.city}` : ""}` : "- weather: unknown"}
${trendInspired ? "- wants trend-inspired 2026 look" : ""}`;

    if (!groq) {
      const defaultReplies = {
        uz: "Salom! 👋 Bugun qaysi vaziyat uchun kiyim izlaymiz? 😊",
        ru: "Привет! 👋 Для какого случая подбираем образ? 😊",
        en: "Hey! 👋 What are we styling for today? 😊",
      };
      return res.json({ reply: defaultReplies[language] || defaultReplies.en, action: "chat" });
    }

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: contextBlock },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || ""),
        })),
      ],
      temperature: 0.72,
      max_tokens: 1024,
    });

    const rawText = completion.choices?.[0]?.message?.content?.trim() || "{}";
    const parsed = extractJson(rawText) || { reply: rawText, action: "chat" };

    const action = parsed.action === "generate" ? "generate" : "chat";
    const reply = typeof parsed.reply === "string" ? parsed.reply : "";
    const askWeather = parsed.askWeather === true;

    if (action === "generate") {
      const occasion =
        String(parsed.occasion || "").trim() ||
        mapEventToOccasion(defaultEvent, language);
      const sp =
        Array.isArray(parsed.stylePreferences) && parsed.stylePreferences.length
          ? parsed.stylePreferences
          : stylePreferences.length
            ? stylePreferences
            : ["casual"];

      const result = await generateStyle({
        occasion, language, profile, stylePreferences: sp,
        weather: weather || undefined, trendInspired,
      });

      try {
        const preview = result.personaSummary?.slice(0, 200) || occasion || "";
        db.prepare(
          "INSERT INTO ai_requests (user_id, occasion, response_preview) VALUES (?, ?, ?)"
        ).run(null, occasion || null, preview);
      } catch (_) {}

      const generatedReply = reply || buildGenerateReply(language, occasion, result);
      return res.json({ reply: generatedReply, result, askWeather });
    }

    res.json({ reply, action: "chat", askWeather });
  } catch (err) {
    console.error("[ai/chat]", err);
    res.status(500).json({ error: "AI chat failed" });
  }
});

export default router;
