"use client";

import {
  currencyPrefix,
  formatPrice as formatPriceRaw,
  normalizeCurrency,
  type CurrencyCode,
} from "@/lib/format";
import { useFxStore } from "@/store/fx-store";
import { useStoreConfig } from "@/store/store-config";

/**
 * Convierte un monto de la moneda base de la tienda a la moneda de visualización
 * usando dólar blue venta (DolarAPI).
 * Los precios de venta del catálogo se tratan como USD.
 */
export function convertAmount(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  blueVenta: number | null,
): number {
  if (!Number.isFinite(amount)) return 0;
  if (from === to) return Math.round(amount);
  if (!blueVenta || blueVenta <= 0) return Math.round(amount);
  if (from === "USD" && to === "ARS") return Math.round(amount * blueVenta);
  if (from === "ARS" && to === "USD") return Math.round(amount / blueVenta);
  return Math.round(amount);
}

/** Moneda de visualización del visitante + conversión con blue venta. */
export function useCurrency() {
  const storeCurrency = normalizeCurrency(
    useStoreConfig((s) => s.config.currency),
  );
  const displayCurrency = useFxStore((s) => s.displayCurrency);
  const blueVenta = useFxStore((s) => s.blueVenta);
  const currency = normalizeCurrency(displayCurrency);

  // Precios de catálogo = USD; en $ se multiplica por blue venta
  const toDisplay = (n: number) => {
    if (currency === "USD") return Math.round(n);
    if (currency === "ARS" && blueVenta && blueVenta > 0) {
      return Math.round(n * blueVenta);
    }
    return Math.round(n);
  };

  return {
    /** Moneda en la que se muestran los precios al visitante. */
    currency,
    /** Moneda base de los precios guardados en el catálogo. */
    storeCurrency,
    blueVenta,
    prefix: currencyPrefix(currency),
    toDisplay,
    formatPrice: (n: number) => formatPriceRaw(toDisplay(n), currency),
  };
}

/** Moneda de configuración de la tienda (sin conversión FX). Para admin. */
export function useStoreCurrency() {
  const raw = useStoreConfig((s) => s.config.currency);
  const currency: CurrencyCode = normalizeCurrency(raw);

  return {
    currency,
    prefix: currencyPrefix(currency),
    formatPrice: (n: number) => formatPriceRaw(n, currency),
  };
}
