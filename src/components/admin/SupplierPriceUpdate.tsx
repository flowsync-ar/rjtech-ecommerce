"use client";

import { useMemo, useState } from "react";
import {
  parseSupplierPriceText,
  planSupplierPriceUpdate,
  productInputFromSupplierEntry,
  summarizeSupplierPlan,
  type SupplierMatchRow,
} from "@/lib/admin/supplier-price-update";
import { useCatalogStore } from "@/store/catalog-store";
import { useBrandsStore } from "@/store/brands-store";
import { useStoreCurrency } from "@/hooks/useCurrency";

type Props = {
  onClose: () => void;
};

type ApplyOptions = {
  updateCost: boolean;
  updateTags: boolean;
  activate: boolean;
  deactivate: boolean;
  createMissing: boolean;
};

const DEFAULT_OPTIONS: ApplyOptions = {
  updateCost: true,
  updateTags: false,
  activate: false,
  deactivate: false,
  createMissing: false,
};

export function SupplierPriceUpdate({ onClose }: Props) {
  const products = useCatalogStore((s) => s.products);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const addProduct = useCatalogStore((s) => s.addProduct);
  const ensureBrand = useBrandsStore((s) => s.ensureBrand);
  const { formatPrice } = useStoreCurrency();

  const [text, setText] = useState("");
  const [rows, setRows] = useState<SupplierMatchRow[] | null>(null);
  const [options, setOptions] = useState<ApplyOptions>(DEFAULT_OPTIONS);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const summary = useMemo(
    () => (rows ? summarizeSupplierPlan(rows) : null),
    [rows],
  );

  const toggle = (key: keyof ApplyOptions) => {
    setOptions((o) => ({ ...o, [key]: !o[key] }));
  };

  const willApply = (row: SupplierMatchRow) => {
    if (row.action === "unmatched_paste") return options.createMissing;
    if (!row.product) return false;
    if (row.action === "update_cost") {
      return options.updateCost || options.updateTags || options.activate;
    }
    if (row.action === "activate") return options.activate;
    if (row.action === "deactivate") return options.deactivate;
    return false;
  };

  const applyCount = useMemo(() => {
    if (!rows) return 0;
    return rows.filter(willApply).length;
    // willApply closes over options
  }, [rows, options]);

  const onAnalyze = () => {
    setError(null);
    setDoneMsg(null);
    const entries = parseSupplierPriceText(text);
    if (entries.length === 0) {
      setRows(null);
      setError(
        "No pude leer productos. Pegá el listado con líneas ▪️ NOMBRE - $ PRECIO.",
      );
      return;
    }
    setRows(planSupplierPriceUpdate(products, entries));
  };

  const onApply = async () => {
    if (!rows) return;
    if (
      !options.updateCost &&
      !options.updateTags &&
      !options.activate &&
      !options.deactivate &&
      !options.createMissing
    ) {
      setError("Activá al menos un pill de acción para aplicar.");
      return;
    }

    const actionable = rows.filter(willApply);
    if (actionable.length === 0) {
      setDoneMsg("Con las acciones elegidas no hay nada para aplicar.");
      return;
    }

    setApplying(true);
    setError(null);
    setDoneMsg(null);
    try {
      let ok = 0;
      for (const row of actionable) {
        if (row.action === "unmatched_paste" && row.entry) {
          const input = productInputFromSupplierEntry(row.entry);
          await ensureBrand(input.brand);
          await addProduct(input);
          ok += 1;
          continue;
        }

        const p = row.product!;
        if (row.action === "deactivate") {
          await updateProduct(p.id, { active: false });
          ok += 1;
          continue;
        }

        const patch: {
          costPrice?: number | null;
          price?: number;
          colors?: string[];
          active?: boolean;
        } = {};

        if (options.updateCost && row.nextCost != null) {
          patch.costPrice = row.nextCost;
          patch.price = row.nextPrice ?? p.price;
        }
        if (options.updateTags && row.nextTags) {
          patch.colors = row.nextTags;
        }
        if (options.activate) {
          patch.active = true;
        }

        if (Object.keys(patch).length === 0) continue;
        await updateProduct(p.id, patch);
        ok += 1;
      }
      setDoneMsg(
        `Listo: ${ok} producto${ok === 1 ? "" : "s"} procesado${ok === 1 ? "" : "s"}.`,
      );
      const entries = parseSupplierPriceText(text);
      setRows(
        planSupplierPriceUpdate(useCatalogStore.getState().products, entries),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al aplicar");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Actualizar precios y stock</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Pegá el listado, analizá y tocá los pills para elegir qué aplicar.
            Tachado = no se hace. Por defecto solo actualiza costo/venta.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-semibold"
        >
          Cerrar
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setRows(null);
          setDoneMsg(null);
        }}
        placeholder="Pegá acá el texto del proveedor (► secciones, ▪️ productos - $ precio, colores abajo)…"
        className="min-h-[220px] w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-foreground outline-none focus:border-primary"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAnalyze}
          className="cursor-pointer rounded-lg border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
        >
          Analizar listado
        </button>
        <button
          type="button"
          disabled={!rows || applying || applyCount === 0}
          onClick={() => void onApply()}
          className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          {applying
            ? "Aplicando…"
            : applyCount > 0
              ? `Aplicar (${applyCount})`
              : "Aplicar cambios"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm font-semibold text-sale">{error}</p>
      )}
      {doneMsg && (
        <p className="mt-3 text-sm font-semibold text-success-dark">{doneMsg}</p>
      )}

      {summary && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
            Click en un pill para activar / tachar la acción
          </p>
          <div className="flex flex-wrap gap-2 text-[12.5px]">
            <TogglePill
              tone="primary"
              active={options.updateCost}
              onClick={() => toggle("updateCost")}
              title="Actualiza costo y recalcula venta"
            >
              {summary.updateCost} actualizar costo/venta
            </TogglePill>
            <TogglePill
              tone="primary"
              active={options.updateTags}
              onClick={() => toggle("updateTags")}
              title="Actualiza tags/colores del listado"
            >
              tags / colores
            </TogglePill>
            <TogglePill
              tone="success"
              active={options.activate}
              onClick={() => toggle("activate")}
              title="Activa productos del listado que estaban inactivos"
            >
              {summary.activate} activar
            </TogglePill>
            <TogglePill
              tone="warn"
              active={options.deactivate}
              onClick={() => toggle("deactivate")}
              title="Desactiva productos del catálogo que no están en el listado"
            >
              {summary.deactivate} desactivar
            </TogglePill>
            <TogglePill
              tone="sale"
              active={options.createMissing}
              onClick={() => toggle("createMissing")}
              title="Crea en el catálogo los productos sin match"
            >
              {summary.unmatchedPaste} agregar sin match
            </TogglePill>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 font-semibold text-muted">
              {summary.unchanged} sin cambios
            </span>
          </div>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="mt-4 max-h-[420px] overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] border-collapse text-left text-[12.5px]">
            <thead className="sticky top-0 bg-primary-softer text-muted">
              <tr>
                <th className="px-3 py-2 font-bold">Acción</th>
                <th className="px-3 py-2 font-bold">Producto</th>
                <th className="px-3 py-2 font-bold">Costo</th>
                <th className="px-3 py-2 font-bold">Venta</th>
                <th className="px-3 py-2 font-bold">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const skipped = !willApply(row) && row.action !== "unchanged";
                const preview =
                  row.action === "unmatched_paste" && row.entry
                    ? productInputFromSupplierEntry(row.entry)
                    : null;
                return (
                  <tr
                    key={`${row.action}-${row.product?.id ?? "x"}-${row.entry?.lineNumber ?? idx}`}
                    className={`border-t border-border-soft ${skipped ? "opacity-40" : ""}`}
                  >
                    <td className="px-3 py-2">
                      <ActionPill action={row.action} skipped={skipped} />
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-semibold">
                        {row.product?.name ??
                          preview?.name ??
                          row.entry?.name ??
                          "—"}
                      </div>
                      {(row.entry?.tags?.length || preview?.tags?.length) ? (
                        <div className="text-[11px] text-muted">
                          {(row.entry?.tags ?? preview?.tags ?? []).join(" · ")}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {row.nextCost != null
                        ? formatPrice(row.nextCost)
                        : preview
                          ? formatPrice(preview.costPrice)
                          : row.product?.costPrice != null
                            ? formatPrice(row.product.costPrice)
                            : "—"}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {row.nextPrice != null
                        ? formatPrice(row.nextPrice)
                        : preview
                          ? formatPrice(preview.price)
                          : row.product
                            ? formatPrice(row.product.price)
                            : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted">
                      {skipped
                        ? "Omitido (pill tachado)"
                        : row.action === "unmatched_paste" && options.createMissing
                          ? `Se agregará · ${preview?.brand} / ${preview?.category}`
                          : row.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TogglePill({
  children,
  tone,
  active,
  onClick,
  title,
}: {
  children: React.ReactNode;
  tone: "primary" | "success" | "warn" | "sale";
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  const cls =
    tone === "primary"
      ? "bg-primary-soft text-primary-dark"
      : tone === "success"
        ? "bg-success-soft text-success-dark"
        : tone === "warn"
          ? "bg-warning-soft text-warning"
          : "bg-danger-soft text-sale";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-full border-none px-2.5 py-1 font-semibold transition-opacity ${cls} ${
        active ? "" : "opacity-45 line-through"
      }`}
    >
      {children}
    </button>
  );
}

function ActionPill({
  action,
  skipped,
}: {
  action: SupplierMatchRow["action"];
  skipped?: boolean;
}) {
  const map: Record<
    SupplierMatchRow["action"],
    { label: string; className: string }
  > = {
    update_cost: {
      label: "Actualizar",
      className: "bg-primary-soft text-primary-dark",
    },
    activate: {
      label: "Activar",
      className: "bg-success-soft text-success-dark",
    },
    unchanged: {
      label: "OK",
      className: "bg-accent-soft text-muted",
    },
    deactivate: {
      label: "Inactivar",
      className: "bg-warning-soft text-warning",
    },
    unmatched_paste: {
      label: "Agregar",
      className: "bg-danger-soft text-sale",
    },
  };
  const item = map[action];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${item.className} ${skipped ? "opacity-50" : ""}`}
    >
      {skipped && action !== "unchanged" ? "Omitido" : item.label}
    </span>
  );
}
