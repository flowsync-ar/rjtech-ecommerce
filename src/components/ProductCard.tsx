"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { productHref } from "@/lib/products";
import { productMeta } from "@/lib/format";
import { useCurrency } from "@/hooks/useCurrency";
import { ProductImage } from "./ProductImage";

type Props = {
  product: Product;
  variant?: "default" | "compact";
};

export function ProductCard({ product, variant = "default" }: Props) {
  const { currency, toDisplay } = useCurrency();
  const meta = productMeta(product, currency, toDisplay);
  const isCompact = variant === "compact";

  return (
    <Link
      href={productHref(product)}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface no-underline transition-shadow hover:shadow-sm hover:no-underline!"
    >
      <ProductImage
        product={product}
        className={isCompact ? "h-[130px] text-[10.5px]" : "h-[190px]"}
        sizes={
          isCompact
            ? "(max-width: 640px) 50vw, 25vw"
            : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        }
      />
      <div
        className={`flex flex-1 flex-col ${isCompact ? "gap-1.5 p-3" : "gap-1.5 p-4"}`}
      >
        {!isCompact && (
          <div className="text-[11.5px] font-semibold tracking-wide text-muted uppercase">
            {meta.categoryLabel}
          </div>
        )}
        <div
          className={`font-semibold leading-snug text-foreground ${isCompact ? "mb-1.5 text-[13.5px]" : "text-[15px]"}`}
        >
          {product.name}
        </div>
        {!isCompact && (
          <div className="text-[12.5px] text-muted-soft">
            {meta.stars} ({product.reviews})
          </div>
        )}
        <div className="flex-1" />
        <div className="flex items-baseline gap-2">
          <div
            className={`font-bold text-foreground ${isCompact ? "text-[15px]" : "text-lg"}`}
          >
            {meta.fmtPrice}
          </div>
          {!isCompact && meta.fmtOldPrice && (
            <div className="text-[13px] text-muted-soft line-through">
              {meta.fmtOldPrice}
            </div>
          )}
        </div>
        {!isCompact && (
          <div
            className={`text-xs font-semibold ${meta.inStock ? "text-success" : "text-sale"}`}
          >
            {meta.label}
          </div>
        )}
      </div>
    </Link>
  );
}
