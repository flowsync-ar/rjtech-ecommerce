"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type Brand = {
  id: string;
  name: string;
  active: boolean;
};

type BrandsState = {
  brands: Brand[];
  loading: boolean;
  hydrated: boolean;
  fetchBrands: () => Promise<void>;
  addBrand: (name: string) => Promise<Brand>;
  updateBrand: (
    id: string,
    input: { name?: string; active?: boolean },
  ) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  ensureBrand: (name: string) => Promise<Brand>;
};

function mapBrand(row: {
  id: string;
  name: string;
  active: boolean | null;
}): Brand {
  return {
    id: row.id,
    name: row.name,
    active: row.active ?? true,
  };
}

export const useBrandsStore = create<BrandsState>((set, get) => ({
  brands: [],
  loading: false,
  hydrated: false,
  fetchBrands: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rjtech_brands")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      set({ loading: false, hydrated: true });
      return;
    }

    set({
      brands: (data ?? []).map(mapBrand),
      loading: false,
      hydrated: true,
    });
  },
  addBrand: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("El nombre de la marca es obligatorio");
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Sesión expirada. Volvé a iniciar sesión en el admin.");
    }

    const { data, error } = await supabase.rpc("rjtech_ensure_brand", {
      p_name: trimmed,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error("Error al crear marca");
    const brand = mapBrand(row);
    set((s) => {
      if (s.brands.some((b) => b.id === brand.id)) {
        return {
          brands: s.brands
            .map((b) => (b.id === brand.id ? brand : b))
            .sort((a, b) => a.name.localeCompare(b.name, "es")),
        };
      }
      return {
        brands: [...s.brands, brand].sort((a, b) =>
          a.name.localeCompare(b.name, "es"),
        ),
      };
    });
    return brand;
  },
  updateBrand: async (id, input) => {
    const supabase = createClient();
    const current = get().brands.find((b) => b.id === id);
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.name != null) patch.name = input.name.trim();
    if (input.active != null) patch.active = input.active;

    const { data, error } = await supabase
      .from("rjtech_brands")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? "Error al actualizar marca");
    }

    // Si renombramos, sincronizar productos que usaban el nombre viejo
    if (input.name != null && current && current.name !== input.name.trim()) {
      await supabase
        .from("rjtech_products")
        .update({
          brand: input.name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("brand", current.name);
    }

    const brand = mapBrand(data);
    set((s) => ({
      brands: s.brands
        .map((b) => (b.id === id ? brand : b))
        .sort((a, b) => a.name.localeCompare(b.name, "es")),
    }));
  },
  deleteBrand: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("rjtech_brands").delete().eq("id", id);
    if (error) throw new Error(error.message);
    set((s) => ({ brands: s.brands.filter((b) => b.id !== id) }));
  },
  ensureBrand: async (name) => {
    const trimmed = name.trim();
    const existing = get().brands.find(
      (b) => b.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) return existing;
    return get().addBrand(trimmed);
  },
}));
