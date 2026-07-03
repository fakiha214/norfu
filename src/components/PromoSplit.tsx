import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";

const PROMOS = [
  {
    kicker: "The Fabric Edit",
    title: "Linen, All Summer",
    copy: "Breathable weaves cut loose for 40° afternoons.",
    href: "/collections/women",
    img: "/banners/promo-1.svg",
  },
  {
    kicker: "Denim Lab",
    title: "Washed To Order",
    copy: "Rigid denim, stone-washed and broken in for you.",
    href: "/collections/men?category=jeans",
    img: "/banners/promo-2.svg",
  },
];

export default function PromoSplit() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
      <div className="grid gap-4 md:grid-cols-2">
        {PROMOS.map((promo, i) => (
          <Reveal key={promo.title} delay={i * 0.1}>
            <Link href={promo.href} className="group relative block aspect-[14/9] overflow-hidden">
              <Image
                src={promo.img}
                alt={promo.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/75">
                  {promo.kicker}
                </p>
                <h3 className="mt-2 text-3xl font-black tracking-tight">{promo.title}</h3>
                <p className="mt-1.5 max-w-sm text-sm text-white/85">{promo.copy}</p>
                <span className="mt-4 inline-block border-b-2 border-white pb-0.5 text-xs font-bold uppercase tracking-[0.2em]">
                  Shop Now
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
