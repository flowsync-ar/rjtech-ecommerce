"use client";

import { useMemo, useState } from "react";
import { useDialog } from "@/components/DialogProvider";
import {
  useProvidersStore,
  type Provider,
} from "@/store/providers-store";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";

const emptyForm = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export default function AdminProveedoresPage() {
  const { confirm, notice } = useDialog();
  const providers = useProvidersStore((s) => s.providers);
  const addProvider = useProvidersStore((s) => s.addProvider);
  const updateProvider = useProvidersStore((s) => s.updateProvider);
  const deleteProvider = useProvidersStore((s) => s.deleteProvider);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Provider | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return providers;
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.contact.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q),
    );
  }, [providers, query]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Provider) => {
    setEditing(p);
    setForm({
      name: p.name,
      contact: p.contact,
      email: p.email,
      phone: p.phone,
      address: p.address,
      notes: p.notes,
    });
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      contact: form.contact.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
    };
    try {
      if (editing) await updateProvider(editing.id, payload);
      else await addProvider(payload);
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
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
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-sm text-muted">
            {providers.length} proveedores registrados
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer rounded-[9px] border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
        >
          + Nuevo proveedor
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar proveedor..."
        className={`${inputClass} mb-5 max-w-md`}
      />

      {open && (
        <form
          onSubmit={onSave}
          className="mb-6 rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-4 text-sm font-bold">
            {editing ? "Editar proveedor" : "Nuevo proveedor"}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Nombre comercial"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className={inputClass}
              placeholder="Contacto"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              required
            />
            <input
              className={inputClass}
              placeholder="Email (opcional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className={`${inputClass} md:col-span-2`}
              placeholder="Dirección"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <textarea
              className={`${inputClass} min-h-[80px] md:col-span-2`}
              placeholder="Notas"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="mb-3 text-base font-bold">{p.name}</div>
            <div className="space-y-1 text-sm text-muted">
              <div>
                <span className="font-medium text-foreground">Contacto:</span>{" "}
                {p.contact}
              </div>
              {p.email && <div>{p.email}</div>}
              {p.phone && <div>{p.phone}</div>}
              {p.address && (
                <div>
                  <span className="font-medium text-foreground">Dirección:</span>{" "}
                  {p.address}
                </div>
              )}
              {p.notes && <div className="pt-1 text-[13px]">{p.notes}</div>}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(p)}
                className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-[12.5px] font-semibold"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    const ok = await confirm({
                      title: "Eliminar proveedor",
                      message: `¿Eliminar “${p.name}”? Esta acción no se puede deshacer.`,
                      confirmLabel: "Eliminar",
                      tone: "danger",
                    });
                    if (!ok) return;
                    try {
                      await deleteProvider(p.id);
                    } catch (err) {
                      void notice({
                        title: "No se pudo eliminar",
                        message:
                          err instanceof Error ? err.message : "Error",
                      });
                    }
                  })();
                }}
                className="cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-[12.5px] font-semibold text-sale"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
