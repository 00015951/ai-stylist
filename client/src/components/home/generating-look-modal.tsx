"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

const STEPS_BY_LANG = {
  en: [
    "Analyzing your style profile...",
    "Checking 2026 fashion trends...",
    "Finding the perfect outfit combination...",
    "Searching Uzum, AliExpress & more...",
    "Putting your look together...",
  ],
  ru: [
    "Анализирую ваш стиль...",
    "Проверяю тренды 2026...",
    "Подбираю идеальные образы...",
    "Ищу вещи на Uzum, AliExpress...",
    "Создаю ваш образ...",
  ],
  uz: [
    "Sizning stilingizni tahlil qilmoqda...",
    "2026 trendlarini tekshirmoqda...",
    "Ideal outfit kombinatsiyasini topmoqda...",
    "Uzum, AliExpress va boshqalardan izlamoqda...",
    "Lookingizni tayyorlamoqda...",
  ],
};

const TITLE_BY_LANG = {
  en: "Generating your look",
  ru: "Создаю ваш образ",
  uz: "Lookingizni yaratmoqda",
};

interface GeneratingLookModalProps {
  open: boolean;
}

export function GeneratingLookModal({ open }: GeneratingLookModalProps) {
  const language = useAppStore((s) => s.language);
  const [currentStep, setCurrentStep] = useState(0);

  const steps =
    STEPS_BY_LANG[language as keyof typeof STEPS_BY_LANG] ?? STEPS_BY_LANG.en;
  const title =
    TITLE_BY_LANG[language as keyof typeof TITLE_BY_LANG] ?? TITLE_BY_LANG.en;

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      return;
    }
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < steps.length - 1 ? prev + 1 : prev
      );
    }, 900);
    return () => clearInterval(interval);
  }, [open, steps.length]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center"
          >
            {/* Animated sparkle icon */}
            <div className="flex justify-center mb-6">
              <div className="relative flex h-20 w-20 items-center justify-center">
                {/* Spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-[3px] border-primary/15 border-t-primary"
                />
                {/* Inner pulsing ring */}
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-2 rounded-full border-2 border-primary/20"
                />
                {/* Icon */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </motion.div>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-heading text-xl font-bold text-foreground mb-1">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {language === "uz"
                ? "Bir oz kuting, siz uchun ideal look tayyorlanmoqda ✨"
                : language === "ru"
                  ? "Секунду, создаём идеальный образ для вас ✨"
                  : "Just a moment, creating your perfect look ✨"}
            </p>

            {/* Steps */}
            <div className="space-y-3 text-left">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: i <= currentStep ? 1 : 0.25 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  {i < currentStep ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    </motion.div>
                  ) : i === currentStep ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 shrink-0 rounded-full border-2 border-primary border-t-transparent"
                    />
                  ) : (
                    <div className="h-4 w-4 shrink-0 rounded-full border-2 border-gray-200" />
                  )}
                  <span
                    className={`text-sm leading-snug transition-colors duration-300 ${
                      i <= currentStep
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
