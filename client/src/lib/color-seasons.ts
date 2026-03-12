/**
 * Personal color analysis — seasonal palette (12 or 4 seasons)
 * Winter, Summer, Spring, Autumn types based on skin, hair, eyes
 */

export type SeasonType = "winter" | "summer" | "spring" | "autumn";

export const SEASON_PALETTES: Record<
  SeasonType,
  { hex: string[]; name: Record<string, string> }
> = {
  winter: {
    hex: ["#1a1a2e", "#16213e", "#0f3460", "#e94560", "#ffffff", "#a0a0a0"],
    name: { en: "Winter", ru: "Зима", uz: "Qishki" },
  },
  summer: {
    hex: ["#6b7b8c", "#8b9dc3", "#c4b5c7", "#e8d5d5", "#f5e6e8", "#a8b5c4"],
    name: { en: "Summer", ru: "Лето", uz: "Yozgi" },
  },
  spring: {
    hex: ["#f4d35e", "#ee964b", "#f95738", "#fef9c3", "#fde68a", "#fcd34d"],
    name: { en: "Spring", ru: "Весна", uz: "Bahorgi" },
  },
  autumn: {
    hex: ["#783d19", "#a0522d", "#cd853f", "#daa520", "#8b4513", "#d2691e"],
    name: { en: "Autumn", ru: "Осень", uz: "Kuzgi" },
  },
};
