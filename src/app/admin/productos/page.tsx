"use client";

import { useMemo, useState } from "react";
import { BulkProductImport } from "@/components/admin/BulkProductImport";
import { ProductImageAssign } from "@/components/admin/ProductImageAssign";
import { ComboSelect } from "@/components/ComboSelect";
import { MultiImageUploader } from "@/components/MultiImageUploader";
import { MoneyInput } from "@/components/MoneyInput";
import { ProductImage } from "@/components/ProductImage";
import { useCurrency } from "@/hooks/useCurrency";
import { useDialog } from "@/components/DialogProvider";
import {
  categoryLabels,
  parseTags,
  type CategoryId,
  type Product,
} from "@/lib/products";
import { useCatalogStore } from "@/store/catalog-store";
import { useBrandsStore } from "@/store/brands-store";
import { useCategoriesStore } from "@/store/categories-store";
import { useProvidersStore } from "@/store/providers-store";
import { useStoreConfig } from "@/store/store-config";
import {
  currencyPrefix,
  normalizeCurrency,
  type CurrencyCode,
} from "@/lib/format";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";

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
  subcategory: "",
  provider: "",
  costPrice: null as number | null,
  price: null as number | null,
  stock: "",
  installments: "Hasta 6 cuotas sin interés",
  description: "",
  tags: "",
  imageUrl: null as string | null,
  imageUrls: [] as string[],
  active: true,
  featured: false,
};

type Panel = "none" | "form" | "bulk" | "images";

