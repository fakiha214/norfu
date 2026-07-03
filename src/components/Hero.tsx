"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { BannerRow } from "@/lib/products";

export default function Hero({ banner }: { banner?: BannerRow }) {
  const image = banner?.imageUrl ?? "/banners/hero-1.svg";
  const kicker = banner?.kicker || "Summer '26 Collection";
  const words = (banner?.title || "WEAR THE EVERYDAY").split(" ");

  return (
    <section className="relative h-[78vh] min-h-[520px] overflow-hidden bg-ink text-white">
      <div
        className="animate-kenburns absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-white/80"
        >
          {kicker}
        </motion.p>

        <h1 className="flex flex-wrap gap-x-5 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className="overflow-hidden">
              <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  delay: 0.35 + i * 0.12,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-4"
        >
          <Link
            href={banner?.href || "/collections/men"}
            className="bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-ink transition-transform hover:-translate-y-0.5"
          >
            {banner?.ctaLabel || "Shop Men"}
          </Link>
          <Link
            href="/collections/women"
            className="border border-white/70 px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white backdrop-blur transition-colors hover:bg-white hover:text-ink"
          >
            Shop Women
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
