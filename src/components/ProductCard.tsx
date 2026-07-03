"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { discountPercent, formatPKR, isSoldOut, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const { addLine } = useCart();
  const pct = discountPercent(product);
  const soldOut = isSoldOut(product);

  const quickAdd = (size: string, stock: number) =>
    addLine({
      slug: product.slug,
      name: product.name,
      image: product.imageA,
      unitPrice: product.salePrice ?? product.price,
      size,
      color: product.colors[0]?.name ?? "Default",
      maxQty: stock,
    });

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-paper">
          <Image
            src={product.imageA}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out ${
              hovered ? "scale-105 opacity-0" : "scale-100 opacity-100"
            }`}
          />
          <Image
            src={product.imageB}
            alt={`${product.name} — alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-out ${
              hovered ? "scale-105 opacity-100" : "scale-100 opacity-0"
            }`}
          />

          {soldOut ? (
            <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[11px] font-bold tracking-wider text-ink shadow">
              SOLD OUT
            </span>
          ) : product.badge === "sale" && pct > 0 ? (
            <span className="absolute left-3 top-3 bg-sale px-2 py-1 text-[11px] font-bold tracking-wider text-white">
              -{pct}%
            </span>
          ) : product.badge === "new" ? (
            <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[11px] font-bold tracking-wider text-white">
              NEW
            </span>
          ) : null}

          {/* Quick add — slides up on hover (desktop) */}
          {!soldOut && (
            <motion.div
              initial={false}
              animate={{ y: hovered ? 0 : "110%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 hidden bg-white/95 p-3 backdrop-blur sm:block"
              onClick={(e) => e.preventDefault()}
            >
              <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                Quick Add
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {product.sizes.map(({ size, stock }) => (
                  <button
                    key={size}
                    disabled={stock === 0}
                    onClick={(e) => {
                      e.preventDefault();
                      quickAdd(size, stock);
                    }}
                    className="min-w-9 border border-line px-2 py-1.5 text-xs font-medium transition-colors hover:border-ink hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:text-line disabled:line-through disabled:hover:border-line disabled:hover:bg-transparent"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="pt-3">
          <div className="flex gap-1.5">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-black/15"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <h3 className="mt-2 text-sm font-medium leading-snug">{product.name}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted">
            {product.fit} | {product.gender}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            {product.salePrice ? (
              <>
                <span className="text-sm font-semibold text-sale">
                  {formatPKR(product.salePrice)}
                </span>
                <span className="text-xs text-muted line-through">
                  {formatPKR(product.price)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold">{formatPKR(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
