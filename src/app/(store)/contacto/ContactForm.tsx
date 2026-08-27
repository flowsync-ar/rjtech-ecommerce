"use client";

import { useState } from "react";
import { useDialog } from "@/components/DialogProvider";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-soft focus:border-primary";

export function ContactForm() {
  const { notice } = useDialog();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        sent?: boolean;
        hint?: string;
        needsActivation?: boolean;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo enviar el mensaje");
      }

      await notice({
        title: data.needsActivation
          ? "Activá el formulario (1 sola vez)"
          : "Mensaje enviado",
        message:
          data.hint ||
          "Te vamos a responder a la brevedad. ¡Gracias!",
      });
      if (!data.needsActivation) {
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch (err) {
      await notice({
        title: "No se pudo enviar",
        message: err instanceof Error ? err.message : "Probá de nuevo en un momento.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-surface p-5 md:p-6"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Nombre
          </label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            autoComplete="name"
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Email
          </label>
          <input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Asunto
          </label>
          <input
            className={inputClass}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ej. Consulta por iPhone 17"
            required
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Mensaje
          </label>
          <textarea
            className={`${inputClass} min-h-[140px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Contanos qué necesitás…"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-4 cursor-pointer rounded-[9px] border-none bg-primary px-5 py-3 text-sm font-bold !text-white disabled:opacity-60"
      >
        {busy ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
