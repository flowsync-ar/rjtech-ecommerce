import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SupabaseBootstrap } from "@/components/SupabaseBootstrap";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RJ Tech — Tecnología al mejor precio",
  description:
    "MacBooks, iPhone, Xiaomi, Motorola, drones, TVs y más. Stock real, precios claros y cuotas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <SupabaseBootstrap />
          <ScrollToTop />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
