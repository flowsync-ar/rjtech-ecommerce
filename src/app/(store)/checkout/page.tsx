"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrderSummary } from "@/components/OrderSummary";
import { useCurrency } from "@/hooks/useCurrency";
import { useCartStore } from "@/store/cart-store";
import { useCatalogStore } from "@/store/catalog-store";
import {
  useCheckoutStore,
  type PaymentMethod,
} from "@/store/checkout-store";

const paymentDefs: {
  id: PaymentMethod;
  label: string;
  desc: string;
}[] = [
  { id: "card", label: "Tarjeta de crédito/débito", desc: "Pago único" },
  {
    id: "installments",
    label: "Cuotas sin interés",
    desc: "Hasta 12 cuotas según el producto",
  },
  {
    id: "transfer",
    label: "Transferencia bancaria",
    desc: "Acreditación en 24hs",
  },
];

const stepDefs = [
  { n: 1 as const, label: "Envío" },
  { n: 2 as const, label: "Pago" },
  { n: 3 as const, label: "Confirmación" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const items = useCartStore((s) => s.items);
  const products = useCatalogStore((s) => s.products);
  const clearCart = useCartStore((s) => s.clearCart);
  const {
    step,
    payment,
    orderConfirmed,
    shipping,
    setStep,
    setPayment,
    setShipping,
    confirmOrder,
  } = useCheckoutStore();

  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-muted">No hay productos para comprar.</p>
        <Link href="/catalogo" className="font-semibold">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="m-0 pt-7 pb-2 text-2xl font-bold">Checkout</h1>

      <div className="flex flex-wrap gap-2.5 py-4 pb-8">
        {stepDefs.map((s) => {
          const active = s.n === step;
          return (
            <div
              key={s.n}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold ${
                active
                  ? "bg-primary text-white"
                  : "bg-primary-softer text-muted"
              }`}
            >
              {s.n}. {s.label}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-9 pb-[60px] lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-border bg-surface p-[26px]">
          {step === 1 && (
            <>
              <div className="mb-[18px] text-base font-bold">
                Datos de envío
              </div>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <input
                  placeholder="Nombre completo"
                  value={shipping.name}
                  onChange={(e) => setShipping({ name: e.target.value })}
                  className="rounded-lg border border-border px-3.5 py-2.5 text-sm sm:col-span-2"
                />
                <input
                  placeholder="Dirección"
                  value={shipping.address}
                  onChange={(e) => setShipping({ address: e.target.value })}
                  className="rounded-lg border border-border px-3.5 py-2.5 text-sm sm:col-span-2"
                />
                <input
                  placeholder="Ciudad"
                  value={shipping.city}
                  onChange={(e) => setShipping({ city: e.target.value })}
                  className="rounded-lg border border-border px-3.5 py-2.5 text-sm"
                />
                <input
                  placeholder="Código postal"
                  value={shipping.zip}
                  onChange={(e) => setShipping({ zip: e.target.value })}
                  className="rounded-lg border border-border px-3.5 py-2.5 text-sm"
                />
                <input
                  placeholder="Teléfono"
                  value={shipping.phone}
                  onChange={(e) => setShipping({ phone: e.target.value })}
                  className="rounded-lg border border-border px-3.5 py-2.5 text-sm sm:col-span-2"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-[22px] cursor-pointer rounded-[9px] border-none bg-primary px-6 py-3.5 text-[14.5px] font-bold text-white"
              >
                Continuar a pago
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-[18px] text-base font-bold">
                Método de pago
              </div>
              <div className="mb-5 flex flex-col gap-2.5">
                {paymentDefs.map((pm) => {
                  const active = pm.id === payment;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPayment(pm.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-[10px] border px-4 py-3.5 text-left ${
                        active
                          ? "border-primary bg-primary-soft"
                          : "border-border bg-surface"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold">{pm.label}</div>
                        <div className="mt-0.5 text-[12.5px] text-muted">
                          {pm.desc}
                        </div>
                      </div>
                      <div
                        className={`h-[18px] w-[18px] rounded-full border-2 ${
                          active
                            ? "border-primary bg-primary"
                            : "border-muted-soft bg-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="cursor-pointer rounded-[9px] border border-border bg-transparent px-6 py-3.5 text-[14.5px] font-semibold"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="cursor-pointer rounded-[9px] border-none bg-primary px-6 py-3.5 text-[14.5px] font-bold text-white"
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 3 &&
            (orderConfirmed ? (
              <div className="py-10 text-center">
                <div className="mb-3.5 text-[40px] text-success">✓</div>
                <div className="mb-2 text-lg font-bold">
                  ¡Pedido confirmado!
                </div>
                <div className="mb-[22px] text-sm text-muted">
                  Te enviamos el comprobante por correo. Podés seguir el estado
                  desde Mi cuenta.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void clearCart();
                    router.push("/cuenta");
                  }}
                  className="cursor-pointer rounded-[9px] border-none bg-primary px-[22px] py-3 text-sm font-bold text-white"
                >
                  Ver mis pedidos
                </button>
              </div>
            ) : (
              <>
                <div className="mb-[18px] text-base font-bold">
                  Confirmá tu pedido
                </div>
                <div className="mb-[22px] flex flex-col gap-2.5">
                  {items.map((c) => {
                    const product = products.find((p) => p.id === c.id);
                    if (!product) return null;
                    return (
                      <div
                        key={c.id}
                        className="flex justify-between border-b border-border-soft py-2 text-[13.5px]"
                      >
                        <span>
                          {c.qty}× {product.name}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(product.price * c.qty)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="cursor-pointer rounded-[9px] border border-border bg-transparent px-6 py-3.5 text-[14.5px] font-semibold"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await confirmOrder();
                      if (!result.ok) alert(result.error);
                    }}
                    className="cursor-pointer rounded-[9px] border-none bg-success px-6 py-3.5 text-[14.5px] font-bold text-white"
                  >
                    Confirmar compra
                  </button>
                </div>
              </>
            ))}
        </div>

        <OrderSummary title="Tu pedido" />
      </div>
    </>
  );
}
