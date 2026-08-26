import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1280px] flex-1 box-border px-6 md:px-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
