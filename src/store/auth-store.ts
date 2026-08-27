"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mapAuthUser, type AuthUser } from "@/lib/auth-helpers";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
  init: () => Promise<void>;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  loginWithGoogle: (returnTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Called by bootstrap / admin after session changes */
  setUserFromSession: (user: User | null) => void;
};

let authListenerBound = false;
type SessionListener = (user: User | null) => void;
const sessionListeners = new Set<SessionListener>();

export function onAuthSessionChange(listener: SessionListener) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

function notifySession(user: User | null) {
  useAuthStore.setState({
    user: mapAuthUser(user),
    hydrated: true,
  });
  sessionListeners.forEach((fn) => fn(user));
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  hydrated: false,
  setUserFromSession: (user) => {
    notifySession(user);
  },
  init: async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    notifySession(data.user);

    if (!authListenerBound) {
      authListenerBound = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        notifySession(session?.user ?? null);
      });
    }
  },
  login: async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    notifySession(data.user);
    return { ok: true };
  },
  register: async (name, email, password) => {
    const trimmedName = name.trim();
    const normalized = email.trim().toLowerCase();
    if (trimmedName.length < 2) {
      return { ok: false, error: "Ingresá tu nombre completo." };
    }
    if (!normalized.includes("@")) {
      return { ok: false, error: "Ingresá un email válido." };
    }
    if (password.length < 6) {
      return {
        ok: false,
        error: "La contraseña debe tener al menos 6 caracteres.",
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: normalized,
      password,
      options: { data: { name: trimmedName } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.session) {
      return {
        ok: false,
        error:
          "Revisá tu email para confirmar la cuenta, o intentá iniciar sesión.",
      };
    }
    notifySession(data.user);
    return { ok: true };
  },
  loginWithGoogle: async (returnTo) => {
    const supabase = createClient();
    const next =
      returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
        ? returnTo
        : "/cuenta";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/cuenta?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) throw error;
  },
  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    notifySession(null);
  },
}));

export type { AuthUser };
