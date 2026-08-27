"use client";

import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/store/admin-store";
import { useBrandsStore } from "@/store/brands-store";
import { useCategoriesStore } from "@/store/categories-store";
import { useProvidersStore } from "@/store/providers-store";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const hydrated = useAdminStore((s) => s.hydrated);
  const init = useAdminStore((s) => s.init);
  const fetchProviders = useProvidersStore((s) => s.fetchProviders);
  const fetchBrands = useBrandsStore((s) => s.fetchBrands);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void init();
  }, [init]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetchProviders();
    void fetchBrands();
    void fetchCategories();
  }, [isAuthenticated, fetchProviders, fetchBrands, fetchCategories]);

  if (!mounted || !hydrated) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-muted">
        Cargando…
      </div>
    );
  }

  if (!isAuthenticated) return <AdminLogin />;

  return <AdminShell>{children}</AdminShell>;
}
