"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImageAsWebp } from "@/lib/supabase/storage";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  className?: string;
};

export function ImageUploader({
  value,
  onChange,
  folder = "products",
  label = "Imagen (se convierte a WebP)",
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded = await uploadImageAsWebp(file, folder);
      onChange(uploaded.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const openPicker = () => {
    if (!uploading) inputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label ? (
        <div className="text-[12.5px] font-semibold text-muted">{label}</div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void onPick(e.target.files?.[0])}
      />

      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          aria-label={value ? "Cambiar imagen" : "Subir imagen"}
          className="stripe-bg group relative h-36 w-36 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-dashed border-border bg-accent-soft text-left outline-none transition-colors hover:border-primary hover:bg-primary-softer focus-visible:border-primary disabled:cursor-wait disabled:opacity-70 sm:h-40 sm:w-40"
        >
          {value ? (
            <>
              <Image
                src={value}
                alt="Vista previa"
                fill
                sizes="160px"
                className="h-full w-full object-cover object-center"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
              <span className="absolute inset-x-0 bottom-0 bg-foreground/70 px-2 py-1.5 text-center text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                Cambiar
              </span>
            </>
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-lg leading-none text-muted"
                aria-hidden
              >
                {uploading ? "…" : "+"}
              </span>
              <span className="text-[12px] font-semibold text-muted">
                {uploading ? "Subiendo…" : "Agregar imagen"}
              </span>
              <span className="text-[10.5px] leading-snug text-muted-soft">
                JPG, PNG, HEIC → WebP
              </span>
            </span>
          )}
        </button>

        {value && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => onChange(null)}
            className="cursor-pointer rounded-md border-none bg-transparent px-1 py-1 text-[12.5px] font-semibold text-sale"
          >
            Quitar
          </button>
        )}
      </div>

      {error && (
        <p className="text-[12.5px] font-medium text-sale">{error}</p>
      )}
    </div>
  );
}
