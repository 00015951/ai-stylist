"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useAppStore, type StylePreference } from "@/store/use-app-store";
import { OUTFIT_IMAGES } from "@/lib/outfit-images";
import { getTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Textarea } from "@/components/ui/textarea";

const STYLE_OPTIONS: {
  value: StylePreference;
  key: keyof ReturnType<typeof getTranslations>["onboarding"];
}[] = [
  { value: "casual", key: "casual" },
  { value: "business", key: "business" },
  { value: "streetwear", key: "streetwear" },
  { value: "elegant", key: "elegant" },
  { value: "sporty", key: "sporty" },
  { value: "bohemian", key: "bohemian" },
];

interface OnboardingStylePrefsProps {
  formSubmitRef: React.MutableRefObject<(() => void) | null>;
  onComplete: () => void;
}

/**
 * Step 3: Style preferences — premium minimal design, neutral palette, dark accent
 */
export function OnboardingStylePrefs({
  formSubmitRef,
  onComplete,
}: OnboardingStylePrefsProps) {
  const language = useAppStore((state) => state.language);
  const setStylePreferences = useAppStore((state) => state.setStylePreferences);
  const setCustomStyleDescription = useAppStore(
    (state) => state.setCustomStyleDescription
  );
  const setOnboardingComplete = useAppStore(
    (state) => state.setOnboardingComplete
  );
  const T = getTranslations(language);
  const [selected, setSelected] = useState<StylePreference[]>([]);
  const [error, setError] = useState("");
  const [showMyVariantChat, setShowMyVariantChat] = useState(false);
  const [customStyleInput, setCustomStyleInput] = useState("");

  const toggleStyle = (style: StylePreference) => {
    setError("");
    setSelected((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const handleComplete = () => {
    if (selected.length === 0) {
      setError(T.onboarding.selectAtLeastOne);
      return;
    }
    setStylePreferences(selected);
    setCustomStyleDescription(null);
    setOnboardingComplete(true);
    onComplete();
  };

  const handleMyVariantClick = () => {
    setShowMyVariantChat(true);
  };

  const handleMyVariantSubmit = () => {
    const text = customStyleInput.trim();
    if (!text) return;
    setCustomStyleDescription(text);
    setStylePreferences(["casual"]); // fallback for API compatibility
    setOnboardingComplete(true);
    onComplete();
  };

  formSubmitRef.current = handleComplete;

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-900">
          {T.onboarding.stylePreferences}
        </h2>
        <p className="text-sm text-neutral-500">{T.onboarding.styleNote}</p>
      </motion.div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="space-y-4">
          {/* Photo preview */}
          {selected.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200"
            >
              <Image
                src={OUTFIT_IMAGES[selected[selected.length - 1]!] ?? OUTFIT_IMAGES.casual}
                alt=""
                fill
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 640px) 100vw, 400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-sm font-medium text-white drop-shadow-md">
                {selected.map((s) => T.onboarding[s as keyof typeof T.onboarding]).join(", ")}
              </p>
            </motion.div>
          )}

          {/* Style cards — neutral border, selected = dark bg + white text */}
          <div className="grid grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((option, i) => {
              const isSelected = selected.includes(option.value);
              const imgSrc = OUTFIT_IMAGES[option.value] ?? OUTFIT_IMAGES.casual;
              return (
                <motion.button
                  key={option.value}
                  type="button"
                  variants={staggerItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  onClick={() => toggleStyle(option.value)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 bg-white transition-all duration-300",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
                    "hover:shadow-md active:scale-[0.99]",
                    isSelected
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-neutral-200 hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={imgSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 45vw, 200px"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 transition-opacity duration-300",
                        isSelected ? "bg-primary/70" : "bg-primary/30 group-hover:bg-primary/40"
                      )}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-3">
                      <span
                        className="text-sm font-medium text-white drop-shadow"
                      >
                        {T.onboarding[option.key]}
                      </span>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white"
                      >
                        <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>

      <motion.div variants={staggerItem} className="space-y-3">
        <button
          type="button"
          onClick={handleMyVariantClick}
          className={cn(
            "flex w-full min-h-[52px] items-center justify-center rounded-xl font-medium transition-all duration-300",
            "border-2 border-primary text-primary hover:bg-primary/5 hover:scale-[1.01] active:scale-[0.99]"
          )}
        >
          {T.onboarding.myVariant}
        </button>
      </motion.div>

      <AnimatePresence>
        {showMyVariantChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <Textarea
                value={customStyleInput}
                onChange={(e) => setCustomStyleInput(e.target.value)}
                placeholder={T.onboarding.myVariantChatPlaceholder}
                className="min-h-[100px] resize-none"
                autoFocus
              />
              <button
                type="button"
                onClick={handleMyVariantSubmit}
                disabled={!customStyleInput.trim()}
                className={cn(
                  "flex w-full min-h-[48px] items-center justify-center rounded-xl font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                  "bg-primary hover:bg-primary/90 active:scale-[0.99]"
                )}
              >
                {T.onboarding.myVariantSubmit}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
