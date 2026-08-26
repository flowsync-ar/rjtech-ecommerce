"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/products";
import type { AuthUser } from "@/store/auth-store";
import { useAuthStore } from "@/store/auth-store";
import {
  useAccountProfileStore,
  type Address,
} from "@/store/account-profile-store";

const statusStyles = {
  Entregado: "bg-success-soft text-success-dark",
  "En camino": "bg-primary-soft text-primary-dark",
  Procesando: "bg-warning-soft text-warning",
} as const;

type Section = "orders" | "profile" | "addresses";

type Props = {
  user: AuthUser;
};

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-soft focus:border-primary";

const navItems: { id: Section; label: string }[] = [
  { id: "orders", label: "Mis pedidos" },
  { id: "profile", label: "Datos personales" },
  { id: "addresses", label: "Direcciones" },
];

export function AccountDashboard({ user }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const [section, setSection] = useState<Section>("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <h1 className="m-0 py-7 pb-6 text-2xl font-bold">Mi cuenta</h1>
      <div className="grid grid-cols-1 gap-9 pb-[60px] md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = section === item.id && !selectedOrder;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSection(item.id);
                  setSelectedOrder(null);
                }}
                className={`cursor-pointer rounded-lg border-none px-3.5 py-2.5 text-left text-sm ${
                  active
                    ? "bg-primary-soft font-bold text-primary-dark"
                    : "bg-transparent font-medium text-body-text"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 cursor-pointer rounded-lg border-none bg-transparent px-3.5 py-2.5 text-left text-sm font-medium text-sale"
          >
            Cerrar sesión
          </button>
        </aside>

        <div>
          {selectedOrder ? (
            <OrderDetail
              order={selectedOrder}
              onBack={() => setSelectedOrder(null)}
            />
          ) : (
            <>
              {section === "orders" && (
                <OrdersSection
                  firstName={firstName}
                  email={user.email}
                  provider={user.provider}
                  onOpenOrder={setSelectedOrder}
                />
              )}
              {section === "profile" && <ProfileSection user={user} />}
              {section === "addresses" && <AddressesSection />}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function OrdersSection({
  firstName,
  email,
  provider,
  onOpenOrder,
}: {
  firstName: string;
  email: string;
  provider: AuthUser["provider"];
  onOpenOrder: (order: Order) => void;
}) {
  const orders = useAccountProfileStore((s) => s.orders);
  return (
    <>
      <div className="mb-2 text-[15px] font-semibold">
        Hola, {firstName} — acá está tu historial de compras.
      </div>
      <div className="mb-[18px] text-[13px] text-muted">
        {email}
        {provider === "google" && (
          <span className="ml-2 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-muted">
            Google
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="hidden bg-primary-softer px-[18px] py-3 text-xs font-bold text-muted uppercase sm:flex">
          <div className="w-[120px]">Pedido</div>
          <div className="w-[130px]">Fecha</div>
          <div className="flex-1">Estado</div>
          <div className="w-[110px] text-right">Total</div>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
            Todavía no tenés pedidos.
          </div>
        ) : (
          orders.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => onOpenOrder(o)}
              className="flex w-full cursor-pointer flex-col gap-2 border-t border-border-soft border-none bg-transparent px-[18px] py-3.5 text-left text-[13.5px] transition-colors hover:bg-accent-soft sm:flex-row sm:items-center sm:gap-0"
            >
              <div className="w-[120px] font-semibold text-primary">{o.id}</div>
              <div className="w-[130px] text-muted">{o.date}</div>
              <div className="flex-1">
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[o.status]}`}
                >
                  {o.status}
                </span>
              </div>
              <div className="w-[110px] font-bold text-foreground sm:text-right">
                {o.total}
              </div>
            </button>
          ))
        )}
      </div>
      <p className="mt-3 text-[12.5px] text-muted-soft">
        Tocá un pedido para ver el detalle de lo que compraste.
      </p>
    </>
  );
}

