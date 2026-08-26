import type { Product } from "./products";
import { categoryLabels } from "./products";

export type CurrencyCode = "ARS" | "USD";

export function normalizeCurrency(value: string | undefined | null): CurrencyCode {
  return value === "USD" ? "USD" : "ARS";
}

export function currencyPrefix(currency: CurrencyCode): string {
  return currency === "USD" ? "US$" : "$";
}

export function currencyLabel(currency: CurrencyCode): string {
  return currency === "USD" ? "Dólares (US$)" : "Pesos ($)";
}

/** Entero con separador de miles estilo es-AR (1.234.567). */
export function formatAmount(n: number): string {
  const safe = Number.isFinite(n) ? Math.round(Math.abs(n)) : 0;
  return safe.toLocaleString("es-AR");
}

export function formatPrice(n: number, currency: CurrencyCode = "ARS"): string {
  return `${currencyPrefix(currency)}${formatAmount(n)}`;
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

export function productMeta(product: Product, currency: CurrencyCode = "ARS") {
  const discount = discountPct(product);
  const stock = stockInfo(product);
  return {
    categoryLabel: categoryLabels[product.category],
    stars: starsFor(product.rating),
    fmtPrice: formatPrice(product.price, currency),
    fmtOldPrice: product.oldPrice
      ? formatPrice(product.oldPrice, currency)
      : null,
    discountPct: discount,
    ...stock,
  };
}

export function calcShipping(subtotal: number) {
  if (subtotal === 0 || subtotal > 500000) return 0;
  return 15000;
}
