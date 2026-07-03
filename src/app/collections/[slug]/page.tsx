import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { collectionBySlug, collections, products } from "@/lib/products";
import CollectionView from "@/components/CollectionView";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  return { title: collection ? collection.title : "Collection" };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  if (!collection) notFound();

  const items = products.filter(collection.filter);

  return (
    <Suspense>
      <CollectionView
        title={collection.title}
        tagline={collection.tagline}
        products={items}
      />
    </Suspense>
  );
}
