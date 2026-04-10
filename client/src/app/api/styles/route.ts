import { NextResponse } from "next/server";

/** Static fallback when no backend — matches i18n keys */
const STATIC_STYLES = [
  { id: 1, key: "casual", name: { en: "Casual", ru: "Кэжуал", uz: "Kezhual" }, imageUrl: null, description: null },
  { id: 2, key: "business", name: { en: "Business", ru: "Бизнес", uz: "Biznes" }, imageUrl: null, description: null },
  { id: 3, key: "streetwear", name: { en: "Streetwear", ru: "Стритвир", uz: "Koʻcha uslubi" }, imageUrl: null, description: null },
  { id: 4, key: "elegant", name: { en: "Elegant", ru: "Элегантный", uz: "Zebozor" }, imageUrl: null, description: null },
  { id: 5, key: "sporty", name: { en: "Sporty", ru: "Спортивный", uz: "Sport" }, imageUrl: null, description: null },
  { id: 6, key: "bohemian", name: { en: "Bohemian", ru: "Бохо", uz: "Boho" }, imageUrl: null, description: null },
];

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/styles`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (_) {
      // fall through to static
    }
  }
  return NextResponse.json({ styles: STATIC_STYLES });
}
