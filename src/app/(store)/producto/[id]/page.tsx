"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { QuantitySelector } from "@/components/QuantitySelector";
import { productMeta, starsFor } from "@/lib/format";
import {
  getRelatedProducts,
  productSpecs,
  reviewsData,
} from "@/lib/products";
import { useCurrency } from "@/hooks/useCurrency";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useCheckoutStore } from "@/store/checkout-store";

export default function ProductoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currency } = useCurrency();
  const products = useCatalogStore((s) => s.products);
  const product = products.find((p) => p.id === Number(params.id));
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const resetCheckout = useCheckoutStore((s) => s.resetCheckout);

  if (!product) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted">Producto no encontrado.</p>
        <Link href="/catalogo" className="font-semibold">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const meta = productMeta(product, currency);
  const related = getRelatedProducts(product, 4, products);

  const onAddToCart = () => {
    void addItem(product.id, qty);
  };
  const onBuyNow = () => {
    void addItem(product.id, qty).then(() => {
      resetCheckout();
      router.push("/checkout");
    });
  };

  return (
    <>
      <div className="pt-5 text-[13px] text-muted-soft">
        <Link href="/" className="text-muted-soft">
          Inicio
        </Link>{" "}
        /{" "}
        <Link href="/catalogo" className="text-muted-soft">
          Catálogo
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 py-6 lg:grid-cols-[1fr_420px]">
        <div>
          <ProductImage
            product={product}
            className="mb-3 h-[320px] rounded-[14px] text-xs md:h-[420px]"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((n) => (
              <ProductImage
                key={n}
                product={product}
                className="h-[90px] rounded-[10px] border border-border"
                sizes="120px"
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-bold tracking-wide text-primary uppercase">
            {meta.categoryLabel}
          </div>
          <h1 className="mb-2.5 text-[27px] leading-tight font-bold tracking-tight">
            {product.name}
          </h1>
          <div className="mb-[18px] text-sm text-muted">
            {meta.stars} · {product.reviews} reseñas
          </div>
          <div className="mb-1.5 flex items-baseline gap-3">
            <div className="text-[30px] font-bold">{meta.fmtPrice}</div>
            {meta.fmtOldPrice && (
              <>
                <div className="text-base text-muted-soft line-through">
                  {meta.fmtOldPrice}
                </div>
                <div className="text-[13px] font-bold text-sale">
                  -{meta.discountPct}%
                </div>
              </>
            )}
          </div>
          <div className="mb-4 text-[13.5px] text-body-text">
            {product.installments}
          </div>
          <div
            className={`mb-[22px] inline-block rounded-[7px] px-3 py-1.5 text-[12.5px] font-bold ${
              meta.inStock
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-sale"
            }`}
          >
            {meta.label}
          </div>
          <div className="mb-[22px] h-px bg-border" />

          {meta.inStock && (
            <>
              <div className="mb-4">
                <QuantitySelector
                  value={qty}
                  onDec={() => setQty((q) => Math.max(1, q - 1))}
                  onInc={() => setQty((q) => q + 1)}
                />
              </div>
              <div className="mb-3.5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onAddToCart}
                  className="flex-1 cursor-pointer rounded-[9px] border-none bg-primary-soft py-3.5 text-[14.5px] font-bold text-primary-dark"
                >
                  Agregar al carrito
                </button>
                <button
                  type="button"
                  onClick={onBuyNow}
                  className="flex-1 cursor-pointer rounded-[9px] border-none bg-primary py-3.5 text-[14.5px] font-bold text-white"
                >
                  Comprar ahora
                </button>
              </div>
            </>
          )}
          <div className="text-[12.5px] text-muted">
            Envío a todo el país · Garantía oficial 12 meses
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 py-7 lg:grid-cols-[1fr_420px]">
        <div>
          <h3 className="mb-3 text-base font-bold">Descripción</h3>
          <p className="mb-6 text-[14.5px] leading-relaxed text-body-text">
            {product.description}
          </p>
          <h3 className="mb-3 text-base font-bold">Especificaciones</h3>
          <div className="overflow-hidden rounded-[10px] border border-border">
            {productSpecs.map((s, i) => (
              <div
                key={s.k}
                className={`flex px-4 py-3 text-[13.5px] ${
                  i < productSpecs.length - 1 ? "border-b border-border-soft" : ""
                }`}
              >
                <div className="w-40 shrink-0 text-muted">{s.k}</div>
                <div className="font-medium">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div />
      </div>

      <div className="py-3 pb-10">
        <h3 className="mb-4 text-base font-bold">Reseñas de clientes</h3>
        <div className="flex max-w-[640px] flex-col gap-4">
          {reviewsData.map((r) => (
            <div
              key={r.name}
              className="rounded-[10px] border border-border p-4"
            >
              <div className="mb-1.5 flex justify-between">
                <div className="text-[13.5px] font-bold">{r.name}</div>
                <div className="text-xs text-muted-soft">{r.date}</div>
              </div>
              <div className="mb-2 text-[13px] text-success">
                {starsFor(r.rating)}
              </div>
              <div className="text-[13.5px] leading-relaxed text-body-text">
                {r.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <div className="border-t border-border py-2 pb-14">
          <h3 className="mt-8 mb-[18px] text-lg font-bold">
            También te puede interesar
          </h3>
          <div className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
