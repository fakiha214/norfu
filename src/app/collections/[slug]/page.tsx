import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  RESERVED_COLLECTION_SLUGS,
  virtualCollectionBySlug,
} from "@/lib/products";
import {
  getCategoryBySlug,
  getCollectionProducts,
  getProductsByCategory,
  getSubcategories,
} from "@/lib/queries";
import CollectionView from "@/components/CollectionView";

export const revalidate = 60;

// Category slugs are dynamic (admin-managed), so we only pre-render the two
// reserved virtual collections; category pages render on-demand and cache (ISR).
export function generateStaticParams() {
  return RESERVED_COLLECTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const virtual = virtualCollectionBySlug(slug);
  if (virtual) return { title: virtual.title };
  const category = await getCategoryBySlug(slug);
  return { title: category ? category.name : "Collection" };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const virtual = virtualCollectionBySlug(slug);
  if (virtual) {
    const items = await getCollectionProducts(slug);
    return (
      <Suspense>
        <CollectionView
          title={virtual.title}
          tagline={virtual.tagline}
          products={items}
          subcategories={[]}
        />
      </Suspense>
    );
  }

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [items, subcats] = await Promise.all([
    getProductsByCategory(category),
    category.parentId === null ? getSubcategories(category.id) : Promise.resolve([]),
  ]);

  return (
    <Suspense>
      <CollectionView
        title={category.name}
        tagline={
          subcats.length > 0
            ? "Shop the full range below, or narrow it by type."
            : "The full edit — filter and sort to find your fit."
        }
        products={items}
        subcategories={subcats.map((c) => ({ slug: c.slug, name: c.name }))}
      />
    </Suspense>
  );
}
