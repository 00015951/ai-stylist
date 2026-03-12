"use client";

import React, { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { getUserProfile, getWardrobe } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";

/**
 * Telegram Web App SDK types
 * The @twa-dev/sdk provides the WebApp object when running inside Telegram
 */
declare global {
  interface Window {
    Telegram?: {
        WebApp: {
          ready: () => void;
          expand: () => void;
          close: () => void;
          /** Only set when opened inside Telegram; empty in browser */
          initData?: string;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          setParams: (params: { color?: string; text_color?: string; text?: string }) => void;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

interface TelegramContextValue {
  /** Whether the app is running inside Telegram */
  isTelegram: boolean;
  /** initData for backend auth (only when opened from Telegram) */
  initData: string | null;
  /** Main button click handler - use to attach custom actions */
  setMainButton: (config: {
    text: string;
    onClick: () => void;
    show?: boolean;
  }) => void;
  /** Back button - use for navigation */
  setBackButton: (onClick: (() => void) | null) => void;
  /** Haptic feedback for better UX */
  haptic: {
    impact: (style?: "light" | "medium" | "heavy") => void;
    notification: (type: "error" | "success" | "warning") => void;
    selection: () => void;
  };
}

const TelegramContext = createContext<TelegramContextValue>({
  isTelegram: false,
  initData: null,
  setMainButton: () => {},
  setBackButton: () => {},
  haptic: {
    impact: () => {},
    notification: () => {},
    selection: () => {},
  },
});

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within TelegramProvider");
  }
  return context;
}

interface TelegramProviderProps {
  children: React.ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isTelegram, setIsTelegram] = React.useState(false);
  const [initData, setInitData] = React.useState<string | null>(null);
  const backButtonHandlerRef = React.useRef<(() => void) | null>(null);

  const syncedRef = useRef(false);

  useEffect(() => {
    // Dynamically import the SDK to avoid SSR issues
    const initTelegram = async () => {
      if (typeof window === "undefined") return;

      try {
        // Load the Telegram Web App script if not in Telegram
        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-web-app.js";
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });

        const tg = (window as Window & { Telegram?: { WebApp: { initData?: string; ready?: () => void; expand?: () => void } } })
          .Telegram;
        if (tg?.WebApp) {
          tg.WebApp.ready?.();
          tg.WebApp.expand?.();
          if (tg.WebApp.initData) {
            setIsTelegram(true);
            setInitData(tg.WebApp.initData);
          }
        }
      } catch {
        // Not in Telegram - app will work in standalone mode
        setIsTelegram(false);
      }
    };

    initTelegram();
  }, []);

  // Sync profile & wardrobe from backend when we have initData + API
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    if (!apiBase || !initData || syncedRef.current) return;
    syncedRef.current = true;

    const setProfile = useAppStore.getState().setProfile;
    const setStylePreferences = useAppStore.getState().setStylePreferences;
    const setOnboardingComplete = useAppStore.getState().setOnboardingComplete;
    const setFavorites = useAppStore.getState().setFavorites;

    Promise.all([
      getUserProfile(initData),
      getWardrobe(initData),
    ]).then(([profileRes, wardrobeRes]) => {
      if (profileRes?.onboarding) {
        const o = profileRes.onboarding;
        setProfile({
          height: o.height ?? 170,
          weight: o.weight ?? 70,
          gender: o.gender ?? "other",
          bodyType: o.bodyType ?? "average",
          defaultEvent: o.defaultEvent ?? undefined,
          budget: o.budget ?? "medium",
        });
        if (Array.isArray(o.stylePreferences)) setStylePreferences(o.stylePreferences);
        setOnboardingComplete(true);
      }
      if (wardrobeRes?.favorites?.length) {
        setFavorites(wardrobeRes.favorites);
      }
    }).catch(() => {});
  }, [initData]);

  const setMainButton = useCallback(
    (config: { text: string; onClick: () => void; show?: boolean }) => {
      const tg = window.Telegram?.WebApp;
      if (!tg) return;

      // Hide-only: skip setText (empty text causes WebAppBottomButtonParamInvalid)
      if (config.show === false) {
        tg.MainButton.offClick(config.onClick);
        tg.MainButton.hide();
        return;
      }

      // Telegram MainButton.setText rejects empty string
      const text = typeof config.text === "string" && config.text.trim()
        ? config.text.trim()
        : "Continue";
      tg.MainButton.setText(text);
      tg.MainButton.offClick(config.onClick);
      tg.MainButton.onClick(config.onClick);

      // Primary color #722F37 — same as app branding
      if (typeof tg.MainButton.setParams === "function") {
        tg.MainButton.setParams({ color: "#722F37", text_color: "#FFFFFF" });
      } else {
        (tg.MainButton as { color?: string; textColor?: string }).color = "#722F37";
        (tg.MainButton as { color?: string; textColor?: string }).textColor = "#FFFFFF";
      }

      tg.MainButton.show();
      tg.MainButton.enable();
    },
    []
  );

  const setBackButton = useCallback((onClick: (() => void) | null) => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Remove previous handler
    if (backButtonHandlerRef.current) {
      tg.BackButton.offClick(backButtonHandlerRef.current);
      backButtonHandlerRef.current = null;
    }

    if (onClick) {
      backButtonHandlerRef.current = onClick;
      tg.BackButton.onClick(onClick);
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }
  }, []);

  const haptic = {
    impact: (style: "light" | "medium" | "heavy" = "light") => {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: "error" | "success" | "warning") => {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    },
  };

  return (
    <TelegramContext.Provider
      value={{ isTelegram, initData, setMainButton, setBackButton, haptic }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
