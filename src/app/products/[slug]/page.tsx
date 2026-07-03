import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { bySlug, products } from "@/lib/products";
import ProductDetail from "@/components/ProductDetail";
import ProductRail from "@/components/ProductRail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = bySlug(slug);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = bySlug(slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.gender === product.gender && p.id !== product.id)
    .slice(0, 6);

  return (
    <>
      <ProductDetail product={product} />
      <ProductRail
        title="You May Also Like"
        href={`/collections/${product.gender}`}
        products={related}
      />
    </>
  );
}
