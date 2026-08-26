"use client";

import {
  currencyPrefix,
  formatPrice,
  normalizeCurrency,
  type CurrencyCode,
} from "@/lib/format";
import { useStoreConfig } from "@/store/store-config";

export function useCurrency() {
  const raw = useStoreConfig((s) => s.config.currency);
  const currency: CurrencyCode = normalizeCurrency(raw);

  return {
    currency,
    prefix: currencyPrefix(currency),
    formatPrice: (n: number) => formatPrice(n, currency),
  };
}