export default function AdminProductosPage() {
  const { currency: storeCurrency, formatPrice } = useCurrency();
  const updateConfig = useStoreConfig((s) => s.updateConfig);
  const { confirm, notice } = useDialog();
  const products = useCatalogStore((s) => s.products);
  const addProduct = useCatalogStore((s) => s.addProduct);
  const updateProduct = useCatalogStore((s) => s.updateProduct);
  const updateProducts = useCatalogStore((s) => s.updateProducts);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const deleteProducts = useCatalogStore((s) => s.deleteProducts);
  const brands = useBrandsStore((s) => s.brands);
  const ensureBrand = useBrandsStore((s) => s.ensureBrand);
  const categories = useCategoriesStore((s) => s.categories);
  const providers = useProvidersStore((s) => s.providers);
  const ensureProvider = useProvidersStore((s) => s.ensureProvider);

  const [priceCurrency, setPriceCurrency] = useState<CurrencyCode>(storeCurrency);
  const prefix = currencyPrefix(priceCurrency);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [panel, setPanel] = useState<Panel>("none");
  const [imageQueueIds, setImageQueueIds] = useState<number[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<CategoryId | "">("");
  const [bulkBrand, setBulkBrand] = useState("");

  const missingImages = useMemo(
    () => products.filter((p) => !p.imageUrl).map((p) => p.id),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const tags = (p.tags ?? []).join(" ").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        categoryLabels[p.category]?.toLowerCase().includes(q) ||
        categories.some(
          (c) =>
            c.id === p.category && c.name.toLowerCase().includes(q),
        ) ||
        tags.includes(q)
      );
    });
  }, [products, query, categories]);

  const filteredIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  const selectedCount = selected.size;
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id));
  const someFilteredSelected =
    filteredIds.some((id) => selected.has(id)) && !allFilteredSelected;

  const brandOptions = useMemo(() => {
    const fromStore = brands
      .filter((b) => b.active)
      .map((b) => ({ value: b.name, label: b.name }));
    // incluir marca actual del form si no está
    if (
      form.brand &&
      !fromStore.some(
        (o) => o.value.toLowerCase() === form.brand.toLowerCase(),
      )
    ) {
      fromStore.unshift({ value: form.brand, label: form.brand });
    }
    return fromStore;
  }, [brands, form.brand]);

  const categoryOptions = useMemo(() => {
    const fromStore = categories
      .filter((c) => c.active)
      .map((c) => ({ value: c.id, label: c.name }));
    if (
      form.category &&
      !fromStore.some((o) => o.value === form.category)
    ) {
      fromStore.unshift({
        value: form.category,
        label: categoryLabels[form.category] ?? form.category,
      });
    }
    return fromStore.length
      ? fromStore
      : (Object.entries(categoryLabels) as [string, string][]).map(
          ([value, label]) => ({ value, label }),
        );
  }, [categories, form.category]);

  const categoryLabel = (id: string) =>
    categories.find((c) => c.id === id)?.name ??
    categoryLabels[id] ??
    id;

  const providerOptions = useMemo(() => {
    const fromStore = providers.map((p) => ({
      value: p.name,
      label: p.name,
    }));
    if (
      form.provider &&
      !fromStore.some(
        (o) => o.value.toLowerCase() === form.provider.toLowerCase(),
      )
    ) {
      fromStore.unshift({ value: form.provider, label: form.provider });
    }
    return fromStore;
  }, [providers, form.provider]);

  const onPriceCurrencyChange = (next: CurrencyCode) => {
    setPriceCurrency(next);
    void updateConfig({ currency: next });
  };

  const bulkCategoryOptions = useMemo(
    () => [
      { value: "", label: "Elegir…" },
      ...categories
        .filter((c) => c.active)
        .map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        for (const id of filteredIds) next.delete(id);
      } else {
        for (const id of filteredIds) next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const selectedIds = () => [...selected];

  const runBulk = async (fn: () => Promise<void>) => {
    setBulkBusy(true);
    try {
      await fn();
      clearSelection();
      setBulkCategory("");
      setBulkBrand("");
    } catch (err) {
      void notice({
        title: "No se pudo completar",
        message: err instanceof Error ? err.message : "Error en acción masiva",
      });
    } finally {
      setBulkBusy(false);
    }
  };
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
    setPriceCurrency(normalizeCurrency(storeCurrency));
    setPanel("form");
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setPriceCurrency(normalizeCurrency(storeCurrency));
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category,
      subcategory: p.subcategory ?? "",
      provider: p.provider ?? "",
      costPrice: p.costPrice,
      price: p.price,
      stock: String(p.stock),
      installments: p.installments,
      description: p.description,
      tags: (p.tags ?? []).join(", "),
      imageUrl: p.imageUrl,
      imageUrls: p.imageUrls?.length
        ? p.imageUrls
        : p.imageUrl
          ? [p.imageUrl]
          : [],
      active: p.active,
      featured: p.featured,
    });
    setPanel("form");
  };

  const openBulk = () => {
    setEditing(null);
    setPanel("bulk");
  };

  const openImages = (ids: number[]) => {
    setImageQueueIds(ids);
    setPanel("images");
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const brandName = form.brand.trim();
    const providerName = form.provider.trim();
    const payload = {
      name: form.name.trim(),
      brand: brandName,
      category: form.category,
      subcategory: form.subcategory.trim(),
      provider: providerName,
      costPrice: form.costPrice,
      price: form.price ?? 0,
      oldPrice: null,
      stock: Number(form.stock) || 0,
      installments: form.installments.trim(),
      description: form.description.trim(),
      tags: parseTags(form.tags),
      imageUrl: form.imageUrls[0] ?? null,
      imageUrls: form.imageUrls,
      active: form.active,
      featured: form.featured,
    };

    try {
      if (!brandName) {
        void notice({
          title: "Marca requerida",
          message: "Elegí o agregá una marca para el producto.",
        });
        return;
      }
      await ensureBrand(brandName);
      if (providerName) await ensureProvider(providerName);
      if (editing) await updateProduct(editing.id, payload);
      else await addProduct(payload);
      setPanel("none");
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
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted">
            {products.length} productos en el catálogo
            {missingImages.length > 0
              ? ` · ${missingImages.length} sin imagen`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {missingImages.length > 0 && (
            <button
              type="button"
              onClick={() => openImages(missingImages)}
              className="cursor-pointer rounded-[9px] border border-border bg-surface px-4 py-2.5 text-sm font-semibold"
            >
              Asignar imágenes ({missingImages.length})
            </button>
          )}
          <button
            type="button"
            onClick={openBulk}
            className="cursor-pointer rounded-[9px] border border-border bg-surface px-4 py-2.5 text-sm font-semibold"
          >
            Carga masiva
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="cursor-pointer rounded-[9px] border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
          >
            + Nuevo producto
          </button>
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre, marca, tags..."
        className={`${inputClass} mb-5 max-w-md`}
      />

      {panel === "bulk" && (
        <BulkProductImport
          onClose={() => setPanel("none")}
          onImported={(created) => {
            openImages(created.map((p) => p.id));
          }}
        />
      )}

      {panel === "images" && (
        <ProductImageAssign
          productIds={imageQueueIds}
          onClose={() => setPanel("none")}
        />
      )}

      {panel === "form" && (
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
            <ComboSelect
              value={form.brand}
              options={brandOptions}
              onChange={(brand) => setForm({ ...form, brand })}
              placeholder="Marca"
              searchPlaceholder="Buscar o agregar marca…"
              searchable
              creatable
              createLabel={(q) => `Agregar marca “${q}”`}
              fullWidth
            />
            <ComboSelect
              value={form.category}
              options={categoryOptions}
              onChange={(category) => setForm({ ...form, category })}
              placeholder="Categoría"
              searchPlaceholder="Buscar categoría…"
              searchable
              fullWidth
            />
            <input
              className={inputClass}
              placeholder="Subcategoría"
              value={form.subcategory}
              onChange={(e) =>
                setForm({ ...form, subcategory: e.target.value })
              }
            />
            <ComboSelect
              value={form.provider}
              options={providerOptions}
              onChange={(provider) => setForm({ ...form, provider })}
              placeholder="Proveedor"
              searchPlaceholder="Buscar o agregar proveedor…"
              searchable
              creatable
              createLabel={(q) => `Agregar proveedor “${q}”`}
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
              placeholder={`Precio costo (${prefix})`}
              currency={priceCurrency}
              currencyEditable
              onCurrencyChange={onPriceCurrencyChange}
              value={form.costPrice}
              onChange={(costPrice) => setForm({ ...form, costPrice })}
              allowEmpty
            />
            <MoneyInput
              className={inputClass}
              placeholder={`Precio venta (${prefix})`}
              currency={priceCurrency}
              value={form.price}
              onChange={(price) => setForm({ ...form, price })}
              required
            />
            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
                Activo
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                Destacado
              </label>
            </div>
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
              <MultiImageUploader
                value={form.imageUrls}
                onChange={(imageUrls) =>
                  setForm({
                    ...form,
                    imageUrls,
                    imageUrl: imageUrls[0] ?? null,
                  })
                }
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
              onClick={() => setPanel("none")}
              className="cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {selectedCount > 0 && (
          <div className="flex flex-col gap-3 border-b border-border bg-primary-softer/60 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">
                {selectedCount} seleccionado{selectedCount === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                disabled={bulkBusy}
                onClick={clearSelection}
                className="cursor-pointer rounded-md border-none bg-transparent px-2 py-1 text-[12.5px] font-semibold text-muted"
              >
                Limpiar
              </button>
              <div className="flex-1" />
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() =>
                  void runBulk(async () => {
                    await updateProducts(selectedIds(), { active: true });
                  })
                }
                className="cursor-pointer rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px] font-semibold disabled:opacity-50"
              >
                Activar
              </button>
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() =>
                  void runBulk(async () => {
                    await updateProducts(selectedIds(), { active: false });
                  })
                }
                className="cursor-pointer rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px] font-semibold disabled:opacity-50"
              >
                Desactivar
              </button>
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() =>
                  void runBulk(async () => {
                    await updateProducts(selectedIds(), { featured: true });
                  })
                }
                className="cursor-pointer rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12.5px] font-semibold disabled:opacity-50"
              >
                Destacar
              </button>
              <button
                type="button"
                disabled={bulkBusy}
                onClick={() => {
                  void (async () => {
                    const ok = await confirm({
                      title: "Eliminar productos",
                      message: `¿Eliminar ${selectedCount} producto${selectedCount === 1 ? "" : "s"}? Esta acción no se puede deshacer.`,
                      confirmLabel: "Eliminar",
                      tone: "danger",
                    });
                    if (!ok) return;
                    await runBulk(async () => {
                      await deleteProducts(selectedIds());
                    });
                  })();
                }}
                className="cursor-pointer rounded-md border-none bg-transparent px-2.5 py-1.5 text-[12.5px] font-semibold text-sale disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="min-w-[180px] flex-1">
                <div className="mb-1 text-[11px] font-semibold text-muted uppercase">
                  Cambiar categoría
                </div>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <ComboSelect
                      value={bulkCategory}
                      options={bulkCategoryOptions}
                      onChange={(v) => setBulkCategory(v as CategoryId | "")}
                      placeholder="Categoría"
                      searchable
                      fullWidth
                    />
                  </div>
                  <button
                    type="button"
                    disabled={bulkBusy || !bulkCategory}
                    onClick={() =>
                      void runBulk(async () => {
                        if (!bulkCategory) return;
                        await updateProducts(selectedIds(), {
                          category: bulkCategory,
                        });
                      })
                    }
                    className="cursor-pointer rounded-lg border-none bg-primary px-3 py-2 text-[12.5px] font-bold !text-white disabled:opacity-50"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <div className="min-w-[180px] flex-1">
                <div className="mb-1 text-[11px] font-semibold text-muted uppercase">
                  Cambiar marca
                </div>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <ComboSelect
                      value={bulkBrand}
                      options={[
                        { value: "", label: "Elegir…" },
                        ...brandOptions,
                      ]}
                      onChange={setBulkBrand}
                      placeholder="Marca"
                      searchPlaceholder="Buscar o agregar…"
                      searchable
                      creatable
                      createLabel={(q) => `Usar “${q}”`}
                      fullWidth
                    />
                  </div>
                  <button
                    type="button"
                    disabled={bulkBusy || !bulkBrand.trim()}
                    onClick={() =>
                      void runBulk(async () => {
                        const brand = bulkBrand.trim();
                        if (!brand) return;
                        await ensureBrand(brand);
                        await updateProducts(selectedIds(), { brand });
                      })
                    }
                    className="cursor-pointer rounded-lg border-none bg-primary px-3 py-2 text-[12.5px] font-bold !text-white disabled:opacity-50"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="hidden grid-cols-[40px_72px_1fr_120px_110px_90px_140px] gap-3 bg-primary-softer px-4 py-3 text-xs font-bold text-muted uppercase md:grid">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              ref={(el) => {
                if (el) el.indeterminate = someFilteredSelected;
              }}
              onChange={toggleAllFiltered}
              aria-label="Seleccionar todo"
              className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
            />
          </div>
          <div />
          <div>Producto</div>
          <div>Categoría</div>
          <div>Precio</div>
          <div>Stock</div>
          <div className="text-right">Acciones</div>
        </div>
        {filtered.map((p) => {
          const isSelected = selected.has(p.id);
          return (
            <div
              key={p.id}
              className={`grid grid-cols-1 gap-2 border-t border-border-soft px-4 py-3 text-sm md:grid-cols-[40px_72px_1fr_120px_110px_90px_140px] md:items-center md:gap-3 ${
                isSelected ? "bg-primary-softer/40" : ""
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleOne(p.id)}
                  aria-label={`Seleccionar ${p.name}`}
                  className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                />
              </div>
              <ProductImage
                product={p}
                className="h-14 w-14 rounded-lg"
                sizes="56px"
              />
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-[12.5px] text-muted">{p.brand}</div>
                {!p.imageUrl && (
                  <div className="mt-1 text-[11.5px] font-semibold text-sale">
                    Sin imagen
                  </div>
                )}
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
              <div className="text-muted">{categoryLabel(p.category)}</div>
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
                    void (async () => {
                      const ok = await confirm({
                        title: "Eliminar producto",
                        message: `¿Eliminar “${p.name}”? Esta acción no se puede deshacer.`,
                        confirmLabel: "Eliminar",
                        tone: "danger",
                      });
                      if (!ok) return;
                      try {
                        await deleteProduct(p.id);
                        setSelected((prev) => {
                          const next = new Set(prev);
                          next.delete(p.id);
                          return next;
                        });
                      } catch (err) {
                        void notice({
                          title: "No se pudo eliminar",
                          message:
                            err instanceof Error ? err.message : "Error",
                        });
                      }
                    })();
                  }}
                  className="cursor-pointer rounded-md border-none bg-transparent px-2.5 py-1.5 text-[12.5px] font-semibold text-sale"
                >
                  Borrar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
