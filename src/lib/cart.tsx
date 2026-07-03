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
import { bySlug, type Product } from "@/lib/products";

export type CartLine = {
  slug: string;
  size: string;
  color: string;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, "qty">) => void;
  setQty: (line: CartLine, qty: number) => void;
  removeLine: (line: CartLine) => void;
  count: number;
  subtotal: number;
  productFor: (line: CartLine) => Product | undefined;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "norfu-cart";

const sameLine = (a: CartLine, b: Omit<CartLine, "qty">) =>
  a.slug === b.slug && a.size === b.size && a.color === b.color;

export function CartProvider({ children }: { children: ReactNode }) {
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

  const addLine = useCallback((line: Omit<CartLine, "qty">) => {
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

  const value = useMemo<CartContextValue>(() => {
    const productFor = (line: CartLine) => bySlug(line.slug);
    const subtotal = lines.reduce((sum, l) => {
      const p = productFor(l);
      return sum + (p ? (p.salePrice ?? p.price) * l.qty : 0);
    }, 0);
    return {
      lines,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine,
      setQty,
      removeLine,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      productFor,
    };
  }, [lines, isOpen, addLine, setQty, removeLine]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
