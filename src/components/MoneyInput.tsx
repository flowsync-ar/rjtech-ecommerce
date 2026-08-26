"use client";

import {
  currencyPrefix,
  formatAmount,
  type CurrencyCode,
} from "@/lib/format";

type Props = {
  value: number | null;
  onChange: (value: number | null) => void;
  currency?: CurrencyCode;
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
  currency = "ARS",
  showSymbol = true,
  allowEmpty = false,
  placeholder,
  className = "",
  required,
  name,
  id,
}: Props) {
  const display = value == null ? "" : formatAmount(value);
  const symbol = currencyPrefix(currency);
  const padLeft = showSymbol
    ? currency === "USD"
      ? "pl-12"
      : "pl-8"
    : "";

  return (
    <div className="relative w-full">
      {showSymbol && (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted">
          {symbol}
        </span>
      )}
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
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
