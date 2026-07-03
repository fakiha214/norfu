"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "discount";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price, low to high" },
  { key: "price-desc", label: "Price, high to low" },
  { key: "discount", label: "Biggest discount" },
];

const effectivePrice = (p: Product) => p.salePrice ?? p.price;
const titleCase = (s: string) =>
  s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

export default function CollectionView({
  title,
  tagline,
  products,
}: {
  title: string;
  tagline: string;
  products: Product[];
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const [category, setCategory] = useState<string | null>(
    initialCategory && categories.includes(initialCategory) ? initialCategory : null
  );
  const [sort, setSort] = useState<SortKey>("featured");
  const [saleOnly, setSaleOnly] = useState(false);

  const visible = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => p.category === category);
    if (saleOnly) list = list.filter((p) => p.salePrice !== null);
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
      case "price-desc":
        return [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
      case "discount":
        return [...list].sort(
          (a, b) =>
            (b.salePrice ? 1 - b.salePrice / b.price : 0) -
            (a.salePrice ? 1 - a.salePrice / a.price : 0)
        );
      default:
        return list;
    }
  }, [products, category, sort, saleOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      {/* Collection header */}
      <div className="border-b border-line py-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
          Home / {title}
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{tagline}</p>
      </div>

      {/* Filter / sort bar */}
      <div className="sticky top-16 z-30 -mx-4 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setCategory(null)}
              className={`whitespace-nowrap border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                category === null
                  ? "border-ink bg-ink text-white"
                  : "border-line hover:border-ink"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? null : c)}
                className={`whitespace-nowrap border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  category === c
                    ? "border-ink bg-ink text-white"
                    : "border-line hover:border-ink"
                }`}
              >
                {titleCase(c)}
              </button>
            ))}
            <button
              onClick={() => setSaleOnly((v) => !v)}
              className={`whitespace-nowrap border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                saleOnly
                  ? "border-sale bg-sale text-white"
                  : "border-line text-sale hover:border-sale"
              }`}
            >
              On Sale
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:block">
              {visible.length} {visible.length === 1 ? "item" : "items"}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider outline-none"
              aria-label="Sort products"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="py-24 text-center text-sm text-muted">
          Nothing matches those filters — try clearing one.
        </p>
      ) : (
        <motion.div layout className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
