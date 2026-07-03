"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

export default function ProductRail({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) =>
    railRef.current?.scrollBy({
      left: dir * railRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <Reveal>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-extrabold uppercase tracking-[0.18em] sm:text-2xl">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href={href}
              className="nav-link hidden text-xs font-bold uppercase tracking-[0.18em] sm:block"
            >
              View All
            </Link>
            <div className="hidden gap-2 lg:flex">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Scroll left"
                className="border border-line p-2 transition-colors hover:border-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Scroll right"
                className="border border-line p-2 transition-colors hover:border-ink"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Reveal>
      <div
        ref={railRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6"
      >
        {products.map((p, i) => (
          <Reveal
            key={p.id}
            delay={Math.min(i * 0.06, 0.3)}
            className="w-[68vw] shrink-0 snap-start sm:w-[38vw] lg:w-[calc((100%-3rem)/4)]"
          >
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
