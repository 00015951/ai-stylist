import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppLanguage } from "@/lib/i18n";

/**
 * User profile data collected during onboarding
 */
export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  gender: string;
  bodyType: string;
  /** Event/occasion default (e.g. "work", "date", "weekend") */
  defaultEvent?: string;
  /** Budget tier: low | medium | high */
  budget?: string;
}

/**
 * Style preference selected by user
 */
export type StylePreference = 
  | "casual"
  | "business"
  | "streetwear"
  | "elegant"
  | "sporty"
  | "bohemian";

/**
 * Saved outfit for favorites
 */
export interface SavedOutfit {
  id: string;
  occasion: string;
  imageUrl?: string;
  outfit: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string;
  };
  personaSummary: string;
  shopping?: OutfitShopping;
  createdAt: string;
}

/**
 * Shopping suggestion for an outfit piece
 */
export interface ShoppingSuggestion {
  brands: string[];
  stores: string[];
}

export interface OutfitShopping {
  top?: ShoppingSuggestion;
  bottom?: ShoppingSuggestion;
  shoes?: ShoppingSuggestion;
  accessories?: ShoppingSuggestion;
}

/** Single outfit suggestion with reasoning */
export interface OutfitSuggestion {
  outfit: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string;
  };
  imageUrl?: string;
  /** Why this look suits the user / occasion */
  whyItWorks: string;
  shopping?: OutfitShopping;
}

/**
 * Generated styling result from the API (3–5 outfits + color advice)
 */
export interface GeneratedStyleResult {
  personaSummary: string;
  occasion: string;
  /** 3–5 outfit options */
  outfits: OutfitSuggestion[];
  /** Legacy: first outfit for backward compatibility */
  outfit: {
    top: string;
    bottom: string;
    shoes: string;
    accessories: string;
  };
  imageUrl?: string;
  /** Color advice for the occasion / profile */
  colorAdvice?: string;
  shopping?: OutfitShopping;
}


interface AppState {
  // Onboarding
  hasCompletedOnboarding: boolean;
  setOnboardingComplete: (value: boolean) => void;

  // Language
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;

  // User profile
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;

  // Style preferences (can select multiple)
  stylePreferences: StylePreference[];
  setStylePreferences: (preferences: StylePreference[]) => void;
  /** Custom style description from "My variant" flow */
  customStyleDescription: string | null;
  setCustomStyleDescription: (text: string | null) => void;

  // Favorites
  favorites: SavedOutfit[];
  addToFavorites: (outfit: Omit<SavedOutfit, "id" | "createdAt">) => void;
  removeFromFavorites: (id: string) => void;

  // Last generated result (for results page)
  lastGeneratedResult: GeneratedStyleResult | null;
  setLastGeneratedResult: (result: GeneratedStyleResult | null) => void;

  // Edit flow: when user taps Edit on results, we store context for home
  editFromResult: { occasion: string; editInstructions?: string } | null;
  setEditFromResult: (ctx: { occasion: string; editInstructions?: string } | null) => void;

  // Trends — which story IDs the user has already viewed (for carousel ring)
  viewedTrendIds: string[];
  markTrendViewed: (id: string) => void;

  // Story modal open — hide bottom nav when viewing a story
  isStoryModalOpen: boolean;
  setStoryModalOpen: (open: boolean) => void;
}

const defaultProfile: UserProfile = {
  height: 170,
  weight: 70,
  gender: "other",
  bodyType: "average",
  defaultEvent: "",
  budget: "medium",
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      setOnboardingComplete: (value) =>
        set({ hasCompletedOnboarding: value }),

      language: "en",
      setLanguage: (lang) => set({ language: lang }),

      profile: null,
      setProfile: (profile) => set({ profile }),

      stylePreferences: [],
      setStylePreferences: (preferences) =>
        set({ stylePreferences: preferences }),

      customStyleDescription: null,
      setCustomStyleDescription: (text) =>
        set({ customStyleDescription: text }),

      favorites: [],
      addToFavorites: (outfit) =>
        set((state) => ({
          favorites: [
            ...state.favorites,
            {
              ...outfit,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeFromFavorites: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.id !== id),
        })),

      lastGeneratedResult: null,
      setLastGeneratedResult: (result) =>
        set({ lastGeneratedResult: result }),

      editFromResult: null,
      setEditFromResult: (ctx) => set({ editFromResult: ctx }),

      viewedTrendIds: [],
      markTrendViewed: (id) =>
        set((state) => ({
          viewedTrendIds: state.viewedTrendIds.includes(id)
            ? state.viewedTrendIds
            : [...state.viewedTrendIds, id],
        })),

      isStoryModalOpen: false,
      setStoryModalOpen: (open) => set({ isStoryModalOpen: open }),
    }),
    {
      name: "virtual-ai-stylist-storage",
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        language: state.language,
        profile: state.profile,
        stylePreferences: state.stylePreferences,
        customStyleDescription: state.customStyleDescription,
        favorites: state.favorites,
        viewedTrendIds: state.viewedTrendIds,
        // Don't persist lastGeneratedResult - temporary
      }),
    }
  )
);
