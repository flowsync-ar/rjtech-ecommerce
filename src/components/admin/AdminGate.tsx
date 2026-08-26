"use client";

import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminStore } from "@/store/admin-store";
import { useProvidersStore } from "@/store/providers-store";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const hydrated = useAdminStore((s) => s.hydrated);
  const init = useAdminStore((s) => s.init);
  const fetchProviders = useProvidersStore((s) => s.fetchProviders);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void init();
  }, [init]);

  useEffect(() => {
    if (isAuthenticated) void fetchProviders();
  }, [isAuthenticated, fetchProviders]);

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
