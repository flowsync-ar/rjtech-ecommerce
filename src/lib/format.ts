import type { Product } from "./products";
import { categoryLabels } from "./products";

export type CurrencyCode = "ARS" | "USD";

export function normalizeCurrency(value: string | undefined | null): CurrencyCode {
  // Default de tienda: US$. Solo ARS si está elegido explícitamente.
  return value === "ARS" ? "ARS" : "USD";
}

export function currencyPrefix(currency: CurrencyCode): string {
  return currency === "ARS" ? "$" : "US$";
}

export function currencyLabel(currency: CurrencyCode): string {
  return currency === "ARS" ? "Pesos ($)" : "Dólares (US$)";
}

/** Entero con separador de miles estilo es-AR (1.234.567). */
export function formatAmount(n: number): string {
  const safe = Number.isFinite(n) ? Math.round(Math.abs(n)) : 0;
  return safe.toLocaleString("es-AR");
}

export function formatPrice(n: number, currency: CurrencyCode = "USD"): string {
  return `${currencyPrefix(currency)} ${formatAmount(n)}`;
}

/**
 * Precio de venta desde costo:
 * (precio_costo / 0.87) + 30, redondeado hacia arriba al múltiplo de 5.
 */
export function salePriceFromCost(
  nextCost: number | null,
  previousSale = 0,
): number {
  if (nextCost == null || nextCost <= 0) return previousSale;
  const raw = nextCost / 0.87 + 30;
  return Math.ceil(raw / 5) * 5;
}

/** Extrae solo dígitos del input y devuelve el número entero. */
export function parseMoneyInput(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits);
}

/** Formatea el valor tipado en vivo (solo dígitos → miles). */
export function formatMoneyInputValue(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return formatAmount(Number(digits));
}

export function starsFor(rating: number) {
  const r = Math.round(rating);
  return "★".repeat(r) + "☆".repeat(5 - r);
}

export function discountPct(product: Product) {
  if (!product.oldPrice) return null;
  return Math.round((1 - product.price / product.oldPrice) * 100);
}

export function stockInfo(product: Product) {
  const inStock = product.stock > 0;
  return {
    inStock,
    label: inStock
      ? `En stock (${product.stock} disponibles)`
      : "Agotado",
  };
}

export function productMeta(
  product: Product,
  currency: CurrencyCode = "USD",
  /** Convierte el monto base (USD tienda) a la moneda de visualización. */
  convert: (amount: number) => number = (n) => n,
) {
  const discount = discountPct(product);
  const stock = stockInfo(product);
  return {
    categoryLabel: categoryLabels[product.category],
    stars: starsFor(product.rating),
    fmtPrice: formatPrice(convert(product.price), currency),
    fmtOldPrice: product.oldPrice
      ? formatPrice(convert(product.oldPrice), currency)
      : null,
    discountPct: discount,
    ...stock,
  };
}

export function calcShipping(subtotal: number) {
  if (subtotal === 0 || subtotal > 500000) return 0;
  return 15000;
}
