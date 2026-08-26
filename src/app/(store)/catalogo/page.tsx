import { Suspense } from "react";
import CatalogoClient from "./CatalogoClient";

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <div className="py-10 text-sm text-muted">Cargando catálogo…</div>
      }
    >
      <CatalogoClient />
    </Suspense>
  );
}
