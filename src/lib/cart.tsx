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
import { DEFAULT_FREE_SHIPPING_THRESHOLD } from "@/lib/products";

// Cart lines store a snapshot of the product at add time, so the cart
// renders without a round-trip and survives catalog edits gracefully.
export type CartLine = {
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  size: string;
  color: string;
  qty: number;
};

export type CartLineInput = Omit<CartLine, "qty">;

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: CartLineInput) => void;
  setQty: (line: CartLine, qty: number) => void;
  removeLine: (line: CartLine) => void;
  count: number;
  subtotal: number;
  freeShippingThreshold: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "norfu-cart-v2";

const sameLine = (a: CartLine, b: Pick<CartLine, "slug" | "size" | "color">) =>
  a.slug === b.slug && a.size === b.size && a.color === b.color;

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
      if (raw) setLines(JSON.parse(raw));
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
        return prev.map((l) => (sameLine(l, line) ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...prev, { ...line, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((line: CartLine, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !sameLine(l, line))
        : prev.map((l) => (sameLine(l, line) ? { ...l, qty } : l))
    );
  }, []);

  const removeLine = useCallback((line: CartLine) => {
    setLines((prev) => prev.filter((l) => !sameLine(l, line)));
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
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0),
      freeShippingThreshold,
    }),
    [lines, isOpen, addLine, setQty, removeLine, freeShippingThreshold]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
