"use client";

import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { isRjtechAdmin } from "@/lib/auth-helpers";
import { onAuthSessionChange, useAuthStore } from "@/store/auth-store";
import { useAdminStore } from "@/store/admin-store";
import { useCatalogStore } from "@/store/catalog-store";
import { useStoreConfig } from "@/store/store-config";
import { useAccountProfileStore } from "@/store/account-profile-store";
import { useCartStore } from "@/store/cart-store";

function handleSession(user: User | null) {
  useAdminStore
    .getState()
    .setFromUser(Boolean(user && isRjtechAdmin(user.app_metadata)));
  void useCartStore.getState().syncForUser(user?.id ?? null);
}

/** Hydrates catalog, config, auth, cart and admin from Supabase. */
export function SupabaseBootstrap() {
  const fetchProducts = useCatalogStore((s) => s.fetchProducts);
  const fetchConfig = useStoreConfig((s) => s.fetchConfig);
  const initAuth = useAuthStore((s) => s.init);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAccountProfileStore((s) => s.fetchAll);
  const clearProfile = useAccountProfileStore((s) => s.clear);

  useEffect(() => {
    void fetchProducts();
    void fetchConfig();
    const unsub = onAuthSessionChange(handleSession);
    void initAuth();
    return unsub;
  }, [fetchProducts, fetchConfig, initAuth]);

  useEffect(() => {
    if (user?.id) void fetchProfile(user.id);
    else clearProfile();
  }, [user?.id, fetchProfile, clearProfile]);

  return null;
}
