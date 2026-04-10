"use client";

import { useEffect, useState } from "react";
import { getStyles, type StyleFromApi } from "@/lib/api";
import type { AppLanguage } from "@/lib/i18n";

export function useStyles() {
  const [styles, setStyles] = useState<StyleFromApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStyles()
      .then((data) => setStyles(data?.styles ?? []))
      .catch(() => setStyles([]))
      .finally(() => setLoading(false));
  }, []);

  return { styles, loading };
}

/** Get display name for a style key in the given language */
export function getStyleName(
  styles: StyleFromApi[],
  key: string,
  language: AppLanguage
): string {
  const lang = language === "uz" ? "uz" : language === "ru" ? "ru" : "en";
  const s = styles.find((x) => x.key === key);
  const name = s?.name?.[lang];
  return (name?.trim() && name) || key;
}
