"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { CHECKOUT_LOGIN_NEXT } from "@/lib/auth-redirect";
import { useAuthStore } from "@/store/auth-store";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-soft focus:border-primary";

type Props = {
  onSuccess: () => void;
  onCancel?: () => void;
};

/** Login / registro embebido en el paso 3 del checkout. */
export function CheckoutLoginForm({ onSuccess, onCancel }: Props) {
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "login"
          ? await login(email, password)
          : await register(name, email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess();
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle(CHECKOUT_LOGIN_NEXT);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión con Google.",
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-primary-softer/40 p-4 md:p-5">
      <div className="mb-3 text-sm font-bold text-foreground">
        Iniciá sesión para confirmar
      </div>
      <p className="mb-4 text-[13px] text-muted">
        Tus datos de envío y pago ya están guardados. Entrá o creá una cuenta
        para finalizar la compra.
      </p>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-accent-soft p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`cursor-pointer rounded-md py-2 text-[13px] font-semibold ${
            mode === "login"
              ? "bg-surface text-foreground shadow-sm"
              : "bg-transparent text-muted"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={`cursor-pointer rounded-md py-2 text-[13px] font-semibold ${
            mode === "register"
              ? "bg-surface text-foreground shadow-sm"
              : "bg-transparent text-muted"
          }`}
        >
          Registrarme
        </button>
      </div>

      <button
        type="button"
        onClick={onGoogle}
        disabled={googleLoading || busy}
        className="mb-4 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[9px] border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-foreground hover:bg-accent-soft disabled:opacity-70"
      >
        <GoogleGlyph />
        {googleLoading ? "Conectando…" : "Continuar con Google"}
      </button>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium text-muted-soft">
          o con email
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {mode === "register" && (
          <input
            type="text"
            placeholder="Nombre completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={inputClass}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={inputClass}
          required
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder={
            mode === "register" ? "Contraseña (mín. 6 caracteres)" : "Contraseña"
          }
          autoComplete={
            mode === "register" ? "new-password" : "current-password"
          }
          required
          minLength={mode === "register" ? 6 : undefined}
        />

        {error && (
          <div className="rounded-lg bg-danger-soft px-3 py-2 text-[12.5px] font-medium text-sale">
            {error}
          </div>
        )}

        <div className="mt-1 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy || googleLoading}
            className="cursor-pointer rounded-[9px] border-none bg-primary px-5 py-3 text-[14px] font-bold !text-white disabled:opacity-60"
          >
            {busy
              ? "Entrando…"
              : mode === "login"
                ? "Entrar y confirmar"
                : "Crear cuenta y confirmar"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="cursor-pointer rounded-[9px] border border-border bg-transparent px-5 py-3 text-[14px] font-semibold"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
