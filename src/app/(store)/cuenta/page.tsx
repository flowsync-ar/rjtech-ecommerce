"use client";

import { useEffect, useState } from "react";
import { AccountDashboard } from "@/components/AccountDashboard";
import { AuthPanel } from "@/components/AuthPanel";
import { useAuthStore } from "@/store/auth-store";

export default function CuentaPage() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="py-16 text-center text-sm text-muted">Cargando…</div>
    );
  }

  if (!user) return <AuthPanel />;

  return <AccountDashboard user={user} />;
}
