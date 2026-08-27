"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ComboSelect } from "@/components/ComboSelect";
import { ProductCard } from "@/components/ProductCard";
import {
  currencyPrefix,
  formatAmount,
  type CurrencyCode,
} from "@/lib/format";
import { convertAmount, useCurrency } from "@/hooks/useCurrency";
import { useFxStore } from "@/store/fx-store";
import {
  categoryLabels,
  filterProducts,
  getAllBrands,
  type CategoryId,
  type Product,
  type SortOption,
} from "@/lib/products";
import { useCatalogStore } from "@/store/catalog-store";
import { useCategoriesStore } from "@/store/categories-store";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre: A → Z" },
  { value: "name_desc", label: "Nombre: Z → A" },
];

type PriceBucket = {
  id: string;
  label: string;
  min?: number;
  max?: number;
};

function roundPrice(n: number): number {
  if (n < 1000) return Math.max(100, Math.round(n / 100) * 100);
  if (n < 10_000) return Math.round(n / 500) * 500;
  if (n < 100_000) return Math.round(n / 5_000) * 5_000;
  if (n < 1_000_000) return Math.round(n / 50_000) * 50_000;
  return Math.round(n / 100_000) * 100_000;
}

function buildPriceBuckets(
  prices: number[],
  currency: CurrencyCode,
): PriceBucket[] {
  if (prices.length === 0) return [];
  const sorted = [...prices].sort((a, b) => a - b);
  const p33 = sorted[Math.floor((sorted.length - 1) * 0.33)] ?? sorted[0];
  const p66 = sorted[Math.floor((sorted.length - 1) * 0.66)] ?? sorted.at(-1)!;
  let low = roundPrice(p33);
  let high = roundPrice(p66);
  if (high <= low) high = low * 2;

  const prefix = currencyPrefix(currency);
  const fmt = (n: number) => `${prefix} ${formatAmount(n)}`;

  return [
    {
      id: "lt",
      label: `Hasta ${fmt(low)}`,
      max: low,
    },
    {
      id: "mid",
      label: `${fmt(low)} a ${fmt(high)}`,
      min: low,
      max: high,
    },
    {
      id: "gt",
      label: `Más de ${fmt(high)}`,
      min: high,
    },
  ];
}

function countInRange(
  list: Product[],
  min?: number,
  max?: number,
): number {
  return list.filter((p) => {
    if (min != null && p.price < min) return false;
    if (max != null && p.price > max) return false;
    return true;
  }).length;
}

function parseMoneyDigits(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits);
}

