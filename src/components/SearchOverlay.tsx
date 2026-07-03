"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPKR } from "@/lib/products";

type SearchResult = {
  slug: string;
  name: string;
  fit: string;
  gender: string;
  price: number;
  salePrice: number | null;
  image: string;
};

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced live search against the DB
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
      } catch {
        // aborted or network error — keep previous results
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-3xl px-6 py-8">
              <div className="flex items-center gap-4 border-b-2 border-ink pb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tees, dresses, denim…"
                  className="w-full bg-transparent text-lg outline-none placeholder:text-muted"
                />
                <button onClick={onClose} aria-label="Close search" className="p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {query.trim() && (
                <div className="py-4">
                  {loading && results.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted">
                      No results for “{query}”
                    </p>
                  ) : (
                    <ul className="divide-y divide-line">
                      {results.map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-4 py-3 hover:bg-paper px-2 -mx-2 transition-colors"
                          >
                            <Image
                              src={p.image}
                              alt={p.name}
                              width={48}
                              height={64}
                              className="h-16 w-12 object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{p.name}</p>
                              <p className="text-xs uppercase tracking-wider text-muted">
                                {p.fit} | {p.gender}
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              {formatPKR(p.salePrice ?? p.price)}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
