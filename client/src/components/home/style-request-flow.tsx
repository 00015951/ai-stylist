"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";
import type { MoodCategory } from "./mood-category-grid";

const OCCASIONS_BY_LANG = {
  en: [
    { label: "Party 🎉", value: "Party" },
    { label: "Work 💼", value: "Work / Office" },
    { label: "Date ❤️", value: "Date / Dinner" },
    { label: "Weekend 🌅", value: "Weekend / Casual" },
    { label: "Sport 🏃", value: "Sport / Active" },
    { label: "Travel ✈️", value: "Travel" },
    { label: "Wedding 💒", value: "Wedding" },
    { label: "Shopping 🛍️", value: "Shopping / Hangout" },
  ],
  ru: [
    { label: "Вечеринка 🎉", value: "Вечеринка" },
    { label: "Работа 💼", value: "Работа / Офис" },
    { label: "Свидание ❤️", value: "Свидание / Ужин" },
    { label: "Выходные 🌅", value: "Выходные / Кэжуал" },
    { label: "Спорт 🏃", value: "Спорт / Активность" },
    { label: "Путешествие ✈️", value: "Путешествие" },
    { label: "Свадьба 💒", value: "Свадьба" },
    { label: "Шопинг 🛍️", value: "Шопинг / Прогулка" },
  ],
  uz: [
    { label: "Party 🎉", value: "Party / Ziyofat" },
    { label: "Ish 💼", value: "Ish / Ofis" },
    { label: "Uchrashuv ❤️", value: "Uchrashuv / Kechqurun" },
    { label: "Dam olish 🌅", value: "Dam olish / Oddiy kun" },
    { label: "Sport 🏃", value: "Sport / Faol dam olish" },
    { label: "Sayohat ✈️", value: "Sayohat" },
    { label: "To'y 💒", value: "To'y / Nikoh" },
    { label: "Sayr 🛍️", value: "Ko'chada / Do'konga" },
  ],
};

export interface FlowData {
  mood: MoodCategory;
  occasion: string;
  city: string;
  useWeather: boolean;
  trendInspired: boolean;
}

interface StyleRequestFlowProps {
  mood: MoodCategory;
  onClose: () => void;
  onGenerate: (data: FlowData) => void;
}

export function StyleRequestFlow({
  mood,
  onClose,
  onGenerate,
}: StyleRequestFlowProps) {
  const language = useAppStore((s) => s.language);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [customOccasion, setCustomOccasion] = useState("");

  const occasions =
    OCCASIONS_BY_LANG[language as keyof typeof OCCASIONS_BY_LANG] ??
    OCCASIONS_BY_LANG.en;
  const moodLabel =
    mood.label[language as keyof typeof mood.label] ?? mood.label.en;

  const finalOccasion = customOccasion.trim() || selectedOccasion;
  const canGenerate = Boolean(finalOccasion);

  const labels = {
    title: {
      en: "What's the occasion?",
      ru: "Какой повод?",
      uz: "Qanday vaziyat?",
    },
    generate: {
      en: "Generate My Look ✨",
      ru: "Создать образ ✨",
      uz: "Look yaratish ✨",
    },
    orType: {
      en: "Or describe it yourself...",
      ru: "Или опишите сами...",
      uz: "Yoki o'zingiz yozing...",
    },
  };

  const get = (key: keyof typeof labels) =>
    (labels[key] as Record<string, string>)[language] ??
    (labels[key] as Record<string, string>).en;

  const handleSelectOccasion = (value: string) => {
    setSelectedOccasion(value);
    setCustomOccasion("");
  };

  const handleGenerate = () => {
    onGenerate({
      mood,
      occasion: finalOccasion,
      city: "",
      useWeather: false,
      trendInspired: false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative w-full max-w-lg rounded-t-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-0">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${mood.gradient} text-xl`}
            >
              {mood.emoji}
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                {moodLabel}
              </p>
              <p className="font-heading font-semibold text-sm text-foreground leading-tight">
                {get("title")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content — pb accounts for floating dock height (~90px) + safe area + 50px extra */}
        <div className="px-5 pt-4 space-y-3 pb-[calc(env(safe-area-inset-bottom,0px)+154px)]">
          {/* Occasion chips */}
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <button
                key={occ.value}
                type="button"
                onClick={() => handleSelectOccasion(occ.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
                  selectedOccasion === occ.value && !customOccasion
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-white text-foreground hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                {occ.label}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <input
            type="text"
            placeholder={get("orType")}
            value={customOccasion}
            onChange={(e) => {
              setCustomOccasion(e.target.value);
              setSelectedOccasion("");
            }}
            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={120}
          />

          <Button
            size="lg"
            className="w-full rounded-xl font-heading"
            disabled={!canGenerate}
            onClick={handleGenerate}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {get("generate")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
