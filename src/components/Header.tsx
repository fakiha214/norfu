"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import SearchOverlay from "@/components/SearchOverlay";

type MegaColumn = { heading: string; links: { label: string; href: string }[] };
type NavItem = { label: string; href: string; columns?: MegaColumn[]; accent?: boolean };

const shopLinks = (gender: string, cats: string[]): MegaColumn => ({
  heading: "Shop",
  links: cats.map((c) => ({
    label: c
      .split("-")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    href: `/collections/${gender}?category=${c}`,
  })),
});

const NAV: NavItem[] = [
  {
    label: "Men",
    href: "/collections/men",
    columns: [
      shopLinks("men", ["t-shirts", "polos", "shirts", "jeans", "shorts", "sweatshirts", "outerwear"]),
      {
        heading: "Featured",
        links: [
          { label: "New In", href: "/collections/new-in" },
          { label: "Summer Sale", href: "/collections/sale" },
          { label: "View All Men", href: "/collections/men" },
        ],
      },
    ],
  },
  {
    label: "Women",
    href: "/collections/women",
    columns: [
      shopLinks("women", ["dresses", "t-shirts", "shirts", "jeans", "sweatshirts"]),
      {
        heading: "Featured",
        links: [
          { label: "New In", href: "/collections/new-in" },
          { label: "Summer Sale", href: "/collections/sale" },
          { label: "View All Women", href: "/collections/women" },
        ],
      },
    ],
  },
  {
    label: "Juniors",
    href: "/collections/juniors",
    columns: [
      shopLinks("juniors", ["t-shirts", "trousers", "dresses", "sweatshirts"]),
      {
        heading: "Featured",
        links: [
          { label: "Summer Sale", href: "/collections/sale" },
          { label: "View All Juniors", href: "/collections/juniors" },
        ],
      },
    ],
  },
  { label: "New In", href: "/collections/new-in" },
  { label: "Sale", href: "/collections/sale", accent: true },
];

export default function Header() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, openCart } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header
      className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-line"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Mobile menu button */}
          <button
            className="lg:hidden -ml-2 p-2"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>

          <Link href="/" className="select-none text-2xl font-black tracking-[0.35em] leading-none">
            NORFU
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold tracking-[0.14em] uppercase">
            {NAV.map((item) => (
              <div key={item.label} onMouseEnter={() => setOpenMenu(item.columns ? item.label : null)}>
                <Link
                  href={item.href}
                  className={`nav-link py-5 ${item.accent ? "text-sale" : ""}`}
                  data-active={pathname.startsWith(item.href) ? "true" : undefined}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button className="p-2" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
            <button className="relative p-2" aria-label="Open cart" onClick={openCart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mega menu */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-x-0 top-full hidden lg:block border-b border-line bg-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.18)]"
          >
            <div className="mx-auto flex max-w-7xl gap-20 px-6 py-10">
              {NAV.find((n) => n.label === openMenu)?.columns?.map((col) => (
                <div key={col.heading}>
                  <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-muted">
                    {col.heading}
                  </p>
                  <ul className="space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          className="text-sm text-ink/80 transition-colors hover:text-ink hover:underline underline-offset-4"
                          onClick={() => setOpenMenu(null)}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-line bg-white"
          >
            <ul className="px-6 py-4 space-y-1">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`block py-2.5 text-sm font-semibold uppercase tracking-[0.14em] ${item.accent ? "text-sale" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
