"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Wand2 } from "lucide-react";
import { useAppStore, type GeneratedStyleResult } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";
import { aiChat, getWeather, getSubscription } from "@/lib/api";
import { useTelegram } from "@/providers/telegram-provider";
import { ProUpgradeModal } from "@/components/home/pro-upgrade-modal";
import { MoodCategoryGrid } from "@/components/home/mood-category-grid";
import { StyleRequestFlow } from "@/components/home/style-request-flow";
import { GeneratingLookModal } from "@/components/home/generating-look-modal";
import { canGenerate, isPro, markTrialUsed, checkTrial } from "@/lib/paywall";
import { cn } from "@/lib/utils";
import type { MoodCategory } from "./mood-category-grid";
import type { FlowData } from "./style-request-flow";

/* ── Quick occasion chips per language ── */
const QUICK_OCCASIONS = {
  uz: [
    { label: "🎉 Party", value: "Party / Ziyofat" },
    { label: "💼 Ish", value: "Ish / Ofis" },
    { label: "❤️ Uchrashuv", value: "Uchrashuv / Kechqurun" },
    { label: "🌅 Kundalik", value: "Dam olish / Oddiy kun" },
    { label: "✈️ Sayohat", value: "Sayohat" },
    { label: "💒 To'y", value: "To'y / Nikoh" },
  ],
  ru: [
    { label: "🎉 Вечеринка", value: "Вечеринка" },
    { label: "💼 Работа", value: "Работа / Офис" },
    { label: "❤️ Свидание", value: "Свидание / Ужин" },
    { label: "🌅 Выходные", value: "Выходные / Кэжуал" },
    { label: "✈️ Поездка", value: "Путешествие" },
    { label: "💒 Свадьба", value: "Свадьба" },
  ],
  en: [
    { label: "🎉 Party", value: "Party" },
    { label: "💼 Work", value: "Work / Office" },
    { label: "❤️ Date", value: "Date / Dinner" },
    { label: "🌅 Casual", value: "Weekend / Casual" },
    { label: "✈️ Travel", value: "Travel" },
    { label: "💒 Wedding", value: "Wedding" },
  ],
};

const PLACEHOLDERS = {
  uz: "Masalan: university uchun casual look, kechki elegant outfit...",
  ru: "Например: деловой образ для офиса, вечерний look...",
  en: "e.g. casual university look, elegant party outfit...",
};

