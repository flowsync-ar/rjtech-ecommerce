import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="mt-5 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3">
            <BrandLogo size="lg" />
          </div>
          <p className="max-w-[260px] text-[13px] leading-relaxed text-muted">
            MacBooks, celulares, drones y más — con precios claros y stock real.
          </p>
        </div>
        <div>
          <div className="mb-2.5 text-[12.5px] font-bold">Ayuda</div>
          <div className="flex flex-col gap-2 text-[13px] text-muted">
            <span>Soporte</span>
            <span>Envíos</span>
            <a href="/admin" className="text-muted no-underline hover:text-primary hover:!no-underline">
              Admin
            </a>
          </div>
        </div>
        <div>
          <div className="mb-2.5 text-[12.5px] font-bold">Empresa</div>
          <div className="flex flex-col gap-2 text-[13px] text-muted">
            <a
              href="/nosotros"
              className="text-muted no-underline hover:text-primary hover:!no-underline"
            >
              Sobre nosotros
            </a>
            <span>Sucursales</span>
            <span>Trabajá con nosotros</span>
          </div>
        </div>
        <div>
          <div className="mb-2.5 text-[12.5px] font-bold">Pagos</div>
          <div className="flex flex-col gap-2 text-[13px] text-muted">
            <span>Tarjetas</span>
            <span>Cuotas sin interés</span>
            <span>Transferencia</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border-soft px-6 py-4 text-xs text-muted-soft md:px-10">
        © 2026 RJ Tech. Todos los derechos reservados.
      </div>
    </footer>
  );
}
