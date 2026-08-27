"use client";

import { useCallback, useMemo, useState } from "react";
import { AdminFormModal } from "@/components/admin/AdminFormModal";
import { useDialog } from "@/components/DialogProvider";
import { ImageUploader } from "@/components/ImageUploader";
import { useBrandsStore, type Brand } from "@/store/brands-store";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";

export default function AdminMarcasPage() {
  const { confirm, notice } = useDialog();
  const brands = useBrandsStore((s) => s.brands);
  const addBrand = useBrandsStore((s) => s.addBrand);
  const updateBrand = useBrandsStore((s) => s.updateBrand);
  const deleteBrand = useBrandsStore((s) => s.deleteBrand);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, query]);

  const closeForm = useCallback(() => {
    setOpen(false);
    setEditing(null);
    setName("");
    setLogoUrl(null);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setLogoUrl(null);
    setActive(true);
    setOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setName(b.name);
    setLogoUrl(b.logoUrl);
    setActive(b.active);
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateBrand(editing.id, {
          name: name.trim(),
          active,
          logoUrl,
        });
      } else {
        await addBrand({ name: name.trim(), logoUrl });
      }
      closeForm();
    } catch (err) {
      void notice({
        title: "No se pudo guardar",
        message: err instanceof Error ? err.message : "Error al guardar",
      });
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marcas</h1>
          <p className="text-sm text-muted">{brands.length} marcas</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer rounded-[9px] border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
        >
          + Nueva marca
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar marca…"
        className={`${inputClass} mb-5 max-w-md`}
      />

      <AdminFormModal
        open={open}
        title={editing ? "Editar marca" : "Nueva marca"}
        onClose={closeForm}
        onSubmit={onSave}
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <input
              className={inputClass}
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {editing && (
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Activa
              </label>
            )}
          </div>
          <ImageUploader
            value={logoUrl}
            onChange={setLogoUrl}
            folder="brands"
            label="Logo de la marca"
            fit="contain"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="cursor-pointer rounded-lg border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={closeForm}
            className="cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-semibold"
          >
            Cancelar
          </button>
        </div>
      </AdminFormModal>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="hidden grid-cols-[64px_1fr_100px_140px] gap-3 bg-primary-softer px-4 py-3 text-xs font-bold text-muted uppercase md:grid">
          <div>Logo</div>
          <div>Marca</div>
          <div>Estado</div>
          <div className="text-right">Acciones</div>
        </div>
        {filtered.map((b) => (
          <div
            key={b.id}
            className="grid grid-cols-1 gap-2 border-t border-border-soft px-4 py-3 text-sm md:grid-cols-[64px_1fr_100px_140px] md:items-center md:gap-3"
          >
            <div className="flex items-center">
              {b.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logoUrl}
                  alt=""
                  className="h-12 w-12 rounded-lg border border-border-soft bg-white object-contain p-1"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border text-[11px] font-bold text-muted-soft">
                  —
                </div>
              )}
            </div>
            <div className="font-semibold">{b.name}</div>
            <div className={b.active ? "text-success" : "text-sale"}>
              {b.active ? "Activa" : "Inactiva"}
            </div>
            <div className="flex gap-1.5 md:justify-end">
              <button
                type="button"
                onClick={() => openEdit(b)}
                aria-label={`Editar ${b.name}`}
                title="Editar"
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-accent-soft"
              >
                <EditIcon />
              </button>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    const ok = await confirm({
                      title: "Eliminar marca",
                      message: `¿Eliminar “${b.name}”?`,
                      confirmLabel: "Eliminar",
                      tone: "danger",
                    });
                    if (!ok) return;
                    try {
                      await deleteBrand(b.id);
                    } catch (err) {
                      void notice({
                        title: "No se pudo eliminar",
                        message:
                          err instanceof Error ? err.message : "Error",
                      });
                    }
                  })();
                }}
                aria-label={`Eliminar ${b.name}`}
                title="Eliminar"
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-sale hover:bg-danger-soft"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="border-t border-border-soft px-4 py-8 text-center text-sm text-muted">
            No hay marcas todavía.
          </div>
        )}
      </div>
    </div>
  );
}

function iconProps() {
  return {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

function EditIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}
