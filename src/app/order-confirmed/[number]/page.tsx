import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderByNumber } from "@/lib/queries";
import { formatPKR } from "@/lib/products";

export const metadata: Metadata = { title: "Order Confirmed" };
export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const result = await getOrderByNumber(number);
  if (!result) notFound();
  const { order, items } = result;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h1 className="mt-5 text-3xl font-black uppercase tracking-tight">
          Order Placed!
        </h1>
        <p className="mt-2 text-sm text-muted">
          Order number{" "}
          <span className="font-mono font-bold text-ink">{order.orderNumber}</span>
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          Thank you, {order.customerName.split(" ")[0]}! We&rsquo;ve received your
          order and will email you at{" "}
          <span className="font-semibold text-ink">{order.email}</span> to confirm
          it before dispatch. Payment is cash on delivery.
        </p>
      </div>

      <div className="mt-10 border border-line">
        <div className="border-b border-line bg-paper px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em]">
            Order Summary
          </p>
        </div>
        <ul className="divide-y divide-line px-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <Image
                src={item.image}
                alt={item.name}
                width={56}
                height={74}
                className="h-[74px] w-14 object-cover bg-paper"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {item.color} / {item.size} × {item.qty}
                </p>
              </div>
              <p className="text-sm font-semibold">
                {formatPKR(item.unitPrice * item.qty)}
              </p>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-line px-5 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{order.shippingFee === 0 ? "Free" : formatPKR(order.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
            <span>Total (COD)</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 border border-line bg-paper px-5 py-4 text-sm text-muted">
        <p className="font-semibold text-ink">Delivering to</p>
        <p className="mt-1">
          {order.customerName} · {order.phone}
        </p>
        <p>
          {order.address}, {order.city}
        </p>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block border border-ink px-8 py-3.5 text-xs font-bold uppercase tracking-[0.24em] transition-colors hover:bg-ink hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
