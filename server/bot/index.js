import TelegramBot from "node-telegram-bot-api";
import { db } from "../db/init.js";

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || "https://your-app.vercel.app";

if (!BOT_TOKEN) {
  console.warn("[Bot] BOT_TOKEN not set - Telegram bot disabled");
}

let bot = null;

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

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const firstName = msg.from?.first_name || "";
    const lastName = msg.from?.last_name || "";
    const username = msg.from?.username || "";

    const stmt = db.prepare("SELECT id, phone FROM users WHERE telegram_id = ?");
    const user = stmt.get(userId);

    if (user?.phone) {
      // Already registered - welcome back
      await bot.sendMessage(
        chatId,
        `Hush kelibsiz, ${firstName}! 👋\n\nStilizni tanlash uchun quyidagi tugmani bosing va Mini Web App orqali kiyim tavsiyalarini oling.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✨ Stilizni tanlash (Mini App)",
                  web_app: { url: WEB_APP_URL },
                },
              ],
            ],
          },
        }
      );
    } else {
      // Request phone number
      await bot.sendMessage(
        chatId,
        `Salom, ${firstName}! 👋 Virtual AI Stylist ga xush kelibsiz.\n\nDavom etish uchun telefon raqamingizni yuboring.`,
        {
          reply_markup: {
            keyboard: [
              [
                {
                  text: "📱 Telefon raqamni yuborish",
                  request_contact: true,
                },
              ],
            ],
            one_time_keyboard: true,
            resize_keyboard: true,
          },
        }
      );
    }
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

    await bot.sendMessage(
      chatId,
      "Stilizni tanlash uchun quyidagi tugmani bosing va kiyim tavsiyalarini oling 👇",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✨ Stilizni tanlash (Mini App ochish)",
                web_app: { url: WEB_APP_URL },
              },
            ],
          ],
        },
      }
    );
  });

  return bot;
}
