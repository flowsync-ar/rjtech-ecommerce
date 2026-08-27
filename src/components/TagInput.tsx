"use client";

import { useState } from "react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
};

function normalizeTag(raw: string) {
  return raw.trim().replace(/\s+/g, " ");
}

export function TagInput({
  value,
  onChange,
  placeholder = "Escribí un tag y Enter…",
  className = "",
}: Props) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag) return;
    const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <input
        type="text"
        value={draft}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(draft);
            return;
          }
          if (e.key === "Backspace" && !draft && value.length > 0) {
            removeTag(value[value.length - 1]);
          }
        }}
        onBlur={() => {
          if (draft.trim()) addTag(draft);
        }}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[12.5px] font-semibold text-primary-dark"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Quitar tag ${tag}`}
                className="inline-flex size-4 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-primary-dark/70 hover:bg-primary/15 hover:text-primary-dark"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M3 3l6 6M9 3l-6 6" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
