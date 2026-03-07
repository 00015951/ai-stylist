"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OnboardingLanguage } from "./onboarding-language";
import { OnboardingProfile } from "./onboarding-profile";
import { OnboardingStylePrefs } from "./onboarding-style-prefs";
import { useTelegram } from "@/providers/telegram-provider";
import { useAppStore } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";
import { stepTransition } from "@/lib/animations";

const TOTAL_STEPS = 3;

interface OnboardingFlowProps {
  onComplete: () => void;
}

/**
 * Multi-step onboarding flow controller
 * Manages step navigation, progress indication, and Telegram SDK integration
 */
export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const { isTelegram, setMainButton, setBackButton, haptic } = useTelegram();
  const formSubmitRef = useRef<() => void | null>(null);
  const language = useAppStore((state) => state.language);
  const T = getTranslations(language);

  const progress = (step / TOTAL_STEPS) * 100;
  const stepLabel = T.onboarding.stepOf.replace("{step}", String(step)).replace("{total}", String(TOTAL_STEPS));

  // Telegram MainButton and BackButton — only show when opened inside Telegram, not in standalone web app
  useEffect(() => {
    if (!isTelegram) {
      setMainButton({ text: "", onClick: () => {}, show: false });
      setBackButton(null);
      return;
    }
    if (step === 1) {
      setMainButton({
        text: T.onboarding.startStyling,
        onClick: () => {
          haptic.impact("medium");
          setStep(2);
        },
        show: true,
      });
      setBackButton(null);
    } else if (step === 2) {
      setMainButton({
        text: T.onboarding.continue,
        onClick: () => {
          haptic.impact("medium");
          formSubmitRef.current?.();
        },
        show: true,
      });
      setBackButton(() => {
        haptic.impact("light");
        setStep(1);
      });
    } else if (step === 3) {
      setMainButton({
        text: T.onboarding.generateMyStyle,
        onClick: () => {
          haptic.notification("success");
          formSubmitRef.current?.();
        },
        show: true,
      });
      setBackButton(() => {
        haptic.impact("light");
        setStep(2);
      });
    }
  }, [isTelegram, step, setMainButton, setBackButton, haptic, T.onboarding.startStyling, T.onboarding.continue, T.onboarding.generateMyStyle]);

  // Hide Telegram buttons when leaving onboarding
  useEffect(() => {
    return () => {
      setMainButton({ text: "", onClick: () => {}, show: false });
      setBackButton(null);
    };
  }, [setMainButton, setBackButton]);

  return (
    <div className="flex flex-1 flex-col gap-4 py-4 sm:gap-6 sm:py-6 min-h-0">
      {/* Main progress bar — only show on steps 1 and 3; step 2 has its own 4-step progress */}
      {step !== 2 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-neutral-500">
            <span>{stepLabel}</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Step content - animated transitions; flex-1 so step 2 can push "Continue" to bottom */}
      <div className="min-h-[50vh] flex-1 flex flex-col overflow-hidden sm:min-h-[60vh]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={stepTransition.transition}
            >
              <OnboardingLanguage
                onNext={() => {
                  haptic.impact("medium");
                  setStep(2);
                }}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={stepTransition.transition}
              className="flex min-h-0 flex-1 flex-col"
            >
              <OnboardingProfile
                formSubmitRef={formSubmitRef}
                onNext={() => {
                  haptic.impact("medium");
                  setStep(3);
                }}
              />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={stepTransition.initial}
              animate={stepTransition.animate}
              exit={stepTransition.exit}
              transition={stepTransition.transition}
            >
              <OnboardingStylePrefs
                formSubmitRef={formSubmitRef}
                onComplete={() => {
                  haptic.notification("success");
                  onComplete();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