export default function CatalogoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currency, storeCurrency, blueVenta } = useCurrency();
  const setDisplayCurrency = useFxStore((s) => s.setDisplayCurrency);
  const initialCat =
    (searchParams.get("categoria") as CategoryId | null) ?? "all";
  const initialQuery = searchParams.get("q") ?? "";
  const products = useCatalogStore((s) => s.products);
  const storeCategories = useCategoriesStore((s) => s.categories);

  const brands = getAllBrands(products);

  const [category, setCategory] = useState<CategoryId | "all">(
    initialCat === "all" || Boolean(initialCat) ? initialCat : "all",
  );
  const [brand, setBrand] = useState<string>("all");
  /** Rangos en moneda de visualización. */
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    const cat = searchParams.get("categoria");
    setCategory(cat && cat !== "all" ? cat : "all");
  }, [searchParams]);

  const pushCatalogUrl = (next: {
    category?: CategoryId | "all";
    query?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const cat = next.category ?? category;
    const q = next.query !== undefined ? next.query : query;

    if (!cat || cat === "all") params.delete("categoria");
    else params.set("categoria", cat);

    const trimmed = q.trim();
    if (!trimmed) params.delete("q");
    else params.set("q", trimmed);

    const qs = params.toString();
    router.push(qs ? `/catalogo?${qs}` : "/catalogo", { scroll: false });
  };

  const selectCategory = (id: CategoryId | "all") => {
    setCategory(id);
    pushCatalogUrl({ category: id });
  };

  /** Base sin filtro de precio (para rangos y conteos). */
  const baseList = useMemo(
    () =>
      filterProducts(
        {
          category,
          brand,
          query,
          sort: "relevance",
        },
        products,
      ),
    [category, brand, query, products],
  );

  const toStoreAmount = (amount: number) =>
    convertAmount(amount, currency, storeCurrency, blueVenta);

  const priceBuckets = useMemo(
    () =>
      buildPriceBuckets(
        baseList.map((p) =>
          convertAmount(p.price, storeCurrency, currency, blueVenta),
        ),
        currency,
      ),
    [baseList, currency, storeCurrency, blueVenta],
  );

  const storeMin =
    minPrice != null ? toStoreAmount(minPrice) : undefined;
  const storeMax =
    maxPrice != null ? toStoreAmount(maxPrice) : undefined;

  const filtered = useMemo(
    () =>
      filterProducts(
        {
          category,
          brand,
          query,
          minPrice: storeMin,
          maxPrice: storeMax,
          sort,
        },
        products,
      ),
    [category, brand, query, storeMin, storeMax, sort, products],
  );

  const categories: { id: CategoryId | "all"; label: string }[] = useMemo(() => {
    const fromStore = storeCategories
      .filter((c) => c.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ id: c.id, label: c.name }));
    const list = fromStore.length
      ? fromStore
      : Object.entries(categoryLabels).map(([id, label]) => ({
          id,
          label,
        }));
    return [{ id: "all", label: "Todos" }, ...list];
  }, [storeCategories]);

  const brandOptions = useMemo(
    () => [
      { value: "all", label: "Todas las marcas" },
      ...brands.map((b) => ({ value: b, label: b })),
    ],
    [brands],
  );

  const priceActive = minPrice != null || maxPrice != null;

  const activeFilters =
    (brand !== "all" ? 1 : 0) +
    (priceActive ? 1 : 0) +
    (query.trim() ? 1 : 0) +
    (category !== "all" ? 1 : 0);

  const clearFilters = () => {
    setCategory("all");
    setBrand("all");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setDraftMin("");
    setDraftMax("");
    setQuery("");
    setSort("relevance");
    router.push("/catalogo", { scroll: false });
  };

  const clearPrice = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setDraftMin("");
    setDraftMax("");
  };

  const applyBucket = (bucket: PriceBucket) => {
    setMinPrice(bucket.min);
    setMaxPrice(bucket.max);
    setDraftMin(bucket.min != null ? formatAmount(bucket.min) : "");
    setDraftMax(bucket.max != null ? formatAmount(bucket.max) : "");
  };

  const applyCustomRange = () => {
    const min = parseMoneyDigits(draftMin);
    const max = parseMoneyDigits(draftMax);
    if (min != null && max != null && min > max) {
      setMinPrice(max);
      setMaxPrice(min);
      setDraftMin(formatAmount(max));
      setDraftMax(formatAmount(min));
      return;
    }
    setMinPrice(min ?? undefined);
    setMaxPrice(max ?? undefined);
    if (min != null) setDraftMin(formatAmount(min));
    if (max != null) setDraftMax(formatAmount(max));
  };

  const isBucketActive = (bucket: PriceBucket) =>
    minPrice === bucket.min && maxPrice === bucket.max;

  const onCurrencyChange = (next: CurrencyCode) => {
    if (next === currency) return;
    setDisplayCurrency(next);
    // Limpiar rango: los montos están en la moneda anterior
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setDraftMin("");
    setDraftMax("");
  };

  return (
    <>
      <div className="pt-5 text-[13px] text-muted-soft">
        <Link href="/" className="text-muted-soft">
          Inicio
        </Link>{" "}
        / <span className="text-foreground">Catálogo</span>
      </div>

      <div className="flex flex-col gap-9 py-5 pb-[60px] lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-7 lg:w-[250px]">
          <div>
            <div className="mb-3 text-[13px] font-bold tracking-wide text-muted uppercase">
              Categoría
            </div>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => {
                const active = cat.id === category;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => selectCategory(cat.id)}
                    className={`cursor-pointer rounded-lg border-none px-3 py-2.5 text-left text-sm ${
                      active
                        ? "bg-primary-soft font-bold text-primary-dark"
                        : "bg-transparent font-medium text-body-text"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[13px] font-bold tracking-wide text-foreground">
                Precio
              </span>
              <span className="text-border" aria-hidden>
                |
              </span>
              <div className="flex items-center gap-2 text-[13px] font-semibold">
                <button
                  type="button"
                  onClick={() => onCurrencyChange("ARS")}
                  className={`cursor-pointer border-none bg-transparent p-0 ${
                    currency === "ARS" ? "text-foreground" : "text-muted-soft"
                  }`}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => onCurrencyChange("USD")}
                  className={`cursor-pointer border-none bg-transparent p-0 ${
                    currency === "USD" ? "text-foreground" : "text-muted-soft"
                  }`}
                >
                  US$
                </button>
              </div>
              {priceActive && (
                <button
                  type="button"
                  onClick={clearPrice}
                  className="ml-auto cursor-pointer border-none bg-transparent text-[12px] font-semibold text-primary"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="mb-3 flex flex-col gap-2">
              {priceBuckets.map((bucket) => {
                const count = countInRange(
                  baseList,
                  bucket.min != null ? toStoreAmount(bucket.min) : undefined,
                  bucket.max != null ? toStoreAmount(bucket.max) : undefined,
                );
                if (count === 0) return null;
                const active = isBucketActive(bucket);
                return (
                  <button
                    key={bucket.id}
                    type="button"
                    onClick={() => applyBucket(bucket)}
                    className={`cursor-pointer border-none bg-transparent p-0 text-left text-[13px] ${
                      active
                        ? "font-semibold text-primary"
                        : "font-medium text-body-text hover:text-primary"
                    }`}
                  >
                    {bucket.label}{" "}
                    <span className="font-normal text-muted-soft">
                      ({count.toLocaleString("es-AR")})
                    </span>
                  </button>
                );
              })}
            </div>

            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                applyCustomRange();
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                placeholder="Mínimo"
                value={draftMin}
                onChange={(e) => {
                  const n = parseMoneyDigits(e.target.value);
                  setDraftMin(n == null ? "" : formatAmount(n));
                }}
                className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-foreground outline-none placeholder:text-muted-soft focus:border-primary"
              />
              <span className="text-muted-soft" aria-hidden>
                —
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Máximo"
                value={draftMax}
                onChange={(e) => {
                  const n = parseMoneyDigits(e.target.value);
                  setDraftMax(n == null ? "" : formatAmount(n));
                }}
                className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2.5 py-2 text-[12.5px] text-foreground outline-none placeholder:text-muted-soft focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Aplicar rango de precio"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-primary hover:text-primary"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M7 4.5 12.5 10 7 15.5" />
                </svg>
              </button>
            </form>
          </div>

          <div className="rounded-[10px] bg-primary-softer p-4 text-[12.5px] leading-relaxed text-muted">
            Precios con impuestos incluidos. Envío calculado en el checkout.
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="shrink-0 text-sm text-muted">
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "producto" : "productos"}
              {activeFilters > 0 && (
                <span className="ml-2 text-muted-soft">
                  · {activeFilters} filtro{activeFilters > 1 ? "s" : ""} activo
                  {activeFilters > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
              <ComboSelect
                value={brand}
                options={brandOptions}
                onChange={setBrand}
                placeholder="Marca"
                searchPlaceholder="Buscar marca…"
                searchable
                className="min-w-[140px] flex-1 sm:flex-none sm:min-w-[150px]"
              />
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cursor-pointer border-none bg-transparent px-1 text-[12.5px] font-semibold whitespace-nowrap text-primary"
                >
                  Limpiar
                </button>
              )}
              <ComboSelect
                label="Ordenar"
                value={sort}
                options={SORT_OPTIONS}
                onChange={setSort}
                searchable
                searchPlaceholder="Buscar orden…"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <div className="mb-2 text-[15px] font-semibold">
                No hay productos con esos filtros
              </div>
              <div className="mb-5 text-sm text-muted">
                Probá limpiar marca, precio o la búsqueda.
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer rounded-[9px] border-none bg-primary px-5 py-2.5 text-sm font-semibold text-white"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
