"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, ExternalLink, ShoppingBag,
  Shirt, ChevronDown, ChevronUp, Loader2, Wand2,
} from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { useTelegram } from "@/providers/telegram-provider";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Types ─────────────────────────── */
interface ShopItem {
  type: string;
  name: string;
  shopName: string;
  shopUrl: string;
  imageUrl: string | null;
  price: string | null;
}
interface Look {
  id: number;
  title: string;
  imageUrl: string | null;
  style: string;
  whyItWorks: string;
  colorPalette: string;
  items: ShopItem[];
}
interface StylistResult {
  summary: string;
  looks: Look[];
  error?: string;
}
interface ChatMessage {
  role: "user" | "assistant";
  text?: string;
  result?: StylistResult;
  loading?: boolean;
}

/* ─────────────────────── Quick prompts ─────────────────────── */
const QUICK_PROMPTS: Record<string, string[]> = {
  uz: [
    "Ofis uchun professional look",
    "Kechki ziyofat uchun elegant look",
    "Kundalik casual street style",
    "Sport va aktiv hayot uchun",
    "To'y uchun chiroyli look",
    "Sayohat uchun qulay va stilniy",
  ],
  ru: [
    "Деловой офисный образ",
    "Элегантный вечерний выход",
    "Повседневный уличный стиль",
    "Спортивный образ",
    "Образ на свадьбу",
    "Стильный образ для путешествий",
  ],
  en: [
    "Professional office look",
    "Elegant evening outfit",
    "Casual street style",
    "Sporty athleisure look",
    "Wedding guest outfit",
    "Travel-friendly stylish look",
  ],
};

/* ─────────────────── Store icon helper ─────────────────────── */
const STORE_ICONS: Record<string, string> = {
  "Uzum.uz": "🇺🇿",
  "Wildberries.uz": "🇺🇿",
  Trendyol: "🌍",
  AliExpress: "🌍",
  SHEIN: "🌍",
  "Lamoda.uz": "🇺🇿",
};

