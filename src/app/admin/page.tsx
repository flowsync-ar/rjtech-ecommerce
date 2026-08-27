"use client";

import Link from "next/link";
import { useCatalogStore } from "@/store/catalog-store";
import { useProvidersStore } from "@/store/providers-store";
import { useStoreConfig } from "@/store/store-config";
import { useStoreCurrency } from "@/hooks/useCurrency";

export default function AdminHomePage() {
  const { formatPrice } = useStoreCurrency();
  const products = useCatalogStore((s) => s.products);
  const providers = useProvidersStore((s) => s.providers);
  const config = useStoreConfig((s) => s.config);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const cards = [
    {
      label: "Productos",
      value: String(products.length),
      hint: `${outOfStock} agotados · ${lowStock} stock bajo`,
      href: "/admin/productos",
    },
    {
      label: "Proveedores",
      value: String(providers.length),
      hint: "Contactos activos",
      href: "/admin/proveedores",
    },
    {
      label: "Envío gratis desde",
      value: formatPrice(config.freeShippingFrom),
      hint: `Costo envío: ${formatPrice(config.shippingCost)}`,
      href: "/admin/configuracion",
    },
  ];

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Panel de administración</h1>
      <p className="mb-8 text-sm text-muted">
        Gestioná el catálogo, proveedores y la configuración de {config.storeName}.
      </p>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-border bg-surface p-5 no-underline transition-shadow hover:shadow-sm hover:!no-underline"
          >
            <div className="mb-1 text-[13px] font-semibold text-muted">
              {c.label}
            </div>
            <div className="mb-1 text-2xl font-bold text-foreground">
              {c.value}
            </div>
            <div className="text-[12.5px] text-muted-soft">{c.hint}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 text-sm font-bold">Accesos rápidos</div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/productos"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold !text-white no-underline hover:!no-underline"
          >
            + Nuevo producto
          </Link>
          <Link
            href="/admin/proveedores"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground no-underline hover:!no-underline"
          >
            + Nuevo proveedor
          </Link>
          <Link
            href="/admin/configuracion"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground no-underline hover:!no-underline"
          >
            Editar tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
