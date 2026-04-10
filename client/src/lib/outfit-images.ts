/**
 * Fallback editorial fashion photos (styled model shots, magazine quality).
 * Used when Unsplash API key is not configured.
 * Primary source: see client/src/lib/unsplash.ts → STYLE_FALLBACKS
 */
export const OUTFIT_IMAGES: Record<string, string> = {
  casual:
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1100&fit=crop&q=90",
  business:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1100&fit=crop&q=90",
  streetwear:
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1100&fit=crop&q=90",
  elegant:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1100&fit=crop&q=90",
  sporty:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=1100&fit=crop&q=90",
  bohemian:
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1100&fit=crop&q=90",
  minimalist:
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1100&fit=crop&q=90",
  vintage:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1100&fit=crop&q=90",
  preppy:
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&h=1100&fit=crop&q=90",
};

/**
 * Multiple editorial photos per capsule category — product-style images.
 */
const CAPSULE_CATEGORY_IMAGES: Record<string, string[]> = {
  Tops: [
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&q=85",
  ],
  Верх: [
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&q=85",
  ],
  Ustki: [
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&q=85",
  ],
  Bottoms: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1551163943-3f7253a5e2bf?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&q=85",
  ],
  Низ: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1551163943-3f7253a5e2bf?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&q=85",
  ],
  Pastki: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1551163943-3f7253a5e2bf?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&q=85",
  ],
  Outerwear: [
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1539533018257-8f48c8b6c6ce?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&h=400&fit=crop&q=85",
  ],
  "Верхняя одежда": [
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1539533018257-8f48c8b6c6ce?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&h=400&fit=crop&q=85",
  ],
  "Ustki kiyim": [
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1539533018257-8f48c8b6c6ce?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&h=400&fit=crop&q=85",
  ],
  Shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&q=85",
  ],
  Обувь: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&q=85",
  ],
  "Oyoq kiyim": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop&q=85",
  ],
  Accessories: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop&q=85",
  ],
  Аксессуары: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop&q=85",
  ],
  Aksessuarlar: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop&q=85",
    "https://images.unsplash.com/photo-1559563458-527698bf5295?w=400&h=400&fit=crop&q=85",
  ],
};

/** Returns array of image URLs for this category; length matches piece.count (slice). */
export function getCapsuleCategoryImages(category: string, count: number): string[] {
  const arr = CAPSULE_CATEGORY_IMAGES[category];
  if (!arr?.length) return [];
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(arr[i % arr.length]);
  return out;
}
