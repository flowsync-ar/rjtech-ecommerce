"use client";

import { useMemo, useRef, useState } from "react";
import { MultiImageUploader } from "@/components/MultiImageUploader";
import { ProductImage } from "@/components/ProductImage";
import { findProductForImageName } from "@/lib/admin/bulk-products";
import { uploadImageAsWebp } from "@/lib/supabase/storage";
import { useCatalogStore } from "@/store/catalog-store";

type Props = {
  productIds: number[];
  onClose: () => void;
};

export function ProductImageAssign({ productIds, onClose }: Props) {
  const products = useCatalogStore((s) => s.products);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const multiRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queue = useMemo(() => {
    const set = new Set(productIds);
    return products.filter((p) => set.has(p.id));
  }, [products, productIds]);

  const withImage = queue.filter((p) => p.imageUrl).length;
  const pending = queue.filter((p) => !p.imageUrl);

  const onMultiFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    setStatus(null);

    const list = Array.from(files);
    const urlsByProduct = new Map<number, string[]>();
    for (const p of queue) {
      urlsByProduct.set(p.id, [...(p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [])]);
    }

    let matched = 0;
    let unmatched = 0;

    try {
      for (const file of list) {
        const product = findProductForImageName(file.name, queue);
        if (!product) {
          unmatched += 1;
          continue;
        }
        const uploaded = await uploadImageAsWebp(file, "products");
        const next = [...(urlsByProduct.get(product.id) ?? []), uploaded.publicUrl];
        urlsByProduct.set(product.id, next);
        matched += 1;
      }

      for (const [id, urls] of urlsByProduct) {
        const original = queue.find((p) => p.id === id);
        const prev = original?.imageUrls?.length
          ? original.imageUrls
          : original?.imageUrl
            ? [original.imageUrl]
            : [];
        const same =
          prev.length === urls.length && prev.every((u, i) => u === urls[i]);
        if (same) continue;
        await updateProduct(id, {
          imageUrl: urls[0] ?? null,
          imageUrls: urls,
        });
      }

      setStatus(
        `Asignadas ${matched} imagen${matched === 1 ? "" : "es"}` +
          (unmatched
            ? ` · ${unmatched} sin coincidencia de nombre`
            : ""),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes");
    } finally {
      setBusy(false);
      if (multiRef.current) multiRef.current.value = "";
    }
  };

  if (queue.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">No hay productos en esta cola.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-semibold"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-5">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold">Asignar imágenes</div>
          <p className="mt-1 text-[13px] text-muted">
            {withImage} de {queue.length} con imagen
            {pending.length > 0
              ? ` · quedan ${pending.length} pendientes`
              : " · listo"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg border border-border bg-transparent px-3 py-2 text-[13px] font-semibold"
        >
          Listo
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-dashed border-border bg-accent-soft/40 px-4 py-3">
        <p className="mb-2 text-[12.5px] text-muted">
          Podés elegir varias imágenes a la vez. El nombre del archivo debe
          coincidir con el producto (ej.{" "}
          <span className="font-medium text-foreground">iPhone 15.jpg</span>
          {" "}o{" "}
          <span className="font-medium text-foreground">iPhone 15-2.jpg</span>
          ).
        </p>
        <input
          ref={multiRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
          multiple
          className="hidden"
          onChange={(e) => void onMultiFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => multiRef.current?.click()}
          className="cursor-pointer rounded-lg border border-border bg-surface px-3.5 py-2 text-[13px] font-semibold disabled:opacity-50"
        >
          {busy ? "Subiendo y convirtiendo…" : "Subir varias imágenes…"}
        </button>
        {status && (
          <p className="mt-2 text-[12.5px] font-medium text-primary">{status}</p>
        )}
        {error && (
          <p className="mt-2 text-[12.5px] font-medium text-sale">{error}</p>
        )}
      </div>

      <div className="space-y-4">
        {queue.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-1 gap-3 border-t border-border-soft pt-4 first:border-t-0 first:pt-0 md:grid-cols-[72px_minmax(0,1fr)] md:items-start"
          >
            <ProductImage
              product={p}
              className="h-14 w-14 rounded-lg"
              sizes="56px"
            />
            <div className="min-w-0">
              <div className="mb-2 font-semibold">
                {p.name}{" "}
                <span className="text-[12px] font-normal text-muted">
                  · {p.brand}
                </span>
              </div>
              <MultiImageUploader
                value={
                  p.imageUrls?.length
                    ? p.imageUrls
                    : p.imageUrl
                      ? [p.imageUrl]
                      : []
                }
                onChange={(urls) =>
                  void updateProduct(p.id, {
                    imageUrl: urls[0] ?? null,
                    imageUrls: urls,
                  })
                }
                folder="products"
                label=""
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
