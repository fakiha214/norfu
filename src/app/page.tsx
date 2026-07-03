import Hero from "@/components/Hero";
import CategoryTiles from "@/components/CategoryTiles";
import ProductRail from "@/components/ProductRail";
import PromoSplit from "@/components/PromoSplit";
import Newsletter from "@/components/Newsletter";
import { products } from "@/lib/products";

export default function HomePage() {
  const onSale = products.filter((p) => p.salePrice !== null).slice(0, 8);
  const newIn = products.filter((p) => p.badge === "new");
  const women = products.filter((p) => p.gender === "women").slice(0, 8);

  return (
    <>
      <Hero />
      <CategoryTiles />
      <ProductRail title="Summer Sale — Up to 50% Off" href="/collections/sale" products={onSale} />
      <PromoSplit />
      <ProductRail title="New This Week" href="/collections/new-in" products={newIn} />
      <ProductRail title="Women's Edit" href="/collections/women" products={women} />
      <Newsletter />
    </>
  );
}
