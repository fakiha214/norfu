import Link from "next/link";
import { getNavCategories } from "@/lib/queries";

const STATIC_COLUMNS = [
  {
    heading: "Help",
    links: [
      { label: "Contact Us", href: "#" },
      { label: "Track Your Order", href: "#" },
      { label: "Shipping & Delivery", href: "#" },
      { label: "Returns & Exchanges", href: "#" },
      { label: "Size Guide", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Norfu", href: "#" },
      { label: "Stores", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Sustainability", href: "#" },
    ],
  },
];

export default async function Footer() {
  const navCategories = await getNavCategories();
  const shopColumn = {
    heading: "Shop",
    links: [
      ...navCategories.map((c) => ({
        label: c.name,
        href: `/collections/${c.slug}`,
      })),
      { label: "New In", href: "/collections/new-in" },
      { label: "Sale", href: "/collections/sale" },
    ],
  };
  const COLUMNS = [shopColumn, ...STATIC_COLUMNS];

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-black tracking-[0.35em]">NORFU</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Everyday essentials designed in Pakistan. Considered fabrics,
              honest prices, new drops every Friday.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.instagram.com/norfuclothing"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-wider text-muted transition-colors hover:text-ink"
              >
                Instagram
              </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-muted">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink/75 transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Norfu. All rights reserved.</p>
          <p>Cash on Delivery · Debit/Credit Cards · Bank Transfer</p>
        </div>
      </div>
    </footer>
  );
}
