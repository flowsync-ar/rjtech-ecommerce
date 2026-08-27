"use client";

import { currencyPrefix, formatAmount, type CurrencyCode } from "@/lib/format";

type Props = {
  minBound: number;
  maxBound: number;
  minValue?: number;
  maxValue?: number;
  currency: CurrencyCode;
  onChange: (min: number | undefined, max: number | undefined) => void;
  className?: string;
};

function stepFor(span: number) {
  if (span <= 100) return 1;
  if (span <= 1_000) return 10;
  if (span <= 10_000) return 50;
  if (span <= 100_000) return 500;
  if (span <= 1_000_000) return 5_000;
  return 10_000;
}

export function PriceRangeBar({
  minBound,
  maxBound,
  minValue,
  maxValue,
  currency,
  onChange,
  className = "",
}: Props) {
  if (!Number.isFinite(minBound) || !Number.isFinite(maxBound) || maxBound <= minBound) {
    return null;
  }

  const lo = Math.min(Math.max(minValue ?? minBound, minBound), maxBound);
  const hi = Math.max(Math.min(maxValue ?? maxBound, maxBound), minBound);
  const low = Math.min(lo, hi);
  const high = Math.max(lo, hi);
  const span = maxBound - minBound;
  const step = stepFor(span);
  const leftPct = ((low - minBound) / span) * 100;
  const rightPct = ((high - minBound) / span) * 100;
  const prefix = currencyPrefix(currency);
  const atBounds = low <= minBound && high >= maxBound;

  const commit = (nextLow: number, nextHigh: number) => {
    let a = Math.min(nextLow, nextHigh);
    let b = Math.max(nextLow, nextHigh);
    a = Math.min(Math.max(a, minBound), maxBound);
    b = Math.min(Math.max(b, minBound), maxBound);
    if (a <= minBound && b >= maxBound) {
      onChange(undefined, undefined);
      return;
    }
    onChange(a, b);
  };

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 sm:min-w-[320px] sm:max-w-[420px] sm:flex-none ${className}`.trim()}
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2 text-[11.5px] font-semibold tabular-nums text-muted">
          <span>
            {prefix} {formatAmount(low)}
          </span>
          <span>
            {prefix} {formatAmount(high)}
          </span>
        </div>

        <div className="relative h-6">
          <div className="absolute top-1/2 right-0 left-0 h-1.5 -translate-y-1/2 rounded-full bg-border" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
            style={{
              left: `${leftPct}%`,
              width: `${Math.max(0, rightPct - leftPct)}%`,
            }}
          />

          <input
            type="range"
            aria-label="Precio mínimo"
            min={minBound}
            max={maxBound}
            step={step}
            value={low}
            onChange={(e) => {
              const next = Number(e.target.value);
              commit(Math.min(next, high), high);
            }}
            className="price-range-thumb absolute inset-0 z-[2] w-full cursor-pointer appearance-none bg-transparent"
            style={{ zIndex: low > minBound + span * 0.5 ? 4 : 2 }}
          />
          <input
            type="range"
            aria-label="Precio máximo"
            min={minBound}
            max={maxBound}
            step={step}
            value={high}
            onChange={(e) => {
              const next = Number(e.target.value);
              commit(low, Math.max(next, low));
            }}
            className="price-range-thumb absolute inset-0 z-[3] w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>
      </div>

      {!atBounds && (
        <button
          type="button"
          onClick={() => onChange(undefined, undefined)}
          className="shrink-0 cursor-pointer border-none bg-transparent text-[12px] font-semibold text-primary"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
