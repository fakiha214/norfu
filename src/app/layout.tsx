import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { DEFAULT_FREE_SHIPPING_THRESHOLD } from "@/lib/products";
import { getAnnouncements, getSettings } from "@/lib/queries";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NORFU — Wear the Everyday",
    template: "%s | NORFU",
  },
  description:
    "Norfu is a Pakistani fashion label crafting everyday essentials for men, women and juniors. Free shipping over PKR 4,000.",
};

export const revalidate = 60;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [messages, settings] = await Promise.all([
    getAnnouncements(),
    getSettings(),
  ]);
  const threshold =
    Number(settings.free_shipping_threshold) || DEFAULT_FREE_SHIPPING_THRESHOLD;

  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider freeShippingThreshold={threshold}>
          <AnnouncementBar messages={messages} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
