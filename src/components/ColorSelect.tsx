"use client";

import { useMemo, useState } from "react";
import {
  colorsForBrand,
  normalizeColorLabel,
  swatchForColor,
  type ColorOption,
} from "@/lib/product-colors";

type Props = {
  value: string[];
  onChange: (colors: string[]) => void;
  brand?: string;
  className?: string;
};

function sameColor(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function ColorSelect({
  value,
  onChange,
  brand = "",
  className = "",
}: Props) {
  const [draft, setDraft] = useState("");
  const presets = useMemo(() => colorsForBrand(brand), [brand]);

  const selectedSet = useMemo(
    () => new Set(value.map((v) => v.trim().toLowerCase())),
    [value],
  );

  const toggle = (label: string) => {
    const exists = value.some((v) => sameColor(v, label));
    if (exists) onChange(value.filter((v) => !sameColor(v, label)));
    else onChange([...value, label]);
  };

  const addCustom = () => {
    const label = normalizeColorLabel(draft);
    if (!label) return;
    if (value.some((v) => sameColor(v, label))) {
      setDraft("");
      return;
    }
    onChange([...value, label]);
    setDraft("");
  };

  const extras = value.filter(
    (v) => !presets.some((p) => sameColor(p.label, v)),
  );

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      <div className="flex flex-wrap gap-2">
        {presets.map((color) => (
          <ColorChip
            key={color.id}
            color={color}
            selected={selectedSet.has(color.label.toLowerCase())}
            onToggle={() => toggle(color.label)}
          />
        ))}
        {extras.map((label) => (
          <ColorChip
            key={`extra-${label}`}
            color={{
              id: label,
              label,
              swatch: swatchForColor(label),
            }}
            selected
            onToggle={() => toggle(label)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Agregar color personalizado + Enter"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!draft.trim()}
          className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Agregar
        </button>
      </div>

      {value.length > 0 && (
        <p className="text-[12px] text-muted">
          Seleccionados:{" "}
          <span className="font-semibold text-foreground">
            {value.join(" · ")}
          </span>
        </p>
      )}
    </div>
  );
}

function ColorChip({
  color,
  selected,
  onToggle,
}: {
  color: ColorOption;
  selected: boolean;
  onToggle: () => void;
}) {
  const light =
    color.swatch.toLowerCase() === "#f4f4f4" ||
    color.swatch.toLowerCase() === "#ffffff" ||
    color.swatch.toLowerCase() === "#c0c4c8" ||
    color.swatch.toLowerCase() === "#a8d4f0";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      title={color.label}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
        selected
          ? "border-primary bg-primary-soft text-primary-dark"
          : "border-border bg-surface text-foreground hover:bg-accent-soft"
      }`}
    >
      <span
        className={`size-3.5 shrink-0 rounded-full ${light ? "border border-border" : ""}`}
        style={{ backgroundColor: color.swatch }}
        aria-hidden
      />
      {color.label}
      {selected && (
        <span className="text-[11px] opacity-70" aria-hidden>
          ✓
        </span>
      )}
    </button>
  );
}
