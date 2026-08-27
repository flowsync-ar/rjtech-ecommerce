import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contacto — RJ Tech",
  description:
    "Escribinos: consultas, stock, envíos o asesoramiento. RJ Tech, Santa Rosa, La Pampa.",
};

export default function ContactoPage() {
  return (
    <div className="py-10 md:py-14">
      <div className="mb-8 max-w-[40rem]">
        <p className="mb-3 text-[13px] font-bold tracking-wider text-primary uppercase">
          Contacto
        </p>
        <h1 className="mb-3 text-[32px] leading-tight font-bold tracking-tight md:text-[40px]">
          Hablemos.
        </h1>
        <p className="text-[15px] leading-relaxed text-muted md:text-base">
          Consultas de stock, envíos o qué equipo te conviene. El mensaje llega
          directo a nuestro mail y te respondemos a la brevedad.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-start md:gap-14">
        <div className="space-y-5 text-[14.5px] leading-relaxed text-body-text">
          <p>
            Completá el formulario y te llega un mail a{" "}
            <span className="font-semibold text-foreground">
              rjtech.lp@gmail.com
            </span>
            . Si preferís chat, también estamos por WhatsApp.
          </p>
          <div className="rounded-xl border border-border bg-surface px-5 py-4">
            <div className="mb-1 text-[11px] font-bold tracking-wider text-muted uppercase">
              Base
            </div>
            <div className="font-semibold text-foreground">
              Santa Rosa, La Pampa
            </div>
            <div className="mt-1 text-[13px] text-muted">Envíos a todo el país</div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
