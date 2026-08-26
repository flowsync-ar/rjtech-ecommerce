"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";
import { productMeta } from "@/lib/format";

type Props = {
  product: Product;
  label?: string;
  className?: string;
  priority?: boolean;
  /** next/image `sizes` — defaults for catalog cards */
  sizes?: string;
};

export function ProductImage({
  product,
  label,
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: Props) {
  const meta = productMeta(product);
  const alt = label ?? product.name;

  return (
    <div
      className={`stripe-bg relative flex items-center justify-center overflow-hidden font-mono text-[11px] text-muted-soft ${className}`}
    >
      {meta.discountPct != null && (
        <span className="absolute top-2.5 left-2.5 z-10 rounded-md bg-sale px-2 py-0.5 text-[11px] font-bold text-white">
          -{meta.discountPct}%
        </span>
      )}
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <span className="px-2 text-center">foto: {alt}</span>
      )}
    </div>
  );
}
