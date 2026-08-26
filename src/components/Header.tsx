"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useCartStore((s) => s.cartCount());
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount : 0;
  const accountLabel =
    mounted && user ? user.name.split(" ")[0] : "Mi cuenta";
  const isHome = pathname === "/";
  const isCatalog = pathname.startsWith("/catalogo");
  const isNosotros = pathname.startsWith("/nosotros");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/catalogo?q=${encodeURIComponent(q)}` : "/catalogo");
  };

  return (
    <header className="sticky top-0 z-20 flex h-[132px] items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:gap-7 md:h-[148px] md:px-10">
      <BrandLogo size="md" />

      <nav className="hidden items-center gap-1 sm:flex">
        <Link
          href="/"
          className={`rounded-md px-3 py-2 text-sm font-semibold no-underline hover:!no-underline ${
            isHome ? "text-primary" : "text-foreground"
          }`}
        >
          Inicio
        </Link>
        <Link
          href="/catalogo"
          className={`rounded-md px-3 py-2 text-sm font-semibold no-underline hover:!no-underline ${
            isCatalog ? "text-primary" : "text-foreground"
          }`}
        >
          Catálogo
        </Link>
        <Link
          href="/nosotros"
          className={`rounded-md px-3 py-2 text-sm font-semibold no-underline hover:!no-underline ${
            isNosotros ? "text-primary" : "text-foreground"
          }`}
        >
          Nosotros
        </Link>
      </nav>

      <form
        onSubmit={onSearch}
        className="ml-2 hidden max-w-[440px] flex-1 md:block"
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos, marcas, tags..."
          className="w-full rounded-lg border border-border bg-accent-soft px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-soft focus:border-primary"
        />
      </form>

      <div className="flex-1" />

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/cuenta"
          className="rounded-md px-2.5 py-2 text-[13.5px] font-medium text-muted no-underline hover:!no-underline"
        >
          {accountLabel}
        </Link>
        <Link
          href="/carrito"
          aria-label={`Carrito${count > 0 ? `, ${count} productos` : ""}`}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground no-underline transition-colors hover:bg-accent-soft hover:!no-underline"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
            aria-hidden
          >
            <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
            <circle cx="18" cy="20" r="1.25" fill="currentColor" stroke="none" />
            <path d="M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.45-1.1L21 8H7" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
              {count}
            </span>
          )}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