export function HomePage() {
  const router = useRouter();
  const { haptic, initData } = useTelegram();
  const profile = useAppStore((s) => s.profile);
  const stylePreferences = useAppStore((s) => s.stylePreferences);
  const language = useAppStore((s) => s.language);
  const T = getTranslations(language);
  const setLastGeneratedResult = useAppStore((s) => s.setLastGeneratedResult);
  const editFromResult = useAppStore((s) => s.editFromResult);
  const setEditFromResult = useAppStore((s) => s.setEditFromResult);

  const [selectedMood, setSelectedMood] = useState<MoodCategory | null>(null);
  const [showGenerating, setShowGenerating] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<{ plan: string; freeUsesLeft: number; isPro: boolean } | null>(null);
  const [errorText, setErrorText] = useState("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickOccasions =
    QUICK_OCCASIONS[language as keyof typeof QUICK_OCCASIONS] ?? QUICK_OCCASIONS.en;
  const placeholder = PLACEHOLDERS[language as keyof typeof PLACEHOLDERS] ?? PLACEHOLDERS.en;

  const labels = {
    title: { uz: "Virtual AI Stylist", ru: "Virtual AI Stylist", en: "Virtual AI Stylist" },
    subtitle: {
      uz: "Istagan lookingizni yozing yoki kategoriya tanlang",
      ru: "Напишите желаемый образ или выберите категорию",
      en: "Type your desired look or choose a category",
    },
    send: { uz: "Look yaratish", ru: "Создать", en: "Generate" },
    orChoose: {
      uz: "Yoki kayfiyatingizni tanlang",
      ru: "Или выберите настроение",
      en: "Or choose your mood",
    },
  };
  const L = (key: keyof typeof labels) =>
    (labels[key] as Record<string, string>)[language] ?? (labels[key] as Record<string, string>).en;

  // Load subscription
  useEffect(() => {
    getSubscription(initData)
      .then((s) => {
        if (s) setSubscription({ plan: s.plan, freeUsesLeft: s.freeUsesLeft, isPro: s.isPro });
      })
      .catch(() => {});
  }, [initData]);

  // Restore edit state
  useEffect(() => {
    if (editFromResult?.occasion) setInputValue(editFromResult.occasion);
  }, []);

  /* ── Generate look from text input ── */
  const handleGenerate = async (text?: string) => {
    const occasion = (text ?? inputValue).trim();
    if (!occasion) return;
    if (!canGenerate()) { setShowProModal(true); return; }
    setErrorText("");

    haptic.impact("medium");
    if (!text) setInputValue("");
    setIsLoading(true);
    setShowGenerating(true);

    try {
      const r = await aiChat({
        language,
        context: {
          profile: profile ? { ...profile } : undefined,
          stylePreferences: stylePreferences ?? [],
          defaultEvent: occasion,
          budget: profile?.budget,
          forceGenerate: true,
        },
        messages: [{ role: "user", content: occasion }],
      });

      setShowGenerating(false);
      setIsLoading(false);

      if (r?.result) {
        setLastGeneratedResult(r.result as GeneratedStyleResult);
        markTrialUsed();
        setEditFromResult(null);
        haptic.notification("success");
        router.push("/results");
      } else {
        haptic.notification("warning");
      }
    } catch (err) {
      setShowGenerating(false);
      setIsLoading(false);
      const code = (err as { code?: string })?.code;
      if (code === "UPGRADE_TO_PRO") {
        setShowProModal(true);
      } else if (code === "UNAUTHORIZED") {
        router.replace("/welcome");
      } else {
        setErrorText(
          language === "uz"
            ? "Generate qilishda xatolik bo'ldi. Qayta urinib ko'ring."
            : language === "ru"
              ? "Ошибка генерации. Попробуйте еще раз."
              : "Failed to generate look. Please try again."
        );
      }
      haptic.notification("error");
    }
  };

  /* ── Mood card tap → opens occasion selector ── */
  const handleMoodSelect = (mood: MoodCategory) => {
    haptic.impact("medium");
    if (!canGenerate()) { setShowProModal(true); return; }
    setSelectedMood(mood);
  };

  /* ── Occasion flow generate ── */
  const handleFlowGenerate = async (data: FlowData) => {
    setErrorText("");
    setIsLoading(true);
    setShowGenerating(true);
    setSelectedMood(null);
    haptic.impact("medium");

    let weather: { tempC: number; condition: string; city?: string } | undefined;
    if (data.useWeather && data.city.trim()) {
      try {
        const wData = await getWeather(data.city.trim());
        if (wData?.tempC != null) weather = { tempC: wData.tempC, condition: wData.condition ?? "Unknown", city: wData.city };
      } catch { /* skip */ }
    }

    try {
      const r = await aiChat({
        language,
        context: {
          profile: profile ? { ...profile } : undefined,
          stylePreferences: [data.mood.id, ...(stylePreferences ?? [])],
          defaultEvent: data.occasion,
          budget: profile?.budget,
          weather,
          trendInspired: data.trendInspired,
          forceGenerate: true,
        },
        messages: [{ role: "user", content: data.occasion }],
      });

      setShowGenerating(false);
      setIsLoading(false);

      if (r?.result) {
        setLastGeneratedResult(r.result as GeneratedStyleResult);
        markTrialUsed();
        haptic.notification("success");
        router.push("/results");
      } else {
        haptic.notification("warning");
      }
    } catch (err) {
      setShowGenerating(false);
      setIsLoading(false);
      const code = (err as { code?: string })?.code;
      if (code === "UPGRADE_TO_PRO") {
        setShowProModal(true);
      } else if (code === "UNAUTHORIZED") {
        router.replace("/welcome");
      } else {
        setErrorText(
          language === "uz"
            ? "Generate qilishda xatolik bo'ldi. Qayta urinib ko'ring."
            : language === "ru"
              ? "Ошибка генерации. Попробуйте еще раз."
              : "Failed to generate look. Please try again."
        );
      }
      haptic.notification("error");
    }
  };

  const canSend = inputValue.trim().length > 0 && !isLoading;

  return (
    <>
      <GeneratingLookModal open={showGenerating} />

      <AnimatePresence>
        {selectedMood && (
          <StyleRequestFlow
            mood={selectedMood}
            onClose={() => setSelectedMood(null)}
            onGenerate={handleFlowGenerate}
          />
        )}
      </AnimatePresence>

      <ProUpgradeModal
        open={showProModal}
        onClose={() => setShowProModal(false)}
        onUnlock={() => {
          getSubscription(initData).then((s) => {
            if (s) setSubscription({ plan: s.plan, freeUsesLeft: s.freeUsesLeft, isPro: s.isPro });
          }).catch(() => {});
        }}
      />

      <motion.div
        className="flex flex-col gap-5 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Free-tier banner */}
        {!isPro() && subscription && !subscription.isPro && subscription.freeUsesLeft < 3 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm"
          >
            <span className="text-amber-700">
              {subscription.freeUsesLeft === 0
                ? language === "uz" ? "Bepul limit tugadi" : language === "ru" ? "Лимит исчерпан" : "Free limit used"
                : language === "uz" ? `Bepul: ${subscription.freeUsesLeft} ta qoldi` : language === "ru" ? `Осталось ${subscription.freeUsesLeft}` : `${subscription.freeUsesLeft} free left`}
            </span>
            {subscription.freeUsesLeft === 0 && (
              <button type="button" onClick={() => setShowProModal(true)} className="font-semibold text-amber-600 underline">
                {language === "uz" ? "Pro ga o'tish" : language === "ru" ? "Перейти на Pro" : "Go Pro"}
              </button>
            )}
          </motion.div>
        )}

        {errorText && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {errorText}
          </div>
        )}

        {/* ─── Main Chat Input Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-rose-400">
              <Wand2 className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="font-heading text-sm font-bold text-foreground leading-tight">{L("title")}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{L("subtitle")}</p>
            </div>
          </div>

          {/* Text input */}
          <div className="px-4 pb-2">
            <div className="flex items-end gap-2 rounded-xl border-2 border-stone-100 bg-stone-50 p-2 focus-within:border-primary/40 focus-within:bg-white transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); }
                }}
                placeholder={placeholder}
                rows={2}
                disabled={isLoading}
                className="flex-1 resize-none bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50"
                style={{ maxHeight: "80px" }}
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={!canSend}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                  canSend
                    ? "bg-primary text-white shadow-md hover:opacity-90 active:scale-95"
                    : "bg-stone-200 text-stone-400"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick occasion chips */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {quickOccasions.map((occ) => (
                <button
                  key={occ.value}
                  type="button"
                  onClick={() => handleGenerate(occ.value)}
                  disabled={isLoading}
                  className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 active:scale-95 disabled:opacity-50"
                >
                  {occ.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Mood Category Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {L("orChoose")}
          </p>
          <MoodCategoryGrid onSelect={handleMoodSelect} />
        </motion.div>
      </motion.div>
    </>
  );
}
