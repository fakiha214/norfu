"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { FREE_SHIPPING_THRESHOLD, formatPKR, imageA } from "@/lib/products";

export default function CartDrawer() {
  const { lines, isOpen, closeCart, setQty, removeLine, subtotal, productFor } =
    useCart();

  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45"
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
                Your Basket
              </h2>
              <button onClick={closeCart} aria-label="Close cart" className="p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {lines.length > 0 && (
              <div className="border-b border-line px-6 py-3">
                <p className="mb-2 text-xs text-muted">
                  {remaining > 0
                    ? `Add ${formatPKR(remaining)} more for free shipping`
                    : "You've unlocked free shipping 🎉"}
                </p>
                <div className="h-1 w-full overflow-hidden rounded bg-line">
                  <motion.div
                    className="h-full bg-ink"
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-sm text-muted">Your basket is empty.</p>
                  <Link
                    href="/collections/new-in"
                    onClick={closeCart}
                    className="border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-white"
                  >
                    Shop New In
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => {
                      const p = productFor(line);
                      if (!p) return null;
                      const unit = p.salePrice ?? p.price;
                      const key = `${line.slug}-${line.size}-${line.color}`;
                      return (
                        <motion.li
                          key={key}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: 40 }}
                          className="flex gap-4 py-4"
                        >
                          <Link href={`/products/${p.slug}`} onClick={closeCart}>
                            <Image
                              src={imageA(p)}
                              alt={p.name}
                              width={72}
                              height={96}
                              className="h-24 w-18 object-cover bg-paper"
                            />
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between gap-2">
                              <p className="text-sm font-medium leading-tight">{p.name}</p>
                              <button
                                onClick={() => removeLine(line)}
                                aria-label="Remove item"
                                className="text-muted hover:text-ink"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                  <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                              </button>
                            </div>
                            <p className="mt-0.5 text-xs text-muted">
                              {line.color} / {line.size}
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center border border-line">
                                <button
                                  className="px-2.5 py-1 text-sm hover:bg-paper"
                                  onClick={() => setQty(line, line.qty - 1)}
                                  aria-label="Decrease quantity"
                                >
                                  −
                                </button>
                                <span className="w-8 text-center text-sm">{line.qty}</span>
                                <button
                                  className="px-2.5 py-1 text-sm hover:bg-paper"
                                  onClick={() => setQty(line, line.qty + 1)}
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>
                              <p className="text-sm font-semibold">
                                {formatPKR(unit * line.qty)}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="text-base font-bold">{formatPKR(subtotal)}</span>
                </div>
                <button className="w-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.24em] text-white transition-opacity hover:opacity-85">
                  Checkout
                </button>
                <p className="mt-3 text-center text-[11px] text-muted">
                  Shipping &amp; taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
