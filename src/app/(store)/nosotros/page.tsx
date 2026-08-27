import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros — RJ Tech",
  description:
    "Somos RJ Tech, fanáticos de la tecnología en Santa Rosa, La Pampa. Stock real, precios claros y ganas de asesorarte.",
};

export default function NosotrosPage() {
  return (
    <div className="-mx-6 md:-mx-10">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="rj-hero-glow absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_55%),radial-gradient(ellipse_at_85%_10%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_45%),linear-gradient(160deg,var(--background),var(--surface))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto max-w-[1280px] px-6 pt-14 pb-16 md:px-10 md:pt-20 md:pb-24">
          <p className="rj-fade-up mb-4 text-[13px] font-bold tracking-[0.18em] text-primary uppercase">
            RJ Tech · Santa Rosa, La Pampa
          </p>
          <h1 className="rj-fade-up-delay max-w-[18ch] text-[40px] leading-[1.05] font-bold tracking-tight text-foreground md:text-[56px]">
            Tecnología con alma pampeana.
          </h1>
          <p className="rj-fade-up-delay-2 mt-5 max-w-[34rem] text-base leading-relaxed text-muted md:text-lg">
            Nacimos en Santa Rosa con una obsesión sana: que la mejor tech no
            sea un misterio ni una estafa. Somos fanáticos de lo que vendemos —
            y nos encanta que te lleves el equipo correcto.
          </p>
          <div className="rj-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalogo"
              className="rounded-[9px] bg-primary px-6 py-3.5 text-[15px] font-semibold !text-white no-underline hover:bg-primary-dark hover:!no-underline"
            >
              Ver catálogo
            </Link>
            <a
              href="#historia"
              className="rounded-[9px] border border-border bg-surface/80 px-6 py-3.5 text-[15px] font-semibold text-foreground no-underline backdrop-blur hover:!no-underline"
            >
              Nuestra historia
            </a>
          </div>
        </div>
      </section>

      {/* HISTORIA */}
      <section className="mx-auto grid max-w-[1280px] gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-10 md:py-24">
        <div>
          <p
            id="historia"
            className="mb-3 scroll-mt-[120px] text-[13px] font-bold tracking-wider text-primary uppercase md:scroll-mt-[136px]"
          >
            Quiénes somos
          </p>
          <h2 className="mb-5 text-[28px] leading-tight font-bold tracking-tight md:text-[34px]">
            Un equipo chico, con ganas enormes de laburar la tecnología bien.
          </h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-body-text">
            <p>
              RJ Tech no salió de una oficina de vidrio en Capital. Salimos de
              acá: de Santa Rosa, La Pampa, donde si algo se rompe o no llega,
              se nota. Por eso armamos un ecommerce con precios
              claros y cero chamuyo barato.
            </p>
            <p>
              Somos fanáticos de la tecnología de verdad: de probar, comparar,
              pelear por el mejor precio y explicarte en criollo por qué ese
              celular, notebook o tele es el que te conviene. Si no lo
              usaríamos nosotros, no te lo recomendamos.
            </p>
            <p>
              Entre el viento pampeano y las ganas de estar a la altura de
              cualquier big store, construimos algo más cercano: una tech shop
              con cara y nombre, que responde por chat y te acompaña después de
              la compra.
            </p>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-[20px] border border-border bg-surface md:min-h-[420px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,color-mix(in_oklch,var(--primary)_35%,transparent),transparent_50%),linear-gradient(145deg,var(--primary-soft),var(--surface)_55%,var(--accent-soft))]" />
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] dark:opacity-25" />
          <div className="relative flex h-full min-h-[320px] flex-col justify-end p-7 md:min-h-[420px] md:p-9">
            <div className="mb-3 text-[12px] font-bold tracking-[0.14em] text-primary uppercase">
              Desde La Pampa para todo el país
            </div>
            <div className="max-w-[18rem] text-[22px] leading-snug font-bold text-foreground md:text-[26px]">
              Misma pasión por un iPhone nuevo que por un tip de configuración
              a las 22 hs.
            </div>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10 max-w-[36rem]">
            <p className="mb-3 text-[13px] font-bold tracking-wider text-primary uppercase">
              Cómo laburamos
            </p>
            <h2 className="text-[28px] leading-tight font-bold tracking-tight md:text-[32px]">
              Tres cosas que no negociamos.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-3">
            {[
              {
                title: "Stock real",
                text: "Si está publicado, está. Preferimos decirte que se agotó a venderte humo con demoras eternas.",
              },
              {
                title: "Asesoramiento honesto",
                text: "Te preguntamos para qué lo necesitás y te guiamos. A veces el más caro no es el mejor para vos.",
              },
              {
                title: "Cercanía pampeana",
                text: "Somos de Santa Rosa: respondemos, explicamos y estamos cuando hace falta. Tecnología sin soberbia.",
              },
            ].map((item, i) => (
              <div key={item.title} className="rj-fade-in border-t border-border pt-5">
                <div className="mb-3 text-[12px] font-bold tracking-wider text-muted-soft">
                  0{i + 1}
                </div>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-[14.5px] leading-relaxed text-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 md:py-24">
        <div className="overflow-hidden rounded-[22px] border border-border bg-[linear-gradient(135deg,var(--primary-soft),var(--surface)_40%,var(--accent-soft))] px-7 py-10 md:px-12 md:py-14">
          <p className="mb-3 text-[13px] font-bold tracking-wider text-primary uppercase">
            Dónde estamos
          </p>
          <h2 className="mb-4 max-w-[16ch] text-[30px] leading-tight font-bold tracking-tight md:text-[40px]">
            Santa Rosa, La Pampa.
          </h2>
          <p className="mb-8 max-w-[36rem] text-[15px] leading-relaxed text-body-text md:text-base">
            Acá late RJ Tech: entre avenidas anchas, mate a cualquier hora y
            la certeza de que la tecnología también puede sentirse local.
            Enviamos a todo el país, pero el corazón —y el depósito— están en
            Santa Rosa.
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div>
              <div className="mb-1 text-[11px] font-bold tracking-wider text-muted uppercase">
                Ciudad
              </div>
              <div className="font-semibold text-foreground">Santa Rosa</div>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-bold tracking-wider text-muted uppercase">
                Provincia
              </div>
              <div className="font-semibold text-foreground">La Pampa</div>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-bold tracking-wider text-muted uppercase">
                Envíos
              </div>
              <div className="font-semibold text-foreground">Todo el país</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-6 py-14 md:flex-row md:items-center md:px-10">
          <div>
            <h2 className="mb-2 text-[24px] font-bold tracking-tight md:text-[28px]">
              ¿Buscás tu próximo equipo?
            </h2>
            <p className="max-w-[32rem] text-sm text-muted md:text-[15px]">
              Pasá por el catálogo, mirá con calma y escribinos si necesitás
              una mano. Estamos para eso.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="shrink-0 rounded-[9px] bg-primary px-6 py-3.5 text-[15px] font-semibold whitespace-nowrap !text-white no-underline hover:bg-primary-dark hover:!no-underline"
          >
            Ir al catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
