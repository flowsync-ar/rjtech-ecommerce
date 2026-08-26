"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  mapProduct,
  toProductInsert,
  type ProductRow,
} from "@/lib/supabase/mappers";
import type { CategoryId, Product } from "@/lib/products";

export type ProductInput = Omit<Product, "id" | "rating" | "reviews"> & {
  rating?: number;
  reviews?: number;
};

type CatalogState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: number, input: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProduct: (id: number) => Product | undefined;
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  hydrated: false,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rjtech_products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      set({ loading: false, error: error.message, hydrated: true });
      return;
    }

    set({
      products: ((data ?? []) as ProductRow[]).map(mapProduct),
      loading: false,
      hydrated: true,
      error: null,
    });
  },
  addProduct: async (input) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rjtech_products")
      .insert(toProductInsert(input))
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear el producto");
    }

    const product = mapProduct(data as ProductRow);
    set((s) => ({ products: [...s.products, product] }));
    return product;
  },
  updateProduct: async (id, input) => {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.name != null) patch.name = input.name;
    if (input.brand != null) patch.brand = input.brand;
    if (input.category != null) patch.category = input.category;
    if (input.price != null) patch.price = input.price;
    if (input.oldPrice !== undefined) patch.old_price = input.oldPrice;
    if (input.stock != null) patch.stock = input.stock;
    if (input.rating != null) patch.rating = input.rating;
    if (input.reviews != null) patch.reviews = input.reviews;
    if (input.installments != null) patch.installments = input.installments;
    if (input.description != null) patch.description = input.description;
    if (input.tags != null) patch.tags = input.tags;
    if (input.imageUrl !== undefined) patch.image_url = input.imageUrl;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("rjtech_products")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo actualizar el producto");
    }

    const product = mapProduct(data as ProductRow);
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? product : p)),
    }));
  },
  deleteProduct: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("rjtech_products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },
  getProduct: (id) => get().products.find((p) => p.id === id),
}));

export type { CategoryId, Product };
