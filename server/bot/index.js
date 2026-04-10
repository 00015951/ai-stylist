import TelegramBot from "node-telegram-bot-api";
import { db } from "../db/init.js";
import { createTelegramSessionToken } from "../auth/telegram-session.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || "https://your-app.vercel.app";

/** BotFather da ko‘rsatilgan HTTPS Mini App manzili (oxirida / bo‘lmasin) */
function miniAppOpenUrl() {
  let u = String(WEB_APP_URL).trim();
  if (!/^https:\/\//i.test(u)) {
    u = u.replace(/^\/+/, "");
    u = `https://${u}`;
  }
  return u.replace(/\/+$/, "");
}

if (!BOT_TOKEN) {
  console.warn("[Bot] BOT_TOKEN not set - Telegram bot disabled");
}

let bot = null;

function buildMiniAppUrlWithToken(token) {
  const baseUrl = miniAppOpenUrl();
  try {
    const url = new URL(baseUrl);
    url.pathname = "/welcome";
    if (token) url.searchParams.set("token", token);
    return url.toString();
  } catch {
    const normalizedBase = baseUrl.replace(/\/+$/, "");
    const target = `${normalizedBase}/welcome`;
    const sep = target.includes("?") ? "&" : "?";
    return token ? `${target}${sep}token=${encodeURIComponent(token)}` : target;
  }
}

async function handleStart(msg) {
  if (!bot) return;
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const firstName = msg.from?.first_name || "";
  const lastName = msg.from?.last_name || "";
  const username = msg.from?.username || "";

  if (!userId) return;

  // /start bosgan barcha userlarni har doim DBga yozamiz/yangilaymiz
  const upsertOnStart = db.prepare(`
    INSERT INTO users (telegram_id, first_name, last_name, username, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(telegram_id) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      username = excluded.username,
      updated_at = datetime('now')
  `);
  upsertOnStart.run(userId, firstName, lastName, username);

  const user = db
    .prepare("SELECT id, telegram_id FROM users WHERE telegram_id = ?")
    .get(userId);
  if (user) {
    try {
      db.prepare(
        "INSERT OR IGNORE INTO subscriptions (user_id, plan, started_at) VALUES (?, 'free', datetime('now'))"
      ).run(user.id);
    } catch (_) {}
  }

  const token = user ? createTelegramSessionToken(user.id, user.telegram_id) : null;
  const appUrl = buildMiniAppUrlWithToken(token);

  await bot.sendMessage(
    chatId,
    `Hush kelibsiz, ${firstName || "do'stim"}! 👋\n\n` +
      "O'zingizni stil'ingizni yaratmoqchi bo'lsangiz, pastdagi tugma orqali appni oching.",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🚀 Appni ochish",
              url: appUrl,
            },
          ],
        ],
      },
    }
  );
}

function registerBotHandlers() {
  if (!bot) return;
  bot.onText(/\/start/, handleStart);
}

export function getBot() {
  return bot;
}

export function initBot() {
  if (!BOT_TOKEN) return null;
  bot = new TelegramBot(BOT_TOKEN, { polling: false });

  return bot;
}

/**
 * Register webhook handler - call this from Express
 */
export function setupBotWebhook(app, path = "/webhook/telegram") {
  if (!BOT_TOKEN) return;
  bot = new TelegramBot(BOT_TOKEN);
  registerBotHandlers();
  app.post(path, (req, res) => {
    try {
      bot.processUpdate(req.body);
      res.sendStatus(200);
    } catch (e) {
      console.error("[Bot] Webhook error:", e);
      res.sendStatus(500);
    }
  });
}

/**
 * Setup bot with polling (for dev) or webhook
 */
export function startBotWithPolling(onUpdate) {
  if (!BOT_TOKEN) return null;
  bot = new TelegramBot(BOT_TOKEN, { polling: true });
  registerBotHandlers();
  bot.on("polling_error", async (err) => {
    const msg = err?.message ? String(err.message) : "";
    if (msg.includes("409 Conflict")) {
      console.error(
        "[Bot] Polling conflict (409): another instance uses same BOT_TOKEN. Stopping local polling."
      );
      try {
        await bot.stopPolling();
      } catch (_) {}
      return;
    }
    console.error("[Bot] polling_error:", err);
  });

  bot.on("contact", async (msg) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;
    const userId = contact.user_id || msg.from?.id;
    const phone = contact.phone_number?.replace(/^\+/, "") || "";

    const firstName = msg.from?.first_name || "";
    const lastName = msg.from?.last_name || "";
    const username = msg.from?.username || "";
    const photo = msg.from?.photos
      ? null
      : null; // Bot can't get profile photo directly

    const upsertUser = db.prepare(`
      INSERT INTO users (telegram_id, phone, first_name, last_name, username, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(telegram_id) DO UPDATE SET
        phone = excluded.phone,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        username = excluded.username,
        updated_at = CURRENT_TIMESTAMP
    `);
    upsertUser.run(userId, phone, firstName, lastName, username);

    await bot.sendMessage(
      chatId,
      `Hush kelibsiz, ${firstName}! ✅\n\nTelefon raqamingiz saqlandi. Stilizni tanlash uchun quyidagi tugmani bosing.`,
      {
        reply_markup: {
          remove_keyboard: true,
        },
      }
    );

    const appUrl = miniAppOpenUrl();
    await bot.sendMessage(
      chatId,
      "Kiyim tavsiyalari uchun Mini App ni oching — avtomatik kirish 👇",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✨ Styla (Mini App)",
                web_app: { url: appUrl },
              },
            ],
          ],
        },
      }
    );
  });

  return bot;
}
