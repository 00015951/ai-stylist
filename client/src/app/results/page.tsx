"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Shirt,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  Check,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, type OutfitSuggestion } from "@/store/use-app-store";
import { useTelegram } from "@/providers/telegram-provider";
import { getTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { LoadingLoader } from "@/components/ui/loading-loader";
import { addToWardrobe } from "@/lib/api";

const AI_SCORE = 92;

function truncate(str: string, maxLen: number) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trim() + "…";
}

/**
 * Accordion for outfit details - collapsible sections
 */
function AccordionSection({
  title,
  icon: Icon,
  children,
  open,
  onToggle,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/40 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-medium transition-colors hover:text-primary"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary/80" />
          {title}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-3 pl-6 text-sm text-muted-foreground">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Brand tags - rounded badges instead of comma-separated text
 */
function BrandTags({ brands }: { brands: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {brands.slice(0, 8).map((brand) => (
        <span
          key={brand}
          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          {brand}
        </span>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { haptic, initData } = useTelegram();
  const lastGeneratedResult = useAppStore((state) => state.lastGeneratedResult);
  const language = useAppStore((state) => state.language);
  const addToFavorites = useAppStore((state) => state.addToFavorites);
  const favorites = useAppStore((state) => state.favorites);
  const setLastGeneratedResult = useAppStore(
    (state) => state.setLastGeneratedResult
  );
  const setEditFromResult = useAppStore((state) => state.setEditFromResult);

  const T = getTranslations(language);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (!lastGeneratedResult) {
      router.replace("/");
    }
  }, [lastGeneratedResult, router]);

  const handleSave = async () => {
    if (!lastGeneratedResult || isSaved) return;
    haptic.notification("success");
    const payload = {
      occasion: lastGeneratedResult.occasion,
      outfit: selected.outfit,
      personaSummary: lastGeneratedResult.personaSummary,
      imageUrl: selectedImage,
      shopping: selectedShopping,
    };
    if (process.env.NEXT_PUBLIC_API_URL && initData) {
      const saved = await addToWardrobe(payload, initData);
      if (saved?.id != null) {
        addToFavorites({
          ...payload,
          id: String(saved.id),
          createdAt: saved.createdAt ?? new Date().toISOString(),
        });
      } else {
        addToFavorites(payload);
      }
    } else {
      addToFavorites(payload);
    }
    setIsSaved(true);
  };

  const handleGenerateNew = () => {
    haptic.impact("light");
    setLastGeneratedResult(null);
    router.push("/");
  };

  const handleBack = () => {
    haptic.impact("light");
    setLastGeneratedResult(null);
    router.back();
  };

  if (!lastGeneratedResult) return <LoadingLoader />;

  const { personaSummary, occasion, outfit, imageUrl, outfits: outfitsList } =
    lastGeneratedResult;
  const outfits: OutfitSuggestion[] =
    Array.isArray(outfitsList) && outfitsList.length > 0
      ? outfitsList
      : [{ outfit, imageUrl, whyItWorks: personaSummary, shopping: undefined }];
  const selected = outfits[selectedTab] ?? outfits[0]!;
  const selectedOutfit = selected.outfit;
  const selectedImage = selected.imageUrl ?? imageUrl;
  const selectedShopping = selected.shopping;

  const alreadySaved = favorites.some(
    (f) =>
      f.occasion === occasion &&
      f.outfit.top === selectedOutfit.top &&
      f.outfit.bottom === selectedOutfit.bottom
  );
  const canSave = !isSaved && !alreadySaved;

  const allBrands = selectedShopping
    ? [
        ...(selectedShopping.top?.brands ?? []),
        ...(selectedShopping.bottom?.brands ?? []),
        ...(selectedShopping.shoes?.brands ?? []),
        ...(selectedShopping.accessories?.brands ?? []),
      ]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10)
    : [];
  const allStores = selectedShopping
    ? [
        ...(selectedShopping.top?.stores ?? []),
        ...(selectedShopping.bottom?.stores ?? []),
        ...(selectedShopping.shoes?.stores ?? []),
        ...(selectedShopping.accessories?.stores ?? []),
      ]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 8)
    : [];

  const aiScoreText = (T.results as { aiMatchScore?: string }).aiMatchScore?.replace(
    "{score}",
    String(AI_SCORE)
  ) ?? `AI Match Score: ${AI_SCORE}% perfect for your body type`;

  return (
    <div className="relative min-h-dvh pb-44 pt-[env(safe-area-inset-top)]">
      {/* Header - tepadagi yozuv ko‘rinsin */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/40 bg-white/70 px-4 py-3 backdrop-blur-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="-ml-2 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-foreground/80 truncate">
          {occasion}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerateNew}
          className="-mr-2 rounded-full text-primary font-medium"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {T.results.generateNew}
        </Button>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {/* AI Confidence Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 shadow-soft-burgundy backdrop-blur-md"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
          <span className="text-sm font-medium text-foreground/90">
            {aiScoreText}
          </span>
        </motion.div>

        {/* Tabs: Look 1 | Look 2 | Look 3 | Look 4 */}
        {outfits.length > 1 && (
          <div className="flex gap-1 overflow-x-auto pb-1">
            {outfits.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  haptic.selection();
                  setSelectedTab(i);
                  setDetailsOpen(false);
                }}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  i === selectedTab
                    ? "bg-primary text-primary-foreground shadow-soft-burgundy"
                    : "bg-white/60 text-muted-foreground hover:bg-white/80"
                )}
              >
                {T.results.lookLabel} {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Look Card - one visible at a time */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl bg-white/70 shadow-soft-burgundy backdrop-blur-md"
          >
            {/* Outfit image */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-2xl bg-muted/30">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={occasion}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Shirt className="h-16 w-16 text-muted-foreground/40" strokeWidth={1.5} />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div className="p-4">
              {/* Short description (2-3 lines max) */}
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {truncate(selected.whyItWorks ?? personaSummary, 140)}
              </p>

              {/* View Details accordion */}
              <div className="mt-4 rounded-xl border border-white/60 bg-white/40 p-3">
                <AccordionSection
                  title={detailsOpen ? T.results.hideDetails : T.results.viewDetails}
                  icon={Shirt}
                  open={detailsOpen}
                  onToggle={() => {
                    haptic.selection();
                    setDetailsOpen((o) => !o);
                  }}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1 text-xs font-semibold text-foreground/80">
                        {T.results.top}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOutfit.top}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-foreground/80">
                        {T.results.bottom}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOutfit.bottom}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-foreground/80">
                        {T.results.shoes}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOutfit.shoes}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-semibold text-foreground/80">
                        {T.results.accessories}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedOutfit.accessories}
                      </p>
                    </div>
                    {allBrands.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold text-foreground/80">
                          {T.results.whereToBuy}
                        </p>
                        <BrandTags brands={allBrands} />
                        {allStores.length > 0 && (
                          <div className="mt-2">
                            <p className="mb-1.5 text-xs text-muted-foreground">
                              {T.results.stores}
                            </p>
                            <BrandTags brands={allStores} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionSection>
              </div>

              {/* Confirm, Edit, Generate New - result card ichida */}
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <Button
                    variant="cta"
                    size="lg"
                    className="flex-1 rounded-full font-heading"
                    onClick={async () => {
                      if (canSave) await handleSave();
                      else haptic.notification("success");
                      router.push("/");
                    }}
                  >
                    <Check className="mr-2 h-5 w-5" strokeWidth={2} />
                    {T.results.confirm}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 rounded-full font-heading"
                    onClick={() => {
                      haptic.impact("light");
                      setLastGeneratedResult(null);
                      setEditFromResult({ occasion });
                      router.push("/");
                    }}
                  >
                    <Pencil className="mr-2 h-5 w-5" strokeWidth={2} />
                    {T.results.edit}
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full rounded-full font-heading"
                  onClick={handleGenerateNew}
                >
                  <Sparkles className="mr-2 h-5 w-5" strokeWidth={2} />
                  {T.results.generateNew}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
