import { NextResponse } from "next/server";

export const revalidate = 300; // 5 min

type DolarBlueResponse = {
  compra: number;
  venta: number;
  casa?: string;
  nombre?: string;
  moneda?: string;
  fechaActualizacion?: string;
};

export async function GET() {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/blue", {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "DolarAPI no disponible" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as DolarBlueResponse;
    if (!data?.venta || Number(data.venta) <= 0) {
      return NextResponse.json(
        { error: "Cotización inválida" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        compra: Number(data.compra),
        venta: Number(data.venta),
        fechaActualizacion: data.fechaActualizacion ?? null,
        casa: data.casa ?? "blue",
        nombre: data.nombre ?? "Blue",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Error al consultar DolarAPI" },
      { status: 502 },
    );
  }
}
