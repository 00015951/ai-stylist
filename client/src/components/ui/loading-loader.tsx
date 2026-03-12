"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";

const STEP_KEYS = ["step1", "step2", "step3"] as const;

export function LoadingLoader() {
  const language = useAppStore((state) => state.language);
  const T = getTranslations(language);
  const [stepIndex, setStepIndex] = useState(0);
  const loading = (T as { loading?: Record<string, string> }).loading;
  const steps = [
    loading?.step1 ?? "Analyzing body proportions…",
    loading?.step2 ?? "Matching style preferences…",
    loading?.step3 ?? "Building capsule outfit…",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  const currentStep = steps[stepIndex] ?? steps[0]!;

  return (
    <motion.div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-10 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="relative">
        <motion.div
          className="h-14 w-14 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
        </motion.div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            className="text-center text-sm font-medium text-foreground/90"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep}
          </motion.p>
        </AnimatePresence>
        <div className="flex justify-center gap-1">
          {STEP_KEYS.map((_, i) => (
            <motion.span
              key={i}
              className={i === stepIndex ? "h-1 w-6 rounded-full bg-primary" : "h-1 w-1 rounded-full bg-primary/40"}
              animate={i === stepIndex ? { scaleX: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.4 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
