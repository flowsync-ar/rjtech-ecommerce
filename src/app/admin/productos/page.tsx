"use client";

import { useMemo, useState } from "react";
import { ComboSelect } from "@/components/ComboSelect";
import { ImageUploader } from "@/components/ImageUploader";
import { MoneyInput } from "@/components/MoneyInput";
import { ProductImage } from "@/components/ProductImage";
import { useCurrency } from "@/hooks/useCurrency";
import {
  categoryLabels,
  parseTags,
  type CategoryId,
  type Product,
} from "@/lib/products";
import { useCatalogStore } from "@/store/catalog-store";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";

const CATEGORY_OPTIONS = (
  Object.entries(categoryLabels) as [CategoryId, string][]
).map(([value, label]) => ({ value, label }));

const INSTALLMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "Hasta 3 cuotas sin interés", label: "Hasta 3 cuotas sin interés" },
  { value: "Hasta 6 cuotas sin interés", label: "Hasta 6 cuotas sin interés" },
  { value: "Hasta 12 cuotas sin interés", label: "Hasta 12 cuotas sin interés" },
  { value: "Precio de contado", label: "Precio de contado" },
];

const emptyForm = {
  name: "",
  brand: "",
  category: "celulares" as CategoryId,
  price: null as number | null,
  oldPrice: null as number | null,
  stock: "",
  installments: "Hasta 6 cuotas sin interés",
  description: "",
  tags: "",
  imageUrl: null as string | null,
};

export default function AdminProductosPage() {
  const { currency, formatPrice } = useCurrency();
  const products = useCatalogStore((s) => s.products);
  const addProduct = useCatalogStore((s) => s.addProduct);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const tags = (p.tags ?? []).join(" ").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        categoryLabels[p.category].toLowerCase().includes(q) ||
        tags.includes(q)
      );
    });
  }, [products, query]);

  const installmentOptions = useMemo(() => {
    const base = INSTALLMENT_OPTIONS.map((o) => ({ ...o }));
    if (
      form.installments &&
      !base.some((o) => o.value === form.installments)
    ) {
      base.unshift({
        value: form.installments,
        label: form.installments,
      });
    }
    return base;
  }, [form.installments]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      stock: String(p.stock),
      installments: p.installments,
      description: p.description,
      tags: (p.tags ?? []).join(", "),
      imageUrl: p.imageUrl,
    });
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price: form.price ?? 0,
      oldPrice: form.oldPrice,
      stock: Number(form.stock) || 0,
      installments: form.installments.trim(),
      description: form.description.trim(),
      tags: parseTags(form.tags),
      imageUrl: form.imageUrl,
    };

    try {
      if (editing) await updateProduct(editing.id, payload);
      else await addProduct(payload);
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted">
            {products.length} productos en el catálogo
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer rounded-[9px] border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
        >
          + Nuevo producto
        </button>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre, marca, tags..."
        className={`${inputClass} mb-5 max-w-md`}
      />

      {open && (
        <form
          onSubmit={onSave}
          className="mb-6 rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-4 text-sm font-bold">
            {editing ? `Editar #${editing.id}` : "Nuevo producto"}
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className={inputClass}
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className={inputClass}
              placeholder="Marca"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
            />
            <ComboSelect
              value={form.category}
              options={CATEGORY_OPTIONS}
              onChange={(category) => setForm({ ...form, category })}
              placeholder="Categoría"
              searchPlaceholder="Buscar categoría…"
              searchable
              fullWidth
            />
            <input
              className={inputClass}
              placeholder="Stock"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
            <MoneyInput
              className={inputClass}
              placeholder="Precio"
              currency={currency}
              value={form.price}
              onChange={(price) => setForm({ ...form, price })}
              required
            />
            <MoneyInput
              className={inputClass}
              placeholder="Precio anterior (opcional)"
              currency={currency}
              value={form.oldPrice}
              onChange={(oldPrice) => setForm({ ...form, oldPrice })}
              allowEmpty
            />
            <div className="md:col-span-2">
              <ComboSelect
                value={form.installments}
                options={installmentOptions}
                onChange={(installments) => setForm({ ...form, installments })}
                placeholder="Cuotas / financiamiento"
                searchPlaceholder="Buscar opción de cuotas…"
                searchable
                fullWidth
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploader
                value={form.imageUrl}
                onChange={(imageUrl) => setForm({ ...form, imageUrl })}
                folder="products"
              />
            </div>
            <input
              className={`${inputClass} md:col-span-2`}
              placeholder="Tags (separados por coma): ej. gaming, 5g, oferta"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <textarea
              className={`${inputClass} min-h-[90px] md:col-span-2`}
              placeholder="Descripción"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
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

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="hidden grid-cols-[72px_1fr_120px_110px_90px_140px] gap-3 bg-primary-softer px-4 py-3 text-xs font-bold text-muted uppercase md:grid">
          <div />
          <div>Producto</div>
          <div>Categoría</div>
          <div>Precio</div>
          <div>Stock</div>
          <div className="text-right">Acciones</div>
        </div>
        {filtered.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-1 gap-2 border-t border-border-soft px-4 py-3 text-sm md:grid-cols-[72px_1fr_120px_110px_90px_140px] md:items-center md:gap-3"
          >
            <ProductImage
              product={p}
              className="h-14 w-14 rounded-lg"
              sizes="56px"
            />
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-[12.5px] text-muted">{p.brand}</div>
              {(p.tags ?? []).length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-muted">{categoryLabels[p.category]}</div>
            <div className="font-semibold">{formatPrice(p.price)}</div>
            <div className={p.stock === 0 ? "font-semibold text-sale" : ""}>
              {p.stock}
            </div>
            <div className="flex gap-2 md:justify-end">
              <button
                type="button"
                onClick={() => openEdit(p)}
                className="cursor-pointer rounded-md border border-border px-2.5 py-1.5 text-[12.5px] font-semibold"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar ${p.name}?`)) {
                    void deleteProduct(p.id).catch((err) =>
                      alert(err instanceof Error ? err.message : "Error"),
                    );
                  }
                }}
                className="cursor-pointer rounded-md border-none bg-transparent px-2.5 py-1.5 text-[12.5px] font-semibold text-sale"
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
