import Hero from "@/components/Hero";
import CategoryTiles from "@/components/CategoryTiles";
import ProductRail from "@/components/ProductRail";
import PromoSplit from "@/components/PromoSplit";
import Newsletter from "@/components/Newsletter";
import {
  getBannerMap,
  getCategoryTiles,
  getFeaturedProducts,
  getNewProducts,
  getSaleProducts,
  getSettings,
} from "@/lib/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [onSale, newIn, featured, tiles, bannerMap, settings] = await Promise.all([
    getSaleProducts(8),
    getNewProducts(8),
    getFeaturedProducts(8),
    getCategoryTiles(4),
    getBannerMap(),
    getSettings(),
  ]);

  return (
    <>
      <Hero banner={bannerMap["hero-1"]} />
      <CategoryTiles categories={tiles} />
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
        title={settings.featured_rail_title || "Best of Norfu"}
        href="/collections/new-in"
        products={featured}
      />
      <Newsletter />
    </>
  );
}
