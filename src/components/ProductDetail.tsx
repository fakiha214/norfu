"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  discountPercent,
  formatPKR,
  imageA,
  imageB,
  type Product,
} from "@/lib/products";
import { useCart } from "@/lib/cart";

const ACCORDIONS = (p: Product) => [
  { title: "Description", body: p.description },
  {
    title: "Fabric & Care",
    body: "Machine wash cold with similar colours. Do not bleach. Tumble dry low. Iron on reverse. Composition details will be listed on the garment label.",
  },
  {
    title: "Shipping & Returns",
    body: "Free shipping on orders above PKR 4,000. Delivered nationwide in 2–4 working days. Easy 14-day exchanges at any Norfu store or by courier.",
  },
];

export default function ProductDetail({ product }: { product: Product }) {
  const images = [imageA(product), imageB(product)];
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product.colors[0].name);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const { addLine } = useCart();

  const pct = discountPercent(product);
  const unit = product.salePrice ?? product.price;

  const handleAdd = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    addLine({ slug: product.slug, size, color });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.25em] text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        {" / "}
        <Link href={`/collections/${product.gender}`} className="capitalize hover:text-ink">
          {product.gender}
        </Link>
        {" / "}
        <span className="text-ink">{product.name}</span>
      </p>

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        {/* Gallery */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                className={`relative h-20 w-16 overflow-hidden border transition-colors ${
                  activeImage === i ? "border-ink" : "border-line hover:border-muted"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-paper">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
            {product.badge === "sale" && pct > 0 && (
              <span className="absolute left-4 top-4 bg-sale px-2.5 py-1 text-xs font-bold tracking-wider text-white">
                -{pct}%
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted">
            {product.fit} | {product.gender}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className={`text-2xl font-bold ${product.salePrice ? "text-sale" : ""}`}>
              {formatPKR(unit)}
            </span>
            {product.salePrice && (
              <span className="text-base text-muted line-through">
                {formatPKR(product.price)}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Or 3 installments of {formatPKR(Math.ceil(unit / 3))} — 0% markup
          </p>

          {/* Colors */}
          <div className="mt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]">
              Colour — <span className="font-medium text-muted">{color}</span>
            </p>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  aria-label={`Colour ${c.name}`}
                  className={`h-9 w-9 rounded-full border-2 p-0.5 transition-colors ${
                    color === c.name ? "border-ink" : "border-transparent hover:border-line"
                  }`}
                >
                  <span
                    className="block h-full w-full rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Size</p>
              <button className="text-xs text-muted underline underline-offset-4 hover:text-ink">
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={`min-w-12 border px-3 py-2.5 text-sm font-medium transition-colors ${
                    size === s
                      ? "border-ink bg-ink text-white"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <AnimatePresence>
              {sizeError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 text-xs font-medium text-sale"
                >
                  Please select a size first.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleAdd}
            className="mt-8 w-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.28em] text-white transition-opacity hover:opacity-85"
          >
            Add to Basket — {formatPKR(unit)}
          </motion.button>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-muted">
            <div className="border border-line px-2 py-3">Nationwide Delivery</div>
            <div className="border border-line px-2 py-3">14-Day Exchange</div>
            <div className="border border-line px-2 py-3">Cash on Delivery</div>
          </div>

          {/* Accordions */}
          <div className="mt-8 divide-y divide-line border-y border-line">
            {ACCORDIONS(product).map((acc, i) => (
              <div key={acc.title}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold uppercase tracking-[0.14em]"
                >
                  {acc.title}
                  <motion.span
                    animate={{ rotate: openAccordion === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-lg font-light"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openAccordion === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-muted">{acc.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
