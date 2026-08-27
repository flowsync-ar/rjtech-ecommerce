import type { Metadata } from "next";
import { MarcasClient } from "./MarcasClient";

export const metadata: Metadata = {
  title: "Marcas — RJ Tech",
  description:
    "Explorá las marcas del catálogo RJ Tech y filtrá productos por marca.",
};

export default function MarcasPage() {
  return <MarcasClient />;
}
