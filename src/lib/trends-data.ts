/**
 * Trends data — weekly/seasonal fashion suggestions
 * In production, fetch from CMS or API
 */

export type TrendItem = {
  id: string;
  title: Record<"en" | "ru" | "uz", string>;
  subtitle?: Record<"en" | "ru" | "uz", string>;
  imageUrl?: string;
  gradient: string;
};

export const TRENDS: TrendItem[] = [
  {
    id: "spring-2026",
    title: { en: "Spring 2026 Trends", ru: "Весна 2026: тренды", uz: "2026 bahor trendlari" },
    subtitle: { en: "Soft silhouettes, pastels", ru: "Мягкие силуэты, пастель", uz: "Yumshoq siluetlar, pastel" },
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80",
    gradient: "from-pink-400 via-rose-300 to-amber-200",
  },
  {
    id: "tiktok-viral",
    title: { en: "TikTok Viral This Week", ru: "Viral на TikTok", uz: "Bu hafta TikTok viral" },
    subtitle: { en: "Oversized blazers, wide pants", ru: "Оверсайз, широкие штаны", uz: "Oversized blezer, keng shim" },
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    gradient: "from-violet-500 via-fuchsia-400 to-pink-500",
  },
  {
    id: "capsule-minimal",
    title: { en: "Capsule Wardrobe", ru: "Капсульный гардероб", uz: "Kapsula garderob" },
    subtitle: { en: "10 pieces, 30 looks", ru: "10 вещей — 30 образов", uz: "10 buyum — 30 look" },
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    gradient: "from-stone-600 via-stone-400 to-neutral-300",
  },
  {
    id: "evening-out",
    title: { en: "Evening Looks", ru: "Вечерние образы", uz: "Kechalik looklar" },
    subtitle: { en: "Silk, satin, metallics", ru: "Шёлк, атлас, металлик", uz: "Ipak, satin, metallik" },
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80",
    gradient: "from-indigo-700 via-purple-600 to-violet-500",
  },
  {
    id: "cozy-layers",
    title: { en: "Cozy Layers", ru: "Уютные слои", uz: "Qulay qatlamlar" },
    subtitle: { en: "Knit, cashmere, scarves", ru: "Трикотаж, кашемир", uz: "Triko, kashmir" },
    imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80",
    gradient: "from-amber-600 via-orange-400 to-rose-300",
  },
  {
    id: "streetwear-essentials",
    title: { en: "Streetwear Essentials", ru: "Стритвир must-have", uz: "Streetwear essentials" },
    subtitle: { en: "Sneakers, hoodies, caps", ru: "Кроссовки, худи, кепки", uz: "Krossovkalar, xudi, kepka" },
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
    gradient: "from-slate-700 via-slate-500 to-slate-300",
  },
  {
    id: "minimal-accessories",
    title: { en: "Minimal Accessories", ru: "Минималистичные аксессуары", uz: "Minimal aksessuarlar" },
    subtitle: { en: "Clean jewelry, watches", ru: "Лаконичные украшения, часы", uz: "Zargarlik, soatlar" },
    imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343c?w=400&q=80",
    gradient: "from-zinc-600 via-neutral-400 to-stone-200",
  },
  {
    id: "summer-prints",
    title: { en: "Summer Prints", ru: "Летние принты", uz: "Yozgi printlar" },
    subtitle: { en: "Floral, tropical, linen", ru: "Цветочные, тропические", uz: "Gul, tropik, zigir" },
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
    gradient: "from-teal-500 via-cyan-400 to-sky-200",
  },
  {
    id: "office-chic",
    title: { en: "Office Chic", ru: "Офисный шик", uz: "Ofis chiqi" },
    subtitle: { en: "Tailored blazers, sleek pants", ru: "Пиджаки, элегантные брюки", uz: "Bleyzer, shim" },
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    gradient: "from-slate-800 via-blue-gray-600 to-slate-400",
  },
];
