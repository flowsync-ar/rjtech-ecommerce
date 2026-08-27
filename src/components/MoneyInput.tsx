"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  currencyPrefix,
  formatAmount,
  type CurrencyCode,
} from "@/lib/format";

const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: "USD", label: "US$" },
  { value: "ARS", label: "$" },
];

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
  currency?: CurrencyCode;
  /** Si true, el símbolo abre un dropdown de moneda. */
  currencyEditable?: boolean;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  showSymbol?: boolean;
  allowEmpty?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
  name?: string;
  id?: string;
};

export function MoneyInput({
  value,
  onChange,
  currency = "USD",
  currencyEditable = false,
  onCurrencyChange,
  showSymbol = true,
  allowEmpty = false,
  placeholder,
  className = "",
  required,
  name,
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const display = value == null ? "" : formatAmount(value);
  const symbol = currencyPrefix(currency);
  const padLeft = showSymbol
    ? currencyEditable
      ? currency === "USD"
        ? "pl-14"
        : "pl-11"
      : currency === "USD"
        ? "pl-[3.25rem]"
        : "pl-8"
    : "";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full">
      {showSymbol &&
        (currencyEditable ? (
          <>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listId}
              aria-label="Moneda"
              onClick={() => setOpen((v) => !v)}
              className="absolute top-1/2 left-2 z-10 flex -translate-y-1/2 cursor-pointer items-center gap-0.5 rounded-md border-none bg-transparent px-1 py-0.5 text-sm font-semibold tabular-nums text-muted hover:text-foreground"
            >
              {symbol}
              <svg
                viewBox="0 0 12 12"
                className={`h-3 w-3 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path d="M3 4.5 6 7.5 9 4.5" />
              </svg>
            </button>
            {open && (
              <ul
                id={listId}
                role="listbox"
                className="absolute top-[calc(100%+4px)] left-0 z-40 m-0 min-w-[5.5rem] list-none overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-[0_12px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
              >
                {CURRENCY_OPTIONS.map((opt) => {
                  const active = opt.value === currency;
                  return (
                    <li key={opt.value} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onClick={() => {
                          onCurrencyChange?.(opt.value);
                          setOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center rounded-md border-none px-3 py-2 text-left text-sm ${
                          active
                            ? "bg-primary-soft font-semibold text-primary-dark"
                            : "bg-transparent font-medium text-foreground hover:bg-accent-soft"
                        }`}
                      >
                        {opt.label}
                        <span className="ml-2 text-xs text-muted">
                          {opt.value}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <span
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold tabular-nums text-muted"
            aria-hidden
          >
            {symbol}
          </span>
        ))}
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        aria-label={
          placeholder
            ? `${placeholder} (${symbol})`
            : `Monto en ${symbol}`
        }
        placeholder={placeholder}
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          if (!digits) {
            onChange(allowEmpty ? null : 0);
            return;
          }
          onChange(Number(digits));
        }}
        className={`${className} ${padLeft}`.trim()}
      />
    </div>
  );
}
