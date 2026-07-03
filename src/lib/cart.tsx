"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_FREE_SHIPPING_THRESHOLD, MAX_QTY_PER_LINE } from "@/lib/products";

// Cart lines store a snapshot of the product at add time, so the cart
// renders without a round-trip. Prices and stock are re-validated
// server-side at checkout; maxQty is only a best-effort client cap.
export type CartLine = {
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  size: string;
  color: string;
  qty: number;
  maxQty: number;
};

export type CartLineInput = Omit<CartLine, "qty" | "maxQty"> & { maxQty?: number };

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: CartLineInput) => void;
  setQty: (line: CartLine, qty: number) => void;
  removeLine: (line: CartLine) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
  freeShippingThreshold: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "norfu-cart-v2";

const sameLine = (a: CartLine, b: Pick<CartLine, "slug" | "size" | "color">) =>
  a.slug === b.slug && a.size === b.size && a.color === b.color;

const lineCap = (line: Pick<CartLine, "maxQty">) =>
  Math.min(MAX_QTY_PER_LINE, line.maxQty ?? MAX_QTY_PER_LINE);

// Tolerates older/corrupted persisted carts.
function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is Record<string, unknown> =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).slug === "string" &&
        typeof (l as CartLine).unitPrice === "number" &&
        typeof (l as CartLine).qty === "number"
    )
    .map((l) => ({
      slug: String(l.slug),
      name: String(l.name ?? ""),
      image: String(l.image ?? ""),
      unitPrice: Math.max(0, Number(l.unitPrice)),
      size: String(l.size ?? ""),
      color: String(l.color ?? ""),
      qty: Math.max(1, Math.min(MAX_QTY_PER_LINE, Math.round(Number(l.qty)))),
      maxQty:
        typeof l.maxQty === "number" && l.maxQty > 0
          ? Math.round(l.maxQty)
          : MAX_QTY_PER_LINE,
    }));
}

export function CartProvider({
  children,
  freeShippingThreshold = DEFAULT_FREE_SHIPPING_THRESHOLD,
}: {
  children: ReactNode;
  freeShippingThreshold?: number;
}) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(sanitize(JSON.parse(raw)));
    } catch {
      // corrupted storage — start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const addLine = useCallback((line: CartLineInput) => {
    setLines((prev) => {
      const existing = prev.find((l) => sameLine(l, line));
      if (existing) {
        const cap = lineCap(existing);
        return prev.map((l) =>
          sameLine(l, line) ? { ...l, qty: Math.min(cap, l.qty + 1) } : l
        );
      }
      return [...prev, { maxQty: MAX_QTY_PER_LINE, ...line, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((line: CartLine, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !sameLine(l, line))
        : prev.map((l) =>
            sameLine(l, line) ? { ...l, qty: Math.min(lineCap(l), qty) } : l
          )
    );
  }, []);

  const removeLine = useCallback((line: CartLine) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, line)));
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setIsOpen(false);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine,
      setQty,
      removeLine,
      clearCart,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),
      freeShippingThreshold,
    }),
    [lines, isOpen, addLine, setQty, removeLine, clearCart, freeShippingThreshold]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
