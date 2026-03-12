"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { LANGUAGES, getTranslations, type AppLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { OUTFIT_IMAGES } from "@/lib/outfit-images";

const WELCOME_IMAGE = OUTFIT_IMAGES.elegant ?? OUTFIT_IMAGES.casual;

interface OnboardingLanguageProps {
  onNext: () => void;
}

/**
 * Step 1: Language selection + Welcome
 * Hero image, animations, hover effects
 */
export function OnboardingLanguage({ onNext }: OnboardingLanguageProps) {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const T = getTranslations(language);

  return (
    <motion.div
      className="flex flex-col items-center gap-3 sm:gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Hero image - prominent, engaging */}
      <motion.div
        variants={staggerItem}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-xl ring-2 ring-primary/20"
      >
        <motion.div
          className="relative aspect-[4/3] w-full"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={WELCOME_IMAGE}
            alt="Stylish outfit"
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="font-heading text-xl font-bold tracking-tight text-white drop-shadow-lg">
              {T.onboarding.welcomeTitle}
            </h1>
            <p className="text-sm text-white/90 drop-shadow">
              {T.onboarding.welcomeSubtitle}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Language selector — compact so it fits in web app without overflow */}
      <motion.div variants={staggerItem} className="w-full space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground text-center">
          {T.onboarding.languageQuestion}
        </p>
        <div className="flex w-full justify-between gap-1 min-w-0 overflow-hidden">
          {LANGUAGES.map((opt, i) => {
            const isSelected = language === opt.value;
            return (
              <motion.button
                key={opt.value}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLanguage(opt.value as AppLanguage)}
                className={cn(
                  "flex flex-1 min-w-0 items-center justify-center gap-1 rounded-lg border-2 px-2 py-1.5 text-[11px] font-medium transition-all duration-300 shrink-0 overflow-hidden",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1",
                  "hover:shadow-md active:scale-[0.98]",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-primary/50 hover:shadow-sm"
                )}
              >
                <span className="text-xs shrink-0 leading-none">{opt.flag}</span>
                <span className="truncate text-[11px]">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-md">
          <div className="space-y-0.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Sparkles className="h-4 w-4 text-neutral-600" strokeWidth={2} />
              {T.onboarding.whatYoullSetUp}
            </h3>
            <p className="text-xs text-neutral-500">{T.onboarding.setupDescription}</p>
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="flex gap-2 text-xs text-neutral-600">
              <span className="font-medium text-neutral-900">1.</span>
              <span>{T.onboarding.step1Description}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
