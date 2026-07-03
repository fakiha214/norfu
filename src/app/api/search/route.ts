import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const results = await searchProducts(q);
  return NextResponse.json({
    results: results.map((p) => ({
      slug: p.slug,
      name: p.name,
      fit: p.fit,
      gender: p.gender,
      price: p.price,
      salePrice: p.salePrice,
      image: p.imageA,
    })),
  });
}
