"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Palette, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore, type StylePreference } from "@/store/use-app-store";
import { OUTFIT_IMAGES, getCapsuleCategoryImages } from "@/lib/outfit-images";
import { getTranslations } from "@/lib/i18n";
import { useTelegram } from "@/providers/telegram-provider";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem, cardSelectTransition } from "@/lib/animations";

type CapsulePiece = {
  category: string;
  count: number;
  items: string[];
  tip?: string;
};

type CapsuleResult = {
  style: string;
  intro: string;
  pieces: CapsulePiece[];
  colorPalette: string[];
  shoppingStores: string[];
};

const STYLE_OPTIONS: {
  value: StylePreference;
  key: "casual" | "business" | "streetwear" | "elegant" | "sporty" | "bohemian";
  gradient: string;
}[] = [
  { value: "casual", key: "casual", gradient: "from-amber-400/40 to-orange-500/30" },
  { value: "business", key: "business", gradient: "from-slate-500/40 to-sky-600/30" },
  { value: "streetwear", key: "streetwear", gradient: "from-gray-600/50 to-neutral-700/40" },
  { value: "elegant", key: "elegant", gradient: "from-rose-400/40 to-pink-500/30" },
  { value: "sporty", key: "sporty", gradient: "from-emerald-400/40 to-teal-500/30" },
  { value: "bohemian", key: "bohemian", gradient: "from-violet-400/40 to-fuchsia-500/30" },
];

export default function CapsulePage() {
  const { haptic } = useTelegram();
  const language = useAppStore((state) => state.language);
  const T = getTranslations(language);
  const [style, setStyle] = useState<StylePreference>("casual");
  const [customStyle, setCustomStyle] = useState("");
  const [result, setResult] = useState<CapsuleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    haptic.impact("medium");
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate-capsule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          language,
          customStyle: customStyle.trim() || undefined,
        }),
      });
      const data: CapsuleResult = await res.json();
      if (!res.ok) throw new Error("Failed");
      setResult(data);
      haptic.notification("success");
    } catch {
      haptic.notification("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6 py-6 pb-24"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">{T.capsule.title}</h1>
        <p className="text-muted-foreground text-sm">{T.capsule.subtitle}</p>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="overflow-hidden border-2 border-white/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
              {T.capsule.capsuleStyle}
            </CardTitle>
            <CardDescription>{T.capsule.capsuleStyleNote}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Style selection - image cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STYLE_OPTIONS.map((opt) => {
                const isSelected = style === opt.value;
                const imgSrc = OUTFIT_IMAGES[opt.value] ?? OUTFIT_IMAGES.casual;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      haptic.selection();
                      setStyle(opt.value);
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={cardSelectTransition}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border-2 transition-all duration-300",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary ring-2 ring-primary/40 shadow-lg"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    )}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={imgSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 45vw, 150px"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-t transition-opacity",
                          opt.gradient,
                          isSelected ? "opacity-75" : "opacity-50 group-hover:opacity-60"
                        )}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-end p-2">
                        <span className="text-xs font-semibold text-white drop-shadow-lg">
                          {T.onboarding[opt.key]}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={cardSelectTransition}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                        >
                          <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {T.capsule.customStylePlaceholder}
              </label>
              <input
                type="text"
                placeholder={T.capsule.customStylePlaceholder}
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>

            <Button
              className="w-full min-h-[52px] font-semibold transition-all duration-300 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-70"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" strokeWidth={2} />
                  {T.capsule.generating}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" strokeWidth={2} />
                  {T.capsule.generateCapsule}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-primary/10 bg-accent/20">
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.intro}
              </p>
            </CardContent>
          </Card>

          {result.pieces.map((piece, idx) => {
            const images = getCapsuleCategoryImages(piece.category, piece.count);
            const hasImages = images.length > 0;
            return (
              <motion.div
                key={piece.category}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden">
                  {!hasImages && (
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {piece.category} ({piece.count})
                      </CardTitle>
                      {piece.tip && <CardDescription>{piece.tip}</CardDescription>}
                    </CardHeader>
                  )}
                  {hasImages && (
                    <>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {piece.category} ({piece.count})
                        </CardTitle>
                        {piece.tip && <CardDescription>{piece.tip}</CardDescription>}
                      </CardHeader>
                      <div className="grid grid-cols-2 gap-3 px-4 pb-2 sm:grid-cols-4">
                        {images.map((src, i) => (
                          <div
                            key={i}
                            className="relative flex flex-col items-center rounded-xl bg-white py-3"
                          >
                            <div className="relative h-[100px] w-full min-w-0 drop-shadow-sm">
                              <Image
                                src={src}
                                alt={piece.items[i] ?? piece.category}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 50vw, 120px"
                              />
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-center text-xs text-muted-foreground">
                              {piece.items[i]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <CardContent className={hasImages ? "pt-0" : ""}>
                    {!hasImages && (
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {piece.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          <Card className="border-primary/10 bg-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-primary" strokeWidth={2} />
                {T.capsule.colorPalette}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {result.colorPalette.join(" · ")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="h-5 w-5 text-primary" strokeWidth={2} />
                {T.capsule.whereToBuy}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {result.shoppingStores.join(", ")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
