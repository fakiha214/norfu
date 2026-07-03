import Hero from "@/components/Hero";
import CategoryTiles from "@/components/CategoryTiles";
import ProductRail from "@/components/ProductRail";
import PromoSplit from "@/components/PromoSplit";
import Newsletter from "@/components/Newsletter";
import {
  getBannerMap,
  getNewProducts,
  getProductsByGender,
  getSaleProducts,
  getSettings,
} from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [onSale, newIn, women, bannerMap, settings] = await Promise.all([
    getSaleProducts(8),
    getNewProducts(8),
    getProductsByGender("women", 8),
    getBannerMap(),
    getSettings(),
  ]);

  return (
    <>
      <Hero banner={bannerMap["hero-1"]} />
      <CategoryTiles bannerMap={bannerMap} />
      <ProductRail
        title={settings.sale_rail_title || "Summer Sale"}
        href="/collections/sale"
        products={onSale}
      />
      <PromoSplit bannerMap={bannerMap} />
      <ProductRail
        title={settings.new_rail_title || "New This Week"}
        href="/collections/new-in"
        products={newIn}
      />
      <ProductRail
        title={settings.womens_rail_title || "Women's Edit"}
        href="/collections/women"
        products={women}
      />
      <Newsletter />
    </>
  );
}