function OrderDetail({
  order,
  onBack,
}: {
  order: Order;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-primary"
      >
        ← Volver a mis pedidos
      </button>

      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 className="m-0 text-xl font-bold">{order.id}</h2>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyles[order.status]}`}
        >
          {order.status}
        </span>
      </div>
      <div className="mb-6 text-sm text-muted">Pedido del {order.date}</div>

      <div className="mb-6 overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border-soft bg-primary-softer px-[18px] py-3 text-xs font-bold text-muted uppercase">
          Productos
        </div>
        {order.items.map((item) => (
          <div
            key={`${order.id}-${item.name}`}
            className="flex flex-col gap-1 border-b border-border-soft px-[18px] py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="text-sm font-semibold">{item.name}</div>
              <div className="text-[12.5px] text-muted">
                {item.qty} × {item.unitPrice}
              </div>
            </div>
            <div className="text-sm font-bold">{item.lineTotal}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 text-[12px] font-bold tracking-wide text-muted uppercase">
            Envío
          </div>
          <div className="text-sm leading-relaxed text-body-text">
            {order.address}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-3 text-[12px] font-bold tracking-wide text-muted uppercase">
            Resumen
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Envío</span>
              <span>{order.shipping}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Pago</span>
              <span>{order.payment}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border-soft pt-3 text-[15px] font-bold text-foreground">
              <span>Total</span>
              <span>{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ user }: { user: AuthUser }) {
  const profile = useAccountProfileStore((s) => s.profile);
  const setProfile = useAccountProfileStore((s) => s.setProfile);
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      ...profile,
      email: profile.email || user.email,
      name: profile.name || user.name,
    });
  }, [profile, user.email, user.name]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        dni: form.dni.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  return (
    <>
      <div className="mb-2 text-[15px] font-semibold">Datos personales</div>
      <div className="mb-6 text-sm text-muted">
        Actualizá tu información de contacto.
      </div>
      <form
        onSubmit={onSave}
        className="max-w-xl space-y-3.5 rounded-xl border border-border bg-surface p-5"
      >
        <input
          className={inputClass}
          placeholder="Nombre completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className={inputClass}
          placeholder="DNI"
          value={form.dni}
          onChange={(e) => setForm({ ...form, dni: e.target.value })}
        />
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="cursor-pointer rounded-[9px] border-none bg-primary px-5 py-2.5 text-sm font-bold !text-white"
          >
            Guardar cambios
          </button>
          {saved && (
            <span className="text-sm font-semibold text-success">
              Guardado ✓
            </span>
          )}
        </div>
      </form>
    </>
  );
}

function AddressesSection() {
  const addresses = useAccountProfileStore((s) => s.addresses);
  const addAddress = useAccountProfileStore((s) => s.addAddress);
  const updateAddress = useAccountProfileStore((s) => s.updateAddress);
  const deleteAddress = useAccountProfileStore((s) => s.deleteAddress);

  const emptyForm = {
    label: "Casa",
    street: "",
    city: "Santa Rosa",
    province: "La Pampa",
    zip: "6300",
    phone: "",
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setForm({
      label: address.label,
      street: address.street,
      city: address.city,
      province: address.province,
      zip: address.zip,
      phone: address.phone,
    });
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      label: form.label.trim() || "Dirección",
      street: form.street.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      zip: form.zip.trim(),
      phone: form.phone.trim(),
    };
    try {
      if (editing) await updateAddress(editing.id, payload);
      else await addAddress(payload);
      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al guardar");
    }
  };

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold">Direcciones</div>
          <div className="text-sm text-muted">
            Direcciones de envío guardadas.
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="cursor-pointer rounded-[9px] border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
        >
          + Nueva dirección
        </button>
      </div>

      {open && (
        <form
          onSubmit={onSave}
          className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2"
        >
          <input
            className={inputClass}
            placeholder="Etiqueta (Casa, Trabajo...)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Teléfono"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="Calle y número"
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Ciudad"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Provincia"
            value={form.province}
            onChange={(e) => setForm({ ...form, province: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Código postal"
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
            required
          />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="cursor-pointer rounded-lg border-none bg-primary px-4 py-2.5 text-sm font-bold !text-white"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="mb-1 text-sm font-bold text-primary">
              {address.label}
            </div>
            <div className="text-sm leading-relaxed text-body-text">
              {address.street}
              <br />
              {address.city}, {address.province} ({address.zip})
              {address.phone && (
                <>
                  <br />
                  {address.phone}
                </>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(address)}
                className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-[12.5px] font-semibold"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("¿Eliminar esta dirección?")) {
                    void deleteAddress(address.id).catch((err) =>
                      alert(err instanceof Error ? err.message : "Error"),
                    );
                  }
                }}
                className="cursor-pointer rounded-md border-none bg-transparent px-3 py-1.5 text-[12.5px] font-semibold text-sale"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && !open && (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted">
          Todavía no tenés direcciones guardadas.
        </div>
      )}
    </>
  );
}
