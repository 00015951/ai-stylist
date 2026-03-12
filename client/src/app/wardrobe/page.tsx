"use client";

import { Shirt, Heart, FolderOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { useTelegram } from "@/providers/telegram-provider";
import { getTranslations } from "@/lib/i18n";
import { getApiBase, removeFromWardrobe } from "@/lib/api";

const LOCALE_MAP: Record<string, string> = { en: "en-US", ru: "ru-RU", uz: "uz-UZ" };

/**
 * Wardrobe page - Displays saved outfits (favorites)
 */
export default function WardrobePage() {
  const language = useAppStore((state) => state.language);
  const favorites = useAppStore((state) => state.favorites);
  const removeFromFavorites = useAppStore((state) => state.removeFromFavorites);
  const { haptic, initData } = useTelegram();
  const T = getTranslations(language);
  const locale = LOCALE_MAP[language] ?? "en-US";

  const handleRemove = (id: string) => {
    haptic.impact("light");
    if (getApiBase() && initData) {
      removeFromWardrobe(id, initData).then(() => {
        removeFromFavorites(id);
      }).catch(() => {
        removeFromFavorites(id);
      });
    } else {
      removeFromFavorites(id);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">{T.wardrobe.title}</h1>
        <p className="text-muted-foreground">{T.wardrobe.subtitle}</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" strokeWidth={2} />
              {T.wardrobe.savedOutfits}
            </CardTitle>
            <CardDescription>{T.wardrobe.emptyDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <FolderOpen className="h-8 w-8 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {T.wardrobe.noSavedYet}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((outfit) => (
            <Card key={outfit.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{outfit.occasion}</CardTitle>
                    <CardDescription className="text-xs">
                      {T.wardrobe.saved} {new Date(outfit.createdAt).toLocaleDateString(locale)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(outfit.id)}
                    aria-label={T.wardrobe.removeFromFavorites}
                  >
                    <Heart className="h-5 w-5 fill-current" strokeWidth={2} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-muted-foreground">{T.wardrobe.top}: </span>
                  {outfit.outfit.top}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">{T.wardrobe.bottom}: </span>
                  {outfit.outfit.bottom}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">{T.wardrobe.shoes}: </span>
                  {outfit.outfit.shoes}
                </p>
                <p>
                  <span className="font-medium text-muted-foreground">{T.wardrobe.accessories}: </span>
                  {outfit.outfit.accessories}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
