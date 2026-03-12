/**
 * Photos for each of the 6 style categories (user-selected URLs)
 */
export const OUTFIT_IMAGES: Record<string, string> = {
  casual:
    "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&w=600",
  business:
    "https://raslov.ua/wp-content/uploads/2022/02/aksessuary-pod-delovoj-stil-zhenshhiny-min.jpg",
  streetwear:
    "https://techwear-outfits.com/cdn/shop/files/womens-streetwear-pants-techwear-458.webp?v=1701538615&width=720",
  elegant:
    "https://www.myfashionlife.com/wp-content/uploads/2023/03/elegantandclassy_5-1-819x1024.jpg",
  sporty: "https://images.pexels.com/photos/7235677/pexels-photo-7235677.jpeg?auto=compress&w=600",
  bohemian: "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&w=600",
};

/**
 * Multiple photos per category for capsule result — so "Верх (4)" shows 4 images.
 * Keys: Tops/Верх, Bottoms/Низ, Outerwear/Верхняя одежда, Shoes/Обувь, Accessories/Аксессуары
 */
const CAPSULE_CATEGORY_IMAGES: Record<string, string[]> = {
  Tops: [
    "https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1485968/pexels-photo-1485968.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&w=400",
  ],
  Верх: [
    "https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1485968/pexels-photo-1485968.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&w=400",
  ],
  Bottoms: [
    "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&w=400",
  ],
  Низ: [
    "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&w=400",
  ],
  Outerwear: [
    "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&w=400",
  ],
  "Верхняя одежда": [
    "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&w=400",
  ],
  Shoes: [
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1153838/pexels-photo-1153838.jpeg?auto=compress&w=400",
  ],
  Обувь: [
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1153838/pexels-photo-1153838.jpeg?auto=compress&w=400",
  ],
  Accessories: [
    "https://images.pexels.com/photos/1153838/pexels-photo-1153838.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&w=400",
  ],
  Аксессуары: [
    "https://images.pexels.com/photos/1153838/pexels-photo-1153838.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/9963294/pexels-photo-9963294.jpeg?auto=compress&w=400",
    "https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg?auto=compress&w=400",
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
