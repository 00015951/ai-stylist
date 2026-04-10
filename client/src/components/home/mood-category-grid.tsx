"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";
import { OUTFIT_IMAGES } from "@/lib/outfit-images";

export type MoodCategory = {
  id: string;
  emoji: string;
  gradient: string;
  bgClass: string;
  label: { en: string; ru: string; uz: string };
  desc: { en: string; ru: string; uz: string };
};

export const MOOD_CATEGORIES: MoodCategory[] = [
  {
    id: "casual",
    emoji: "😊",
    gradient: "from-orange-400 to-amber-300",
    bgClass: "bg-gradient-to-br from-orange-400 to-amber-300",
    label: { en: "Casual", ru: "Повседневный", uz: "Kundalik" },
    desc: { en: "Everyday comfort", ru: "Каждый день", uz: "Har kunlik" },
  },
  {
    id: "business",
    emoji: "💼",
    gradient: "from-blue-500 to-sky-400",
    bgClass: "bg-gradient-to-br from-blue-500 to-sky-400",
    label: { en: "Business", ru: "Деловой", uz: "Ishchan" },
    desc: { en: "Professional look", ru: "Профессионально", uz: "Professional" },
  },
  {
    id: "streetwear",
    emoji: "🎭",
    gradient: "from-violet-500 to-purple-400",
    bgClass: "bg-gradient-to-br from-violet-500 to-purple-400",
    label: { en: "Street", ru: "Стрит", uz: "Ko'cha" },
    desc: { en: "Urban vibes", ru: "Городской стиль", uz: "Shahar uslubi" },
  },
  {
    id: "elegant",
    emoji: "✨",
    gradient: "from-rose-500 to-pink-400",
    bgClass: "bg-gradient-to-br from-rose-500 to-pink-400",
    label: { en: "Elegant", ru: "Элегантный", uz: "Nafis" },
    desc: { en: "Chic & refined", ru: "Утончённый", uz: "Nafis va chiroyli" },
  },
  {
    id: "sporty",
    emoji: "⚡",
    gradient: "from-emerald-500 to-green-400",
    bgClass: "bg-gradient-to-br from-emerald-500 to-green-400",
    label: { en: "Sporty", ru: "Спортивный", uz: "Sportcha" },
    desc: { en: "Active & fit", ru: "Активный", uz: "Faol va kuchli" },
  },
  {
    id: "bohemian",
    emoji: "🌺",
    gradient: "from-yellow-500 to-orange-400",
    bgClass: "bg-gradient-to-br from-yellow-500 to-orange-400",
    label: { en: "Bohemian", ru: "Бохо", uz: "Bohem" },
    desc: { en: "Free spirit", ru: "Свободный дух", uz: "Erkin ruhli" },
  },
];

interface MoodCategoryGridProps {
  onSelect: (mood: MoodCategory) => void;
}

export function MoodCategoryGrid({ onSelect }: MoodCategoryGridProps) {
  const language = useAppStore((s) => s.language);

  const heading = {
    en: "Choose your mood",
    ru: "Выберите настроение",
    uz: "Kayfiyatingizni tanlang",
  }[language] ?? "Choose your mood";

  const sub = {
    en: "AI creates a perfect look for your style",
    ru: "AI создаст идеальный образ под ваш стиль",
    uz: "AI sizning stilingiz uchun ideal look yaratadi",
  }[language] ?? "AI creates a perfect look for your style";

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-heading text-lg font-bold text-foreground leading-tight">
          {heading}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {MOOD_CATEGORIES.map((mood, i) => {
          const label =
            mood.label[language as keyof typeof mood.label] ?? mood.label.en;
          const desc =
            mood.desc[language as keyof typeof mood.desc] ?? mood.desc.en;

          return (
            <motion.button
              key={mood.id}
              type="button"
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: i * 0.07,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(mood)}
              className="relative overflow-hidden rounded-2xl text-left text-white shadow-md hover:shadow-lg transition-shadow aspect-[4/3]"
            >
              {/* Background photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={OUTFIT_IMAGES[mood.id] ?? OUTFIT_IMAGES.casual}
                alt={label}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Gradient overlay matching mood color */}
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.gradient} opacity-60`} />
              {/* Dark bottom gradient for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <span className="text-2xl leading-none">{mood.emoji}</span>
                <p className="mt-1 font-heading text-sm font-bold leading-tight drop-shadow-sm">
                  {label}
                </p>
                <p className="mt-0.5 text-[11px] text-white/80 leading-tight drop-shadow-sm">
                  {desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
