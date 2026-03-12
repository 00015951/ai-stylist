import { NextRequest, NextResponse } from "next/server";

/**
 * "What goes with this?" — suggest outfits that pair with an item from a photo.
 * Accepts image URL or base64; returns 2–3 outfit suggestions (mock for now).
 * In production, use a vision API to detect garment type/color and tailor suggestions.
 */

interface RequestBody {
  /** Optional: URL of the uploaded/displayed image */
  imageUrl?: string;
  /** Optional: base64 data URL (e.g. from file input) */
  imageBase64?: string;
  /** Optional: user description of the item */
  description?: string;
  language?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { description, language } = body;

    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800));

    // Mock suggestions: generic "what goes with a statement piece" advice
    const suggestions = [
      {
        outfit: {
          top: description?.toLowerCase().includes("bottom")
            ? "Neutral blouse or fine knit (cream, white, or black)"
            : "Keep your piece as the focus — add a simple layer if needed",
          bottom: description?.toLowerCase().includes("top")
            ? "High-waisted trousers or dark jeans"
            : "Neutral trousers or midi skirt (navy, black, beige)",
          shoes: "White sneakers, loafers, or ankle boots",
          accessories: "Minimal jewelry, structured bag",
        },
        whyItWorks:
          "Neutrals let your piece stand out. One statement item plus simple basics always works.",
      },
      {
        outfit: {
          top: "Plain tee or blouse in a complementary tone",
          bottom: "Tailored trousers or smart jeans",
          shoes: "Clean sneakers or block heels",
          accessories: "Belt, watch, tote or crossbody",
        },
        whyItWorks:
          "Balance the look with one other subtle color (e.g. denim or camel) so the outfit feels intentional.",
      },
      {
        outfit: {
          top: "Layer with a blazer or cardigan in a neutral",
          bottom: "Straight-leg jeans or chinos",
          shoes: "Loafers or ankle boots",
          accessories: "Scarf or simple necklace",
        },
        whyItWorks:
          "Layering adds depth and makes the piece work for different occasions.",
      },
    ];

    const colorAdvice =
      language === "ru"
        ? "Сочетайте с нейтральными цветами (белый, бежевый, чёрный, деним). Один яркий предмет — остальное спокойное."
        : language === "uz"
          ? "Neytral ranglar (oq, bej, qora, denim) bilan uygʻunlashtiring. Bitta diqqatga sazovor buyum — qolgani sokin."
          : "Pair with neutrals (white, beige, black, denim). One statement piece — keep the rest understated.";

    return NextResponse.json({
      suggestions,
      colorAdvice,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to get match suggestions" },
      { status: 500 }
    );
  }
}
