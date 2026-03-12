"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CloudSun, Send, User } from "lucide-react";
import { useAppStore, type GeneratedStyleResult } from "@/store/use-app-store";
import { getTranslations } from "@/lib/i18n";
import { generateStyle as apiGenerateStyle, getWeather } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTelegram } from "@/providers/telegram-provider";
import { HeroSection } from "@/components/home/hero-section";
import { TrendsCarousel } from "@/components/home/trends-carousel";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  result?: GeneratedStyleResult;
};

/**
 * Home page - GPT-style chat for generating looks
 */
export function HomePage() {
  const router = useRouter();
  const { haptic, initData } = useTelegram();
  const profile = useAppStore((state) => state.profile);
  const stylePreferences = useAppStore((state) => state.stylePreferences);
  const language = useAppStore((state) => state.language);
  const T = getTranslations(language);
  const setLastGeneratedResult = useAppStore(
    (state) => state.setLastGeneratedResult
  );
  const editFromResult = useAppStore((state) => state.editFromResult);
  const setEditFromResult = useAppStore((state) => state.setEditFromResult);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useWeather, setUseWeather] = useState(false);
  const [weatherCity, setWeatherCity] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [trendInspired, setTrendInspired] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editFromResult?.occasion) {
      setInputValue(
        editFromResult.occasion +
          (inputValue ? `\n\n${inputValue}` : "")
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const raw = (text ?? inputValue).trim();
    let occasionText = raw;
    let weather: { tempC: number; condition: string; city?: string } | undefined;

    if (useWeather && weatherCity.trim()) {
      setWeatherLoading(true);
      try {
        const wData = await getWeather(weatherCity.trim());
        if (wData?.tempC != null) {
          weather = {
            tempC: wData.tempC,
            condition: wData.condition ?? "Unknown",
            city: wData.city,
          };
          occasionText =
            occasionText ||
            `${wData.city ?? weatherCity}, ${wData.tempC}°C, ${wData.condition}`;
        }
      } finally {
        setWeatherLoading(false);
      }
    }

    if (!occasionText) {
      haptic.notification("warning");
      return;
    }

    haptic.impact("medium");
    if (!text) setInputValue("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: occasionText }]);

    try {
      const data: GeneratedStyleResult = await apiGenerateStyle(
        {
          occasion: occasionText,
          language,
          profile: profile ? { ...profile } as Record<string, unknown> : undefined,
          stylePreferences: stylePreferences ?? [],
          weather,
          trendInspired,
        },
        initData
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.personaSummary,
          result: data,
        },
      ]);
      setEditFromResult(null);
      haptic.notification("success");
    } catch {
      haptic.notification("error");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFullLook = (result: GeneratedStyleResult) => {
    setLastGeneratedResult(result);
    router.push("/results");
  };

  const QUICK_OCCASIONS: string[] = [
    T.onboarding.date,
    T.onboarding.work,
    T.onboarding.weekend,
    T.onboarding.party,
  ];

  const canSend =
    (inputValue.trim() || (useWeather && weatherCity.trim())) &&
    !isLoading &&
    !weatherLoading;

  return (
    <motion.div
      className="flex flex-col min-h-[calc(100vh-8rem)] py-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={staggerItem} className="shrink-0">
        <HeroSection />
      </motion.div>

      <motion.div variants={staggerItem} className="shrink-0 mt-4">
        <TrendsCarousel />
      </motion.div>

      <motion.div variants={staggerItem} className="shrink-0 mt-3">
        <div className="flex gap-2 rounded-xl border border-border/60 bg-white/80 p-1">
          <button
            type="button"
            onClick={() => setTrendInspired(false)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              !trendInspired
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {T.trends?.classic ?? "Classic"}
          </button>
          <button
            type="button"
            onClick={() => setTrendInspired(true)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              trendInspired
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {T.trends?.trendInspired ?? "Trend-inspired"}
          </button>
        </div>
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto min-h-0 mt-4 space-y-4 pb-2">
        {messages.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-muted/40 border border-border/50 p-4"
          >
            <p className="text-sm text-muted-foreground mb-4">
              {(T.home as { welcomeMessage?: string }).welcomeMessage ??
                "What do you want to wear? Describe the occasion or ask for a look."}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_OCCASIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSend(label)}
                  className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/15 active:scale-95"
                >
                  + {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/80 text-foreground rounded-bl-md border border-border/50"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.result && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {T.results.recommendedOutfit}
                    </p>
                    <ul className="text-xs space-y-0.5">
                      <li><strong>{T.results.top}:</strong> {msg.result.outfit.top}</li>
                      <li><strong>{T.results.bottom}:</strong> {msg.result.outfit.bottom}</li>
                      <li><strong>{T.results.shoes}:</strong> {msg.result.outfit.shoes}</li>
                      <li><strong>{T.results.accessories}:</strong> {msg.result.outfit.accessories}</li>
                    </ul>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2 w-full"
                      onClick={() => handleViewFullLook(msg.result!)}
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      {(T.home as { viewFullLook?: string }).viewFullLook ?? "View full look"}
                    </Button>
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 justify-start"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-muted/80 border border-border/50 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* GPT-style input bar */}
      <motion.div
        variants={staggerItem}
        className="shrink-0 mt-3 rounded-2xl border-2 border-border/60 bg-white/95 shadow-lg backdrop-blur-sm p-2"
      >
        {useWeather && (
          <div className="mb-2">
            <Input
              placeholder={T.home.cityPlaceholder}
              value={weatherCity}
              onChange={(e) => setWeatherCity(e.target.value)}
              disabled={isLoading}
              className="rounded-xl text-sm h-9"
            />
          </div>
        )}
        <div className="flex gap-2 items-center">
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={useWeather}
              onChange={(e) => setUseWeather(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-primary"
            />
            <CloudSun className="h-4 w-4" strokeWidth={2} />
          </label>
          <input
            ref={inputRef}
            type="text"
            placeholder={(T.home as { chatPlaceholder?: string }).chatPlaceholder ?? T.home.occasionPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading || weatherLoading}
            className="flex-1 min-w-0 rounded-xl border-0 bg-muted/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            maxLength={300}
          />
          <Button
            size="icon"
            className="shrink-0 h-10 w-10 rounded-xl"
            onClick={() => handleSend()}
            disabled={!canSend}
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
