import { NextRequest, NextResponse } from "next/server";
import type { StylePreference } from "@/store/use-app-store";

/**
 * Capsule wardrobe: minimal set of pieces that mix-and-match
 * User picks a style, we return a curated list with counts and descriptions
 */

interface RequestBody {
  style: StylePreference;
  language?: string;
  /** User's own style description when presets don't fit */
  customStyle?: string;
}

export interface CapsulePiece {
  category: string;
  count: number;
  items: string[];
  tip?: string;
}

export interface CapsuleWardrobeResult {
  style: string;
  intro: string;
  pieces: CapsulePiece[];
  colorPalette: string[];
  shoppingStores: string[];
}

const CAPSULES: Record<StylePreference, Omit<CapsuleWardrobeResult, "style">> = {
  casual: {
    intro:
      "A versatile casual capsule built around neutrals and one or two accent colors. Everything mixes and matches for multiple outfits from a small closet.",
    pieces: [
      {
        category: "Tops",
        count: 5,
        items: [
          "White cotton t-shirt",
          "Striped long-sleeve tee",
          "Neutral blouse or linen shirt",
          "Simple sweater or cardigan",
          "One statement top (color or print)",
        ],
        tip: "Stick to 2–3 base colors so layers always work together.",
      },
      {
        category: "Bottoms",
        count: 3,
        items: [
          "Dark wash jeans",
          "Chinos or tailored trousers in beige/navy",
          "One skirt or shorts for variety",
        ],
      },
      {
        category: "Outerwear",
        count: 1,
        items: ["Denim or utility jacket"],
      },
      {
        category: "Shoes",
        count: 2,
        items: ["White sneakers", "Loafers or ankle boots"],
      },
      {
        category: "Accessories",
        count: 3,
        items: ["Belt", "Tote or crossbody bag", "Minimal jewelry or watch"],
      },
    ],
    colorPalette: ["White", "Navy", "Beige", "Denim blue", "One accent (e.g. rust or sage)"],
    shoppingStores: ["Uniqlo", "Zara", "COS", "H&M", "Everlane"],
  },
  business: {
    intro:
      "A professional capsule that covers meetings, office days, and smart-casual. Focus on fit and fabric quality; fewer pieces in neutral tones.",
    pieces: [
      {
        category: "Tops",
        count: 4,
        items: [
          "White dress shirt or blouse",
          "Light blue shirt",
          "Silk or satin blouse (neutral)",
          "Fine knit or turtleneck",
        ],
        tip: "Invest in one or two premium pieces; the rest can be high-street.",
      },
      {
        category: "Bottoms",
        count: 3,
        items: [
          "Tailored trousers (navy or black)",
          "Second trousers (grey or beige)",
          "Pencil skirt or tailored dress",
        ],
      },
      {
        category: "Outerwear",
        count: 1,
        items: ["Structured blazer (navy or black)"],
      },
      {
        category: "Shoes",
        count: 2,
        items: ["Leather loafers or oxfords", "Block heels (if needed)"],
      },
      {
        category: "Accessories",
        count: 3,
        items: ["Leather belt", "Structured tote or briefcase", "Minimal watch"],
      },
    ],
    colorPalette: ["White", "Navy", "Black", "Light blue", "Grey or beige"],
    shoppingStores: ["Zara", "Massimo Dutti", "M&S", "Reiss", "COS"],
  },
  streetwear: {
    intro:
      "Street-ready capsule with oversized fits, utility pieces, and bold accents. Comfort and attitude over formality.",
    pieces: [
      {
        category: "Tops",
        count: 5,
        items: [
          "Oversized graphic tee",
          "Plain hoodie",
          "Long-sleeve tee or thermal",
          "Bomber or utility jacket",
          "One statement piece (vest, jersey)",
        ],
        tip: "Layer tees under hoodies and jackets for different looks.",
      },
      {
        category: "Bottoms",
        count: 3,
        items: ["Cargo pants", "Joggers or wide-leg trousers", "Dark jeans"],
      },
      {
        category: "Shoes",
        count: 2,
        items: ["Chunky sneakers", "High-tops or second sneaker colorway"],
      },
      {
        category: "Accessories",
        count: 3,
        items: ["Cap or beanie", "Backpack", "Chain or minimal jewelry"],
      },
    ],
    colorPalette: ["Black", "White", "Grey", "One bold (orange, green, or print)"],
    shoppingStores: ["Nike", "ASOS", "Zalando", "End Clothing", "Palace"],
  },
  elegant: {
    intro:
      "An elegant capsule for dinners, events, and polished everyday. Quality fabrics and clean lines; fewer pieces in a cohesive palette.",
    pieces: [
      {
        category: "Tops",
        count: 4,
        items: [
          "Silk blouse (neutral)",
          "Cashmere or fine knit sweater",
          "Structured blouse",
          "One evening-appropriate top",
        ],
        tip: "Silk and cashmere elevate simple silhouettes.",
      },
      {
        category: "Bottoms",
        count: 3,
        items: [
          "Tailored trousers (high waist)",
          "Midi skirt",
          "Wide-leg trousers or dress",
        ],
      },
      {
        category: "Outerwear",
        count: 1,
        items: ["Trench or wool coat"],
      },
      {
        category: "Shoes",
        count: 2,
        items: ["Ankle boots or block heels", "Elegant flats or loafers"],
      },
      {
        category: "Accessories",
        count: 3,
        items: ["Structured bag", "Delicate jewelry", "Scarf or shawl"],
      },
    ],
    colorPalette: ["Cream", "Black", "Camel", "Blush", "Navy"],
    shoppingStores: ["COS", "& Other Stories", "Mango", "Reiss", "Massimo Dutti"],
  },
  sporty: {
    intro:
      "Active and athleisure capsule: performance pieces that work for training and casual wear. Easy to layer and wash.",
    pieces: [
      {
        category: "Tops",
        count: 5,
        items: [
          "Moisture-wicking tee",
          "Sports bra or base layer",
          "Long-sleeve training top",
          "Zip-up or hoodie",
          "One casual athletic tee",
        ],
        tip: "Neutral base + one or two bright pieces for visibility and style.",
      },
      {
        category: "Bottoms",
        count: 3,
        items: ["Leggings or training tights", "Joggers", "Shorts"],
      },
      {
        category: "Outerwear",
        count: 1,
        items: ["Light jacket or windbreaker"],
      },
      {
        category: "Shoes",
        count: 2,
        items: ["Running or training shoes", "Everyday sneakers"],
      },
      {
        category: "Accessories",
        count: 2,
        items: ["Sports bag", "Fitness tracker or watch"],
      },
    ],
    colorPalette: ["Black", "Grey", "White", "One bright (coral, teal, or neon)"],
    shoppingStores: ["Nike", "Adidas", "Lululemon", "Decathlon", "H&M Sport"],
  },
  bohemian: {
    intro:
      "Boho capsule with relaxed fits, natural fabrics, and earthy tones. Mix textures and subtle patterns for a laid-back but put-together look.",
    pieces: [
      {
        category: "Tops",
        count: 5,
        items: [
          "Linen or cotton blouse",
          "Crochet or knit top",
          "Flowy cami or tank",
          "Oversized shirt",
          "One printed or embroidered top",
        ],
        tip: "Layer necklaces and bracelets; keep shoes simple.",
      },
      {
        category: "Bottoms",
        count: 3,
        items: [
          "Wide-leg trousers or palazzo pants",
          "Midi skirt (flowy)",
          "High-waisted jeans or denim skirt",
        ],
      },
      {
        category: "Outerwear",
        count: 1,
        items: ["Kimono, cardigan, or denim jacket"],
      },
      {
        category: "Shoes",
        count: 2,
        items: ["Sandals or espadrilles", "Ankle boots"],
      },
      {
        category: "Accessories",
        count: 4,
        items: ["Wide-brim hat", "Straw bag or tote", "Layered jewelry", "Scarf or bandana"],
      },
    ],
    colorPalette: ["Terracotta", "Olive", "Cream", "Mustard", "Rust", "White"],
    shoppingStores: ["Free People", "Zara", "H&M", "Mango", "ASOS"],
  },
};

