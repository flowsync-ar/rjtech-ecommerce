"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ComboSelect } from "@/components/ComboSelect";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";
import { useCurrency } from "@/hooks/useCurrency";
import {
  categoryLabels,
  filterProducts,
  getAllBrands,
  getPriceBounds,
  type CategoryId,
  type SortOption,
} from "@/lib/products";
import { useCatalogStore } from "@/store/catalog-store";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "name_asc", label: "Nombre: A → Z" },
  { value: "name_desc", label: "Nombre: Z → A" },
];

type PriceStepId = "all" | "lt300" | "300to800" | "800to1500" | "gt1500";

export default function CatalogoClient() {
  const searchParams = useSearchParams();
  const { currency } = useCurrency();
  const initialCat = (searchParams.get("categoria") as CategoryId | null) ?? "all";
  const initialQuery = searchParams.get("q") ?? "";
  const products = useCatalogStore((s) => s.products);
  const priceBounds = getPriceBounds(products);

  const PRICE_STEPS = useMemo(
    () => [
      {
        id: "all" as const,
        label: "Cualquier precio",
        min: undefined as number | undefined,
        max: undefined as number | undefined,
      },
      {
        id: "lt300" as const,
        label: `Hasta ${formatPrice(300000, currency)}`,
        min: undefined,
        max: 300000,
      },
      {
        id: "300to800" as const,
        label: `${formatPrice(300000, currency)} – ${formatPrice(800000, currency)}`,
        min: 300000,
        max: 800000,
      },
      {
        id: "800to1500" as const,
        label: `${formatPrice(800000, currency)} – ${formatPrice(1500000, currency)}`,
        min: 800000,
        max: 1500000,
      },
      {
        id: "gt1500" as const,
        label: `Más de ${formatPrice(1500000, currency)}`,
        min: 1500000,
        max: undefined,
      },
    ],
    [currency],
  );
  const brands = getAllBrands(products);

  const [category, setCategory] = useState<CategoryId | "all">(
    initialCat in categoryLabels || initialCat === "all" ? initialCat : "all",
  );
  const [brand, setBrand] = useState<string>("all");
  const [priceStep, setPriceStep] = useState<PriceStepId>("all");
  const [sort, setSort] = useState<SortOption>("relevance");
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const selectedPrice = PRICE_STEPS.find((p) => p.id === priceStep) ?? PRICE_STEPS[0];

  const filtered = useMemo(
    () =>
      filterProducts(
        {
          category,
          brand,
          query,
          minPrice: selectedPrice.min,
          maxPrice: selectedPrice.max,
          sort,
        },
        products,
      ),
    [category, brand, query, selectedPrice, sort, products],
  );

  const categories: { id: CategoryId | "all"; label: string }[] = [
    { id: "all", label: "Todos" },
    ...Object.entries(categoryLabels).map(([id, label]) => ({
      id: id as CategoryId,
      label,
    })),
  ];

  const activeFilters =
    (brand !== "all" ? 1 : 0) +
    (priceStep !== "all" ? 1 : 0) +
    (query.trim() ? 1 : 0) +
    (category !== "all" ? 1 : 0);

  const clearFilters = () => {
    setCategory("all");
    setBrand("all");
    setPriceStep("all");
    setQuery("");
    setSort("relevance");
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
                    onClick={() => setCategory(cat.id)}
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

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="text-[13px] font-bold tracking-wide text-muted uppercase">
                Filtros
              </div>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="cursor-pointer border-none bg-transparent text-[12px] font-semibold text-primary"
                >
                  Limpiar
                </button>
              )}
            </div>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-[12.5px] font-semibold text-foreground">
                Nombre
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, descripción o tags..."
                className="w-full rounded-lg border border-border bg-accent-soft px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-soft focus:border-primary"
              />
            </label>

            <div className="mb-4">
              <div className="mb-1.5 text-[12.5px] font-semibold text-foreground">
                Marca
              </div>
              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  active={brand === "all"}
                  onClick={() => setBrand("all")}
                  label="Todas"
                />
                {brands.map((b) => (
                  <FilterChip
                    key={b}
                    active={brand === b}
                    onClick={() => setBrand(b)}
                    label={b}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[12.5px] font-semibold text-foreground">
                Precio
              </div>
              <div className="flex flex-col gap-1">
                {PRICE_STEPS.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setPriceStep(step.id)}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-left text-[13px] transition-colors ${
                      priceStep === step.id
                        ? "border-primary bg-primary-soft font-semibold text-primary-dark"
                        : "border-transparent bg-accent-soft font-medium text-body-text hover:border-border"
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-[11.5px] text-muted-soft">
                Catálogo: {formatPrice(priceBounds.min, currency)} –{" "}
                {formatPrice(priceBounds.max, currency)}
              </div>
            </div>
          </div>

          <div className="rounded-[10px] bg-primary-softer p-4 text-[12.5px] leading-relaxed text-muted">
            Precios en pesos, impuestos incluidos. Envío calculado en el
            checkout.
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
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
            <ComboSelect
              label="Ordenar"
              value={sort}
              options={SORT_OPTIONS}
              onChange={setSort}
              searchable
              searchPlaceholder="Buscar orden…"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
              <div className="mb-2 text-[15px] font-semibold">
                No hay productos con esos filtros
              </div>
              <div className="mb-5 text-sm text-muted">
                Probá limpiar marca, precio o la búsqueda por nombre.
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

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface text-body-text hover:border-muted-soft"
      }`}
    >
      {label}
    </button>
  );
}
