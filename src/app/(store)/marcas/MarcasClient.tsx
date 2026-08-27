"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BrandMark } from "@/components/BrandMark";
import { useBrandsStore } from "@/store/brands-store";
import { useCatalogStore } from "@/store/catalog-store";

export function MarcasClient() {
  const products = useCatalogStore((s) => s.products);
  const storeBrands = useBrandsStore((s) => s.brands);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.active) continue;
      const name = p.brand?.trim();
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const logoByName = new Map(
      storeBrands.map((b) => [b.name.toLowerCase(), b.logoUrl] as const),
    );

    return [...counts.entries()]
      .map(([name, count]) => ({
        name,
        count,
        logoUrl: logoByName.get(name.toLowerCase()) ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [products, storeBrands]);

  return (
    <div className="py-10 md:py-14">
      <div className="mb-8 max-w-[40rem]">
        <p className="mb-3 text-[13px] font-bold tracking-wider text-primary uppercase">
          Marcas
        </p>
        <h1 className="mb-3 text-[32px] leading-tight font-bold tracking-tight md:text-[40px]">
          Las marcas que laburamos.
        </h1>
        <p className="text-[15px] leading-relaxed text-muted md:text-base">
          Elegí una marca y te llevamos al catálogo con ese filtro aplicado.
        </p>
      </div>

      {brands.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay marcas en el catálogo.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={`/catalogo?marca=${encodeURIComponent(brand.name)}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface no-underline transition-colors hover:border-primary hover:!no-underline"
            >
              <BrandMark
                name={brand.name}
                logoUrl={brand.logoUrl}
                className="aspect-[4/3] w-full shrink-0 rounded-none"
              />
              <div className="relative z-10 border-t border-border-soft bg-surface px-3.5 py-3">
                <div className="truncate text-[14px] font-bold text-foreground">
                  {brand.name}
                </div>
                <div className="mt-0.5 text-[12.5px] text-muted">
                  {brand.count}{" "}
                  {brand.count === 1 ? "producto" : "productos"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
