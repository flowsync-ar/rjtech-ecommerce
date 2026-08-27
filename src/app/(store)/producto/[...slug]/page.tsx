"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { QuantitySelector } from "@/components/QuantitySelector";
import { productMeta, starsFor } from "@/lib/format";
import {
  getRelatedProducts,
  productHref,
  productSpecs,
  reviewsData,
} from "@/lib/products";
import { useCurrency } from "@/hooks/useCurrency";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useCategoriesStore } from "@/store/categories-store";
import { useCheckoutStore } from "@/store/checkout-store";

/**
 * Rutas soportadas:
 * - /producto/macbooks/173  (canónica)
 * - /producto/173           (legacy → redirect)
 */
export default function ProductoPage() {
  const params = useParams<{ slug?: string[] }>();
  const router = useRouter();
  const slug = useMemo(
    () => (Array.isArray(params.slug) ? params.slug : []),
    [params.slug],
  );

  const categoriaFromUrl = slug.length >= 2 ? slug[0] : null;
  const idFromUrl = slug.length >= 2 ? slug[1] : slug[0];

  const { currency, toDisplay } = useCurrency();
  const products = useCatalogStore((s) => s.products);
  const hydrated = useCatalogStore((s) => s.hydrated);
  const categories = useCategoriesStore((s) => s.categories);
  const product = products.find((p) => p.id === Number(idFromUrl));
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const resetCheckout = useCheckoutStore((s) => s.resetCheckout);

  useEffect(() => {
    if (!hydrated || !product) return;
    const canonical = productHref(product);
    // Legacy /producto/173 o categoría incorrecta
    if (slug.length === 1 || categoriaFromUrl !== product.category) {
      router.replace(canonical);
    }
  }, [hydrated, product, slug.length, categoriaFromUrl, router]);

  if (!hydrated) {
    return (
      <div className="py-16 text-center text-sm text-muted">Cargando…</div>
    );
  }

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

  // Mientras redirige legacy / categoría incorrecta
  if (slug.length === 1 || categoriaFromUrl !== product.category) {
    return (
      <div className="py-16 text-center text-sm text-muted">Redirigiendo…</div>
    );
  }

  const meta = productMeta(product, currency, toDisplay);
  const related = getRelatedProducts(product, 4, products);
  const categoryName =
    categories.find((c) => c.id === product.category)?.name ??
    meta.categoryLabel ??
    product.category;

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
        /{" "}
        <Link
          href={`/catalogo?categoria=${encodeURIComponent(product.category)}`}
          className="text-muted-soft"
        >
          {categoryName}
        </Link>{" "}
        / <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 py-6 lg:grid-cols-[1fr_420px]">
        <div>
          <ProductGallery product={product} />
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
