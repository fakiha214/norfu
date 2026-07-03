import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import type { BannerRow } from "@/lib/products";

const SLOTS = ["cat-men", "cat-women", "cat-juniors", "cat-sale"];

export default function CategoryTiles({
  bannerMap,
}: {
  bannerMap: Record<string, BannerRow>;
}) {
  const tiles = SLOTS.map((slot) => bannerMap[slot]).filter(Boolean);
  if (tiles.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <Reveal key={tile.slot} delay={i * 0.08}>
            <Link href={tile.href} className="group relative block aspect-[3/4] overflow-hidden">
              <Image
                src={tile.imageUrl}
                alt={tile.title}
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-white">
                <span className="text-lg font-extrabold uppercase tracking-[0.2em]">
                  {tile.title}
                </span>
                <span className="translate-x-0 transition-transform duration-300 group-hover:translate-x-1.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
