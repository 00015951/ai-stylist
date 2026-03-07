"use client";

import React, { createContext, useContext, useEffect, useCallback } from "react";

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
  const backButtonHandlerRef = React.useRef<(() => void) | null>(null);

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
          // Only show Telegram UI (e.g. bottom MainButton) when opened inside Telegram; in browser initData is empty
          if (tg.WebApp.initData) {
            setIsTelegram(true);
          }
        }
      } catch {
        // Not in Telegram - app will work in standalone mode
        setIsTelegram(false);
      }
    };

    initTelegram();
  }, []);

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
      value={{ isTelegram, setMainButton, setBackButton, haptic }}
    >
      {children}
    </TelegramContext.Provider>
  );
}
