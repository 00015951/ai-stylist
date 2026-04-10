/**
 * Curated editorial fashion photos by occasion / style.
 * All URLs use Unsplash CDN (no API key needed).
 * Multiple per key so each Look tab gets a unique image (cycled by idx).
 */
export const STYLE_FALLBACKS: Record<string, string[]> = {
  // ── Occasion-specific ──────────────────────────────────────────────
  university: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1100&fit=crop&q=90",
  ],
  party: [
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=800&h=1100&fit=crop&q=90",
  ],
  date: [
    "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&h=1100&fit=crop&q=90",
  ],
  work: [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1100&fit=crop&q=90",
  ],
  wedding: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&h=1100&fit=crop&q=90",
  ],
  travel: [
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1100&fit=crop&q=90",
  ],
  // ── Style-specific ─────────────────────────────────────────────────
  casual: [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1100&fit=crop&q=90",
  ],
  business: [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1100&fit=crop&q=90",
  ],
  streetwear: [
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&h=1100&fit=crop&q=90",
  ],
  elegant: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&h=1100&fit=crop&q=90",
  ],
  sporty: [
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1539794830467-1f1755804d13?w=800&h=1100&fit=crop&q=90",
  ],
  bohemian: [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=800&h=1100&fit=crop&q=90",
  ],
  minimalist: [
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=1100&fit=crop&q=90",
  ],
  vintage: [
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=1100&fit=crop&q=90",
  ],
  preppy: [
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&h=1100&fit=crop&q=90",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1100&fit=crop&q=90",
  ],
};

/** Match occasion string to a fallback key */
function resolveKey(occasion: string, stylePreferences: string[]): string {
  const occ = occasion.toLowerCase();
  if (occ.match(/university|student|campus|school|talaba|akadem|универс/)) return "university";
  if (occ.match(/party|вечеринк|ziyofat|club|concert|tadbir/)) return "party";
  if (occ.match(/date|dinner|ужин|uchrashuv|свидание|romantic|restoran|kechki/)) return "date";
  if (occ.match(/work|office|ish|офис|деловой|meeting|business|interview|intervyu/)) return "work";
  if (occ.match(/wedding|nikoh|свадьб|to'?y|engagement/)) return "wedding";
  if (occ.match(/travel|sayohat|путешест|trip|airport/)) return "travel";
  const pref = (stylePreferences[0] ?? "casual").toLowerCase();
  return STYLE_FALLBACKS[pref] ? pref : "casual";
}

function getFallback(styleKey: string, idx = 0): string {
  const arr = STYLE_FALLBACKS[styleKey] ?? STYLE_FALLBACKS.casual;
  return arr[idx % arr.length];
}

/**
 * Builds an Unsplash search query string from occasion + style + outfit items.
 */
export function buildImageQuery(
  occasion: string,
  stylePreferences: string[],
  outfitItems?: { top?: string; bottom?: string }
): string {
  const style = stylePreferences[0] ?? "casual";
  const occ = occasion.split(/[/,]/)[0].trim();
  const topHint = outfitItems?.top?.split(" ").slice(0, 3).join(" ") ?? "";
  return [topHint, occ, style, "fashion outfit editorial lookbook"].filter(Boolean).join(" ");
}

/**
 * Fetches a fashion photo from Unsplash API (needs UNSPLASH_ACCESS_KEY).
 * Falls back to curated static URL when key is absent or request fails.
 * `idx` ensures each look gets a unique image.
 */
export async function fetchFashionImage(
  query: string,
  styleKey: string,
  idx = 0
): Promise<string> {
  const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  if (!ACCESS_KEY) return getFallback(styleKey, idx);

  try {
    const params = new URLSearchParams({
      query,
      orientation: "portrait",
      content_filter: "high",
      page: String(idx + 1),
      per_page: "1",
    });
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return getFallback(styleKey, idx);
    const data = await res.json();
    const url: string | undefined = data?.results?.[0]?.urls?.regular;
    return url ?? getFallback(styleKey, idx);
  } catch {
    return getFallback(styleKey, idx);
  }
}

/**
 * Get a fallback image matched to the occasion + style.
 */
export function getOccasionImage(occasion: string, stylePreferences: string[], idx = 0): string {
  const key = resolveKey(occasion, stylePreferences);
  return getFallback(key, idx);
}