// Russian translations for capsule content
const CAPSULES_RU: Record<StylePreference, Omit<CapsuleWardrobeResult, "style">> = {
  casual: {
    intro:
      "Универсальная капсула в нейтралах и одном-двух акцентных цветах. Всё легко комбинируется и даёт много образов из небольшого гардероба.",
    pieces: [
      {
        category: "Верх",
        count: 5,
        items: [
          "Белая хлопковая футболка",
          "Полосатая футболка с длинным рукавом",
          "Нейтральная блуза или льняная рубашка",
          "Простой свитер или кардиган",
          "Один яркий верх (цвет или принт)",
        ],
        tip: "Придерживайтесь 2–3 базовых цветов, чтобы слои сочетались.",
      },
      {
        category: "Низ",
        count: 3,
        items: [
          "Джинсы тёмной стирки",
          "Чинос или брюки беж/тёмно-синий",
          "Одна юбка или шорты для разнообразия",
        ],
      },
      {
        category: "Верхняя одежда",
        count: 1,
        items: ["Джинсовая или утильная куртка"],
      },
      {
        category: "Обувь",
        count: 2,
        items: ["Белые кроссовки", "Лоферы или ботинки до щиколотки"],
      },
      {
        category: "Аксессуары",
        count: 3,
        items: ["Ремень", "Сумка-тоут или кросс-боди", "Минимальные украшения или часы"],
      },
    ],
    colorPalette: ["Белый", "Тёмно-синий", "Беж", "Деним", "Один акцент (например, ржавчина или шалфей)"],
    shoppingStores: ["Uniqlo", "Zara", "COS", "H&M", "Everlane"],
  },
  business: {
    intro:
      "Деловая капсула для встреч, офиса и смарт-кэжуал. Важны крой и качество тканей; меньше вещей в нейтральной гамме.",
    pieces: [
      { category: "Верх", count: 4, items: ["Белая рубашка или блуза", "Голубая рубашка", "Шёлковая или атласная блуза (нейтральная)", "Тонкий трикотаж или водолазка"], tip: "Одна-две премиум вещи; остальное — масс-маркет." },
      { category: "Низ", count: 3, items: ["Брюки (тёмно-синие или чёрные)", "Вторые брюки (серые или бежевые)", "Юбка-карандаш или платье"] },
      { category: "Верхняя одежда", count: 1, items: ["Строгий пиджак (тёмно-синий или чёрный)"] },
      { category: "Обувь", count: 2, items: ["Кожаные лоферы или оксфорды", "Блок-каблуки при необходимости"] },
      { category: "Аксессуары", count: 3, items: ["Кожаный ремень", "Строгая сумка или портфель", "Минималистичные часы"] },
    ],
    colorPalette: ["Белый", "Тёмно-синий", "Чёрный", "Голубой", "Серый или беж"],
    shoppingStores: ["Zara", "Massimo Dutti", "M&S", "Reiss", "COS"],
  },
  streetwear: {
    intro: "Стритвир-капсула: оверсайз, утиль и смелые акценты. Комфорт и характер важнее формальности.",
    pieces: [
      { category: "Верх", count: 5, items: ["Оверсайз футболка с принтом", "Простой худи", "Футболка с длинным рукавом или термобельё", "Бомбер или утильная куртка", "Один яркий элемент (жилет, джерси)"], tip: "Слоите футболки под худи и куртки для разных образов." },
      { category: "Низ", count: 3, items: ["Карго", "Джоггеры или широкие брюки", "Тёмные джинсы"] },
      { category: "Обувь", count: 2, items: ["Массивные кроссовки", "Хай-топы или вторая пара кроссовок"] },
      { category: "Аксессуары", count: 3, items: ["Кепка или бини", "Рюкзак", "Цепочка или минимальные украшения"] },
    ],
    colorPalette: ["Чёрный", "Белый", "Серый", "Один яркий (оранж, зелёный или принт)"],
    shoppingStores: ["Nike", "ASOS", "Zalando", "End Clothing", "Palace"],
  },
  elegant: {
    intro: "Элегантная капсула для ужинов, мероприятий и повседневного выхода. Качественные ткани и чёткие линии; меньше вещей в одной гамме.",
    pieces: [
      { category: "Верх", count: 4, items: ["Шёлковая блуза (нейтральная)", "Кашемир или тонкий свитер", "Строгая блуза", "Один вечерний верх"], tip: "Шёлк и кашемир поднимают простые силуэты." },
      { category: "Низ", count: 3, items: ["Брюки с высокой талией", "Юбка миди", "Широкие брюки или платье"] },
      { category: "Верхняя одежда", count: 1, items: ["Тренч или шерстяное пальто"] },
      { category: "Обувь", count: 2, items: ["Ботинки до щиколотки или блок-каблуки", "Элегантные балетки или лоферы"] },
      { category: "Аксессуары", count: 3, items: ["Строгая сумка", "Деликатные украшения", "Шарф или палантин"] },
    ],
    colorPalette: ["Крем", "Чёрный", "Верблюжий", "Румянец", "Тёмно-синий"],
    shoppingStores: ["COS", "& Other Stories", "Mango", "Reiss", "Massimo Dutti"],
  },
  sporty: {
    intro: "Спортивная и athleisure капсула: вещи для тренировок и повседневной носки. Удобно слоить и стирать.",
    pieces: [
      { category: "Верх", count: 5, items: ["Влагоотводящая футболка", "Спортивный топ или базовый слой", "Топ с длинным рукавом для тренировок", "Куртка на молнии или худи", "Одна повседневная спортивная футболка"], tip: "Нейтральная база + один-два ярких элемента." },
      { category: "Низ", count: 3, items: ["Леггинсы или тайтсы", "Джоггеры", "Шорты"] },
      { category: "Верхняя одежда", count: 1, items: ["Лёгкая куртка или ветровка"] },
      { category: "Обувь", count: 2, items: ["Беговые или тренировочные кроссовки", "Повседневные кроссовки"] },
      { category: "Аксессуары", count: 2, items: ["Спортивная сумка", "Фитнес-браслет или часы"] },
    ],
    colorPalette: ["Чёрный", "Серый", "Белый", "Один яркий (коралл, бирюза или неон)"],
    shoppingStores: ["Nike", "Adidas", "Lululemon", "Decathlon", "H&M Sport"],
  },
  bohemian: {
    intro: "Бохо-капсула с расслабленным кроем, натуральными тканями и природными тонами. Смешивайте текстуры и ненавязчивые принты.",
    pieces: [
      { category: "Верх", count: 5, items: ["Льняная или хлопковая блуза", "Топ с вязкой или крючком", "Лёгкий топ или майка", "Оверсайз рубашка", "Один принтовый или вышитый верх"], tip: "Слоите ожерелья и браслеты; обувь оставляйте простой." },
      { category: "Низ", count: 3, items: ["Широкие брюки или палаццо", "Юбка миди (летящая)", "Джинсы с высокой талией или джинсовая юбка"] },
      { category: "Верхняя одежда", count: 1, items: ["Кимоно, кардиган или джинсовка"] },
      { category: "Обувь", count: 2, items: ["Сандалии или эспадрильи", "Ботинки до щиколотки"] },
      { category: "Аксессуары", count: 4, items: ["Шляпа с широкими полями", "Соломенная сумка или тоут", "Многослойные украшения", "Шарф или бандана"] },
    ],
    colorPalette: ["Терракот", "Олива", "Крем", "Горчичный", "Ржавчина", "Белый"],
    shoppingStores: ["Free People", "Zara", "H&M", "Mango", "ASOS"],
  },
};

function getCapsuleForLanguage(style: StylePreference, language?: string): Omit<CapsuleWardrobeResult, "style"> {
  if (language === "ru") return CAPSULES_RU[style];
  return CAPSULES[style];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { style, language, customStyle } = body;

    if (!style || !CAPSULES[style as StylePreference]) {
      return NextResponse.json(
        { error: "Valid style is required (casual, business, streetwear, elegant, sporty, bohemian)" },
        { status: 400 }
      );
    }

    await new Promise((r) => setTimeout(r, 600));

    const data = getCapsuleForLanguage(style as StylePreference, language);
    const result: CapsuleWardrobeResult = {
      style: customStyle?.trim() ? `Custom: ${customStyle.trim()}` : style,
      ...data,
    };
    if (customStyle?.trim()) {
      result.intro = `Your style: "${customStyle.trim()}". ${data.intro}`;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate capsule wardrobe" },
      { status: 500 }
    );
  }
}
