"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AccountDashboard } from "@/components/AccountDashboard";
import { AuthPanel } from "@/components/AuthPanel";
import { safeNextPath } from "@/lib/auth-redirect";
import { useAuthStore } from "@/store/auth-store";

function CuentaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const returnTo = safeNextPath(searchParams.get("next"));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !user || !returnTo) return;
    router.replace(returnTo);
  }, [mounted, user, returnTo, router]);

  if (!mounted) {
    return (
      <div className="py-16 text-center text-sm text-muted">Cargando…</div>
    );
  }

  if (!user) return <AuthPanel />;

  if (returnTo) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Redirigiendo al checkout…
      </div>
    );
  }

  return <AccountDashboard user={user} />;
}

export default function CuentaPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-muted">Cargando…</div>
      }
    >
      <CuentaContent />
    </Suspense>
  );
}
