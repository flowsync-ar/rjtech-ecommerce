/** Paletas sugeridas por marca + swatches para la UI de características. */

export type ColorOption = {
  id: string;
  label: string;
  swatch: string;
};

function opt(label: string, swatch: string): ColorOption {
  return { id: label.toLowerCase().replace(/[^a-z0-9]+/g, ""), label, swatch };
}

export const COMMON_COLORS: ColorOption[] = [
  opt("Black", "#1c1c1c"),
  opt("White", "#f4f4f4"),
  opt("Blue", "#2f6fed"),
  opt("Silver", "#c0c4c8"),
  opt("Grey", "#8a8f98"),
  opt("Gold", "#c9a227"),
  opt("Green", "#2f9e64"),
  opt("Pink", "#e89bb5"),
  opt("Purple", "#7c5cff"),
  opt("Red", "#d64545"),
  opt("Orange", "#f0752f"),
  opt("Teal", "#1aa6a6"),
];

const APPLE_COLORS: ColorOption[] = [
  opt("Orange", "#f0752f"),
  opt("Blue", "#2f6fed"),
  opt("Silver", "#c0c4c8"),
  opt("Gold", "#c9a227"),
  opt("Midnight", "#1b2430"),
  opt("Ultramarine", "#3457d5"),
  opt("Teal", "#1aa6a6"),
  opt("White", "#f4f4f4"),
  opt("Black", "#1c1c1c"),
  opt("Pink", "#e89bb5"),
  opt("Natural", "#cbb79a"),
  opt("Desert", "#c4a484"),
  opt("Sage", "#8fa88b"),
];

const SAMSUNG_COLORS: ColorOption[] = [
  opt("Navy", "#1e3a5f"),
  opt("Iceblue", "#a8d4f0"),
  opt("Black", "#1c1c1c"),
  opt("Grey", "#8a8f98"),
  opt("Violet", "#7c5cff"),
  opt("Lima", "#a8d400"),
  opt("Gold", "#c9a227"),
  opt("White", "#f4f4f4"),
  opt("Silver", "#c0c4c8"),
  opt("Pink", "#e89bb5"),
  opt("Graphite", "#4a4e54"),
  opt("Olive", "#6b7c3c"),
  opt("Charcoal", "#36454f"),
];

const MOTOROLA_COLORS: ColorOption[] = [
  opt("Cobalto", "#0047ab"),
  opt("Azul", "#2f6fed"),
  opt("Country Air", "#7eb8c9"),
  opt("Silhouette", "#3d3d3d"),
  opt("Blue", "#2f6fed"),
  opt("Grey", "#8a8f98"),
  opt("Green", "#2f9e64"),
  opt("Grape", "#6b3fa0"),
  opt("Shadow", "#2a2a2a"),
  opt("Celeste", "#7ec8e3"),
  opt("Rosa", "#e89bb5"),
  opt("Gold", "#c9a227"),
];

const XIAOMI_COLORS: ColorOption[] = [
  opt("Gold", "#c9a227"),
  opt("Black", "#1c1c1c"),
  opt("Blue", "#2f6fed"),
  opt("Green", "#2f9e64"),
  opt("Silver", "#c0c4c8"),
  opt("White", "#f4f4f4"),
  opt("Purple", "#7c5cff"),
  opt("Titanium", "#8b8f93"),
  opt("Gray", "#8a8f98"),
];

const JBL_COLORS: ColorOption[] = [
  opt("Black", "#1c1c1c"),
  opt("Blue", "#2f6fed"),
  opt("White", "#f4f4f4"),
  opt("Red", "#d64545"),
  opt("Pink", "#e89bb5"),
  opt("Camuflado", "#556b2f"),
];

function brandKey(brand: string): string {
  return brand
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Paleta sugerida según marca del producto. */
export function colorsForBrand(brand: string): ColorOption[] {
  const b = brandKey(brand);
  if (b.includes("apple")) return APPLE_COLORS;
  if (b.includes("samsung")) return SAMSUNG_COLORS;
  if (b.includes("motorola")) return MOTOROLA_COLORS;
  if (b.includes("xiaomi") || b.includes("redmi") || b.includes("poco")) {
    return XIAOMI_COLORS;
  }
  if (b.includes("jbl")) return JBL_COLORS;
  return COMMON_COLORS;
}

export function swatchForColor(label: string): string {
  const key = brandKey(label).replace(/[^a-z0-9]/g, "");
  const all = [
    ...COMMON_COLORS,
    ...APPLE_COLORS,
    ...SAMSUNG_COLORS,
    ...MOTOROLA_COLORS,
    ...XIAOMI_COLORS,
    ...JBL_COLORS,
  ];
  const found = all.find((c) => c.id === key || brandKey(c.label).replace(/[^a-z0-9]/g, "") === key);
  if (found) return found.swatch;

  // heurística rápida por nombre
  if (key.includes("black") || key.includes("negro") || key.includes("midnight") || key.includes("shadow") || key.includes("charcoal") || key.includes("graphite"))
    return "#1c1c1c";
  if (key.includes("white") || key.includes("blanco") || key.includes("pearl")) return "#f4f4f4";
  if (key.includes("blue") || key.includes("azul") || key.includes("navy") || key.includes("ultramarine") || key.includes("iceblue") || key.includes("celeste") || key.includes("cobalto"))
    return "#2f6fed";
  if (key.includes("silver") || key.includes("plata") || key.includes("titanium") || key.includes("grey") || key.includes("gray") || key.includes("gris"))
    return "#9aa0a6";
  if (key.includes("gold") || key.includes("oro") || key.includes("desert") || key.includes("natural"))
    return "#c9a227";
  if (key.includes("green") || key.includes("verde") || key.includes("olive") || key.includes("lima") || key.includes("sage") || key.includes("teal"))
    return "#2f9e64";
  if (key.includes("pink") || key.includes("rosa") || key.includes("pinkgold")) return "#e89bb5";
  if (key.includes("purple") || key.includes("violet") || key.includes("grape") || key.includes("lila") || key.includes("morado"))
    return "#7c5cff";
  if (key.includes("orange") || key.includes("naranja")) return "#f0752f";
  if (key.includes("red") || key.includes("rojo")) return "#d64545";
  return "#94a3b8";
}

export function normalizeColorLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}
