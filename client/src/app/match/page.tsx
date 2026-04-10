"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Loader2, Palette, ImagePlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";
import { useTelegram } from "@/providers/telegram-provider";
import { getTranslations } from "@/lib/i18n";
import { OUTFIT_IMAGES } from "@/lib/outfit-images";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/animations";
import type { SeasonType } from "@/lib/color-seasons";

type Suggestion = {
  outfit: { top: string; bottom: string; shoes: string; accessories: string };
  whyItWorks: string;
};

type MatchMode = "item" | "colors";

type ColorResult = {
  season: SeasonType;
  seasonName: Record<string, string>;
  palette: string[];
  description: string;
};

const SUGGESTION_IMAGES = [
  OUTFIT_IMAGES.casual,
  OUTFIT_IMAGES.elegant,
  OUTFIT_IMAGES.streetwear,
];

export default function MatchPage() {
  const { haptic } = useTelegram();
  const language = useAppStore((state) => state.language);
  const T = getTranslations(language);
  const [mode, setMode] = useState<MatchMode>("item");
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<{
    suggestions: Suggestion[];
    colorAdvice: string;
  } | null>(null);
  const [colorResult, setColorResult] = useState<ColorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    haptic.selection();
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setResult(null);
      setColorResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!preview) {
      haptic.notification("warning");
      return;
    }
    haptic.impact("medium");
    setIsLoading(true);
    setResult(null);
    setColorResult(null);

    try {
      if (mode === "colors") {
        const res = await fetch("/api/analyze-colors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: preview, language }),
        });
        const data: ColorResult = await res.json();
        if (!res.ok) throw new Error("Failed");
        setColorResult(data);
      } else {
        const res = await fetch("/api/match-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: preview,
            description: description.trim() || undefined,
            language,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error("Failed");
        setResult(data);
      }
      haptic.notification("success");
    } catch {
      haptic.notification("error");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: MatchMode) => {
    haptic.selection();
    setMode(m);
    setPreview(null);
    setResult(null);
    setColorResult(null);
  };

  return (
    <motion.div
      className="space-y-6 py-6 pb-24"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">{T.match.title}</h1>
        <p className="text-muted-foreground text-sm">{T.match.subtitle}</p>
      </motion.div>

      {/* Mode toggle */}
      <motion.div variants={staggerItem}>
        <div className="flex gap-2 rounded-xl border border-border/60 bg-white/80 p-1">
          <button
            type="button"
            onClick={() => switchMode("item")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              mode === "item"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Camera className="h-4 w-4" strokeWidth={2} />
            {(T.match as { modeItem?: string }).modeItem ?? T.match.photoOfItem}
          </button>
          <button
            type="button"
            onClick={() => switchMode("colors")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              mode === "colors"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <User className="h-4 w-4" strokeWidth={2} />
            {(T.match as { modeColors?: string }).modeColors ?? "My colors"}
          </button>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="overflow-hidden border-2 border-white/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {mode === "colors" ? (
                <User className="h-5 w-5 text-primary" strokeWidth={2} />
              ) : (
                <Camera className="h-5 w-5 text-primary" strokeWidth={2} />
              )}
              {mode === "colors"
                ? (T.match as { modeColors?: string }).modeColors ?? "My colors"
                : T.match.photoOfItem}
            </CardTitle>
            <CardDescription>
              {mode === "colors"
                ? (T.match as { modeColorsSubtitle?: string }).modeColorsSubtitle ?? "Upload a selfie for personal color analysis"
                : T.match.photoNote}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture={mode === "colors" ? "user" : "environment"}
              onChange={handleFile}
              className="hidden"
            />
            {preview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted ring-2 ring-primary/10"
              >
                <Image
                  src={preview}
                  alt="Upload"
                  fill
                  className="object-contain"
                  unoptimized
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2 shadow-lg transition-all hover:scale-105 active:scale-95"
                  onClick={() => inputRef.current?.click()}
                >
                  {T.match.changePhoto}
                </Button>
              </motion.div>
            ) : (
              <motion.button
                type="button"
                onClick={() => inputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-xl",
                  "border-2 border-dashed border-border bg-muted/40",
                  "text-muted-foreground transition-all duration-300",
                  "hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                )}
              >
                <div className="rounded-full bg-primary/10 p-4">
                  <ImagePlus className="h-10 w-10 text-primary" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-medium">{T.match.tapToUpload}</span>
              </motion.button>
            )}
            {mode === "item" && (
              <Input
                placeholder={T.match.whatInPhoto}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                className="rounded-xl"
              />
            )}
            <Button
              className="w-full min-h-[52px] font-semibold transition-all duration-300 hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:opacity-70"
              onClick={handleSubmit}
              disabled={!preview || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" strokeWidth={2} />
                  {mode === "colors"
                    ? ((T.match as { analyzing?: string }).analyzing ?? "Analyzing...")
                    : T.match.matching}
                </>
              ) : (
                <>
                  <Palette className="mr-2 h-5 w-5" strokeWidth={2} />
                  {mode === "colors"
                    ? ((T.match as { analyzeColors?: string }).analyzeColors ?? "Analyze my colors")
                    : T.match.whatGoesWith}
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
          {result.suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="overflow-hidden border-2 border-white/80 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
                  <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[140px]">
                    <Image
                      src={SUGGESTION_IMAGES[i % SUGGESTION_IMAGES.length] ?? OUTFIT_IMAGES.casual}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 140px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 sm:to-transparent" />
                    <span className="absolute left-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-xs font-semibold text-white">
                      {T.match.look} {i + 1}
                    </span>
                  </div>
                  <div className="col-span-2 p-4">
                    <p className="text-sm text-muted-foreground mb-3">{s.whyItWorks}</p>
                    <ul className="space-y-1.5 text-sm">
                      <li><strong className="text-foreground">{T.match.top}:</strong> {s.outfit.top}</li>
                      <li><strong className="text-foreground">{T.match.bottom}:</strong> {s.outfit.bottom}</li>
                      <li><strong className="text-foreground">{T.match.shoes}:</strong> {s.outfit.shoes}</li>
                      <li><strong className="text-foreground">{T.match.accessories}:</strong> {s.outfit.accessories}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
          <Card className="border-primary/10 bg-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-primary" strokeWidth={2} />
                {T.match.colorAdvice}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{result.colorAdvice}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {colorResult && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-primary/10 bg-accent/20 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-primary" strokeWidth={2} />
                {(T.match as { yourSeason?: string }).yourSeason ?? "Your color season"}
              </CardTitle>
              <CardDescription>
                {colorResult.seasonName[language] ?? colorResult.seasonName.en}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{colorResult.description}</p>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {(T.match as { yourPalette?: string }).yourPalette ?? "Your palette"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {colorResult.palette.map((hex, i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-full shadow-md ring-2 ring-white"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
