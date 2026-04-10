"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X, Sparkles, Shirt, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OUTFIT_IMAGES } from "@/lib/outfit-images";
import { useAppStore } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";

const HERO_IMAGE = OUTFIT_IMAGES.elegant ?? OUTFIT_IMAGES.casual;

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export function HeroSection() {
  const language = useAppStore((state) => state.language);
  const T = getTranslations(language);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const H = (T as { howItWorks?: { title: string; step1Title: string; step1Desc: string; step2Title: string; step2Desc: string; step3Title: string; step3Desc: string } }).howItWorks;

  return (
    <>
    <motion.section
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 via-[#f5ebec]/90 to-[#efe0e2]/80 shadow-xl ring-1 ring-black/5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid min-h-[360px] grid-cols-1 gap-0 md:grid-cols-2 md:min-h-[380px]">
        {/* Text content - clear hierarchy */}
        <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12 lg:px-14">
          <motion.h1
            className="font-heading text-2xl font-bold tracking-tight text-stone-900 md:text-3xl lg:text-[2rem]"
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.1 }}
          >
            {T.home.title}
          </motion.h1>
          <motion.p
            className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600 md:text-base"
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.15 }}
          >
            {T.home.subtitle}
          </motion.p>
          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.2 }}
          >
            <Button
              variant="ghost"
              size="lg"
              className="rounded-xl border border-stone-200 transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
              onClick={() => setShowHowItWorks(true)}
            >
              <Info className="mr-2 h-4 w-4" strokeWidth={2} />
              <span className="font-heading">{H?.title ?? "How it works"}</span>
            </Button>
          </motion.div>
        </div>

        {/* Fashion image - prominent, with subtle float animation */}
        <motion.div
          className="relative order-first aspect-[4/3] md:order-last md:aspect-auto md:min-h-[380px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt="Elegant fashion outfit"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </motion.div>
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:bg-gradient-to-l md:from-black/15 md:via-transparent md:to-transparent"
            aria-hidden
          />
        </motion.div>
      </div>
    </motion.section>

      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowHowItWorks(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-stone-900">
                  {H?.title ?? "How it works"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHowItWorks(false)}
                  className="rounded-full p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-stone-900">
                      {H?.step1Title ?? "Describe your occasion"}
                    </h3>
                    <p className="mt-0.5 text-sm text-stone-600">
                      {H?.step1Desc ?? "Tell us where you're going or what you need."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Shirt className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-stone-900">
                      {H?.step2Title ?? "AI creates your look"}
                    </h3>
                    <p className="mt-0.5 text-sm text-stone-600">
                      {H?.step2Desc ?? "We suggest outfits that match your style."}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-5 w-5 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-stone-900">
                      {H?.step3Title ?? "Confirm or edit"}
                    </h3>
                    <p className="mt-0.5 text-sm text-stone-600">
                      {H?.step3Desc ?? "Like it? Save it. Want changes? Tap Edit."}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                className="mt-6 w-full font-heading"
                onClick={() => setShowHowItWorks(false)}
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
