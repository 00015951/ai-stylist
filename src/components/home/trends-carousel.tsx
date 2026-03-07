"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";
import { TRENDS, type TrendItem } from "@/lib/trends-data";
import { useTelegram } from "@/providers/telegram-provider";

const ITEM_WIDTH = 67; // circle 55 + gap 12
const SWIPE_THRESHOLD = 50; // min px to treat as swipe

/**
 * Instagram Stories-style trends carousel
 */
export function TrendsCarousel() {
  const language = useAppStore((state) => state.language);
  const viewedTrendIds = useAppStore((state) => state.viewedTrendIds);
  const markTrendViewed = useAppStore((state) => state.markTrendViewed);
  const T = getTranslations(language);
  const { haptic } = useTelegram();
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const active = TRENDS.find((t) => t.id === activeId);
  const tTitle = active ? active.title[language] ?? active.title.en : "";
  const tSubtitle = active ? (active.subtitle?.[language] ?? active.subtitle?.en ?? "") : "";

  const setStoryModalOpen = useAppStore((state) => state.setStoryModalOpen);

  const openStory = (id: string) => {
    haptic.impact("light");
    setActiveId(id);
    markTrendViewed(id);
    setStoryModalOpen(true);
  };

  const closeStory = () => {
    setActiveId(null);
    setStoryModalOpen(false);
  };

  const scroll = useCallback(
    (dir: "left" | "right") => {
      haptic.selection();
      if (!scrollRef.current) return;
      const step = ITEM_WIDTH * 2;
      scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
    },
    [haptic]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - touchStartX.current;
      const deltaY = endY - touchStartY.current;
      // horizontal swipe dominates
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < 0) scroll("right");
        else scroll("left");
      }
    },
    [scroll]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-foreground">
          {T.trends?.sectionTitle ?? "Trends"}
        </h2>
      </div>

      {/* Horizontal scroll — Stories-style circles */}
      <div className="relative -mx-4 overflow-hidden px-4">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {TRENDS.map((t) => (
            <TrendStoryCircle
              key={t.id}
              item={t}
              language={language}
              isActive={activeId === t.id}
              isViewed={viewedTrendIds.includes(t.id)}
              onClick={() => openStory(t.id)}
            />
          ))}
        </div>
      </div>

      {/* Full-screen story view */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={closeStory}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image or gradient background */}
              {active.imageUrl ? (
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={active.imageUrl}
                    alt={tTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 448px) 100vw, 448px"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className={`aspect-[4/5] w-full bg-gradient-to-br ${active.gradient}`}
                />
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="rounded-xl bg-black/30 p-4 backdrop-blur-sm">
                  <h3 className="font-heading text-xl font-bold">{tTitle}</h3>
                  {tSubtitle && (
                    <p className="mt-1 text-sm text-white/90">{tSubtitle}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={closeStory}
                className="absolute right-3 top-3 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrendStoryCircle({
  item,
  language,
  isActive,
  isViewed,
  onClick,
}: {
  item: TrendItem;
  language: string;
  isActive: boolean;
  isViewed: boolean;
  onClick: () => void;
}) {
  const title = item.title[language as keyof typeof item.title] ?? item.title.en;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 snap-start flex-col items-center gap-2"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative h-[55px] w-[55px] overflow-hidden rounded-full bg-gradient-to-br ${item.gradient} shadow-lg ${
          !isViewed ? "ring-2 ring-burgundy ring-offset-2 ring-offset-background" : ""
        }`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="55px"
            unoptimized
          />
        ) : null}
      </motion.div>
      <span className="max-w-[60px] truncate text-center text-[10px] font-medium text-foreground">
        {title}
      </span>
    </button>
  );
}
