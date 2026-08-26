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

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-[12.5px] font-semibold text-muted">{label}</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="stripe-bg relative h-36 w-full overflow-hidden rounded-lg border border-border sm:w-44">
          {value ? (
            <Image
              src={value}
              alt="Vista previa"
              fill
              sizes="176px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-[12px] text-muted-soft">
              Sin imagen
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onPick(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {uploading ? "Convirtiendo a WebP…" : "Subir imagen"}
          </button>
          {value && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => onChange(null)}
              className="cursor-pointer rounded-lg border-none bg-transparent px-1 py-1 text-left text-[12.5px] font-semibold text-sale"
            >
              Quitar imagen
            </button>
          )}
          <p className="text-[12px] text-muted-soft">
            JPG, PNG, HEIC u otras: se transforman a WebP automáticamente.
          </p>
          {error && (
            <p className="text-[12.5px] font-medium text-sale">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
