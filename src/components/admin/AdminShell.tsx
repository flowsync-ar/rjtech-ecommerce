"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAdminStore } from "@/store/admin-store";

const nav = [
  { href: "/admin", label: "Inicio", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/proveedores", label: "Proveedores" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useAdminStore((s) => s.logout);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="xs" />
            <div>
              <div className="text-sm font-bold leading-tight">RJ Tech Admin</div>
              <div className="text-[11px] text-muted">Panel de gestión</div>
            </div>
          </div>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-semibold no-underline hover:!no-underline ${
                    active ? "bg-primary-soft text-primary-dark" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />
          <ThemeToggle />
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md px-2.5 py-2 text-[13px] font-medium text-muted no-underline hover:!no-underline sm:inline"
          >
            Ver tienda
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="cursor-pointer rounded-lg border border-border px-3 py-2 text-[13px] font-semibold text-sale"
          >
            Salir
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
          {nav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-3 py-1.5 text-[13px] font-semibold no-underline hover:!no-underline ${
                  active ? "bg-primary-soft text-primary-dark" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
