"use client";

import { useEffect } from "react";
import { formatAmount, type CurrencyCode } from "@/lib/format";
import { useFxStore } from "@/store/fx-store";

export function CurrencyToggle() {
  const displayCurrency = useFxStore((s) => s.displayCurrency);
  const setDisplayCurrency = useFxStore((s) => s.setDisplayCurrency);
  const blueVenta = useFxStore((s) => s.blueVenta);
  const loading = useFxStore((s) => s.loading);
  const fetchBlueRate = useFxStore((s) => s.fetchBlueRate);

  useEffect(() => {
    void fetchBlueRate();
    const id = window.setInterval(() => void fetchBlueRate(), 5 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [fetchBlueRate]);

  const setCurrency = (next: CurrencyCode) => {
    setDisplayCurrency(next);
    if (next === "ARS" && !blueVenta) void fetchBlueRate();
  };

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div
        role="group"
        aria-label="Moneda de visualización"
        className="flex items-center rounded-lg border border-border bg-accent-soft p-0.5"
      >
        <button
          type="button"
          onClick={() => setCurrency("USD")}
          className={`cursor-pointer rounded-md border-none px-2.5 py-1.5 text-[12.5px] font-bold transition-colors ${
            displayCurrency === "USD"
              ? "bg-surface text-primary shadow-sm"
              : "bg-transparent text-muted hover:text-foreground"
          }`}
        >
          US$
        </button>
        <button
          type="button"
          onClick={() => setCurrency("ARS")}
          className={`cursor-pointer rounded-md border-none px-2.5 py-1.5 text-[12.5px] font-bold transition-colors ${
            displayCurrency === "ARS"
              ? "bg-surface text-primary shadow-sm"
              : "bg-transparent text-muted hover:text-foreground"
          }`}
        >
          $
        </button>
      </div>
      <div className="text-[10px] leading-none text-muted-soft">
        {loading && !blueVenta
          ? "Cotizando…"
          : blueVenta
            ? `Blue venta $${formatAmount(blueVenta)}`
            : "Sin cotización"}
      </div>
    </div>
  );
}
