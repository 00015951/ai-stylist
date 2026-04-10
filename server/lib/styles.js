/**
 * Bitta format — admin va client bir xil ma'lumot oladi
 */
export function formatStyleRow(r) {
  return {
    id: r.id,
    key: r.key,
    name: { en: r.name_en, ru: r.name_ru, uz: r.name_uz },
    imageUrl: r.image_url,
    description: r.description,
  };
}

export function formatStyles(rows) {
  return { styles: rows.map(formatStyleRow) };
}