/* ─────────────────── Look card component ───────────────────── */
function LookCard({ look, idx }: { look: Look; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl bg-white shadow-md"
    >
      {/* Look image */}
      <div className="relative aspect-[3/4] w-full bg-stone-100">
        {look.imageUrl && !imgError ? (
          <Image
            src={look.imageUrl}
            alt={look.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 380px"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-300">
            <Shirt className="h-12 w-12" strokeWidth={1.5} />
            <span className="text-xs">No image</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Title badge */}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block rounded-xl bg-white/95 px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm">
            {look.title}
          </span>
          {look.colorPalette && (
            <p className="mt-1 text-xs text-white/90 drop-shadow">{look.colorPalette}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-sm leading-relaxed text-muted-foreground">{look.whyItWorks}</p>
      </div>

      {/* Items accordion */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-stone-100"
        >
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4 text-primary" />
            Mahsulotlar ({look.items.length} ta)
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                {look.items.map((item, ii) => (
                  <ProductCard key={ii} item={item} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ──────────────────── Product card ───────────────────────── */
function ProductCard({ item }: { item: ShopItem }) {
  const [imgErr, setImgErr] = useState(false);
  const icon = STORE_ICONS[item.shopName] || "🛒";

  const typeLabel: Record<string, string> = {
    top: "Ustki kiyim",
    bottom: "Pastki kiyim",
    shoes: "Oyoq kiyim",
    accessories: "Aksessuarlar",
    dress: "Ko'ylak",
    outerwear: "Ustki paltо",
  };

  return (
    <a
      href={item.shopUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-3 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
    >
      {/* Product image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-stone-100">
        {item.imageUrl && !imgErr ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
            onError={() => setImgErr(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">
            {item.type === "shoes" ? "👟" : item.type === "accessories" ? "👜" : item.type === "bottom" ? "👖" : "👕"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {typeLabel[item.type] ?? item.type}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">{item.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {icon} {item.shopName}
          </span>
          {item.price && (
            <span className="text-xs text-muted-foreground">{item.price}</span>
          )}
        </div>
      </div>

      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

/* ─────────────────── Loading skeleton ──────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          AI internet dan qidiryapti...
        </span>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="aspect-[3/4] bg-stone-200" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-2/3 rounded bg-stone-200" />
            <div className="h-3 w-full rounded bg-stone-100" />
            <div className="h-3 w-4/5 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════ Main page ══════════════════════════ */
export default function StylistPage() {
  const language = useAppStore((s) => s.language);
  const profile = useAppStore((s) => s.profile);
  const { haptic } = useTelegram();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickPrompts = QUICK_PROMPTS[language] ?? QUICK_PROMPTS.en;

  const labels = {
    uz: {
      title: "AI Stylist",
      subtitle: "Istagan looknizi yozing — AI internetdan qidiradi",
      placeholder: "Masalan: ko'k rangli elegant evening look...",
      send: "Yuborish",
      thinking: "AI qidiryapti...",
    },
    ru: {
      title: "AI Стилист",
      subtitle: "Напишите желаемый образ — AI найдёт в интернете",
      placeholder: "Например: синий элегантный вечерний образ...",
      send: "Отправить",
      thinking: "AI ищет...",
    },
    en: {
      title: "AI Stylist",
      subtitle: "Describe your look — AI searches the internet",
      placeholder: "e.g. blue elegant evening look...",
      send: "Send",
      thinking: "AI is searching...",
    },
  };
  const L = labels[language as keyof typeof labels] ?? labels.en;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendRequest(text: string) {
    if (!text.trim() || loading) return;
    haptic.impact("light");
    setInput("");

    const userMsg: ChatMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/visual-stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request: text,
          language,
          profile: {
            gender: profile?.gender,
            height: profile?.height,
            weight: profile?.weight,
            bodyType: profile?.bodyType,
            budget: profile?.budget,
          },
        }),
      });

      const data: StylistResult = await res.json();
      haptic.notification(data.error ? "error" : "success");

      setMessages((prev) => [
        ...prev,
        { role: "assistant", result: data },
      ]);
    } catch {
      haptic.notification("error");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          result: { summary: "", looks: [], error: "Network error. Please try again." },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendRequest(input);
  };

  const isFirstMessage = messages.length === 0;

  return (
    <div className="flex min-h-dvh flex-col pb-[calc(env(safe-area-inset-bottom,0px)+140px)]">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/40 bg-white/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
            <Wand2 className="h-4 w-4 text-primary" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{L.title}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">{L.subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-green-700">compound-beta</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 px-4 pt-4 space-y-6">
        {/* Welcome / quick prompts */}
        {isFirstMessage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-rose-50 p-4 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-primary mb-2" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-foreground">
                {language === "uz" ? "Assalomu alaykum! Qanday look qidirmoqchisiz?" : language === "ru" ? "Привет! Какой образ вы ищете?" : "Hi! What look are you looking for?"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {language === "uz"
                  ? "AI compound-beta orqali internetdan real rasmlar va do'kon havolalari topadi"
                  : language === "ru"
                    ? "AI ищет реальные фото и ссылки на магазины через интернет"
                    : "AI searches real photos and shop links from the internet"}
              </p>
            </div>

            {/* Quick prompt chips */}
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendRequest(q)}
                  className="rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === "user" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end"
              >
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm">
                  {msg.text}
                </div>
              </motion.div>
            )}

            {msg.role === "assistant" && msg.result && (
              <div className="space-y-4">
                {/* Error */}
                {msg.result.error && !msg.result.looks.length && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                    {msg.result.error}
                  </div>
                )}

                {/* Summary */}
                {msg.result.summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 rounded-2xl rounded-tl-sm bg-white/90 px-4 py-3 shadow-sm"
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                    <p className="text-sm leading-relaxed text-foreground/90">{msg.result.summary}</p>
                  </motion.div>
                )}

                {/* Look cards */}
                {msg.result.looks.map((look, li) => (
                  <LookCard key={look.id} look={look} idx={li} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LoadingSkeleton />
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar — fixed above bottom nav */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+70px)] left-0 right-0 z-30 px-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-xl backdrop-blur-xl ring-1 ring-black/5"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendRequest(input);
              }
            }}
            placeholder={L.placeholder}
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            style={{ maxHeight: "96px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all",
              input.trim() && !loading
                ? "bg-primary text-white shadow-sm hover:opacity-90 active:scale-95"
                : "bg-stone-100 text-stone-400"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
