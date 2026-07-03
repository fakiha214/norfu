"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart";
import { formatPKR } from "@/lib/products";

type Issue = { slug: string; size: string; reason: string; available?: number };

const inputCls =
  "w-full border border-line px-3.5 py-3 text-sm outline-none focus:border-ink transition-colors";
const labelCls =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.18em] text-muted";

export default function CheckoutForm({
  freeShippingThreshold,
  shippingFee,
}: {
  freeShippingThreshold: number;
  shippingFee: number;
}) {
  const router = useRouter();
  const { lines, subtotal, clearCart, setQty, removeLine } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const total = subtotal + shipping;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const applyIssues = (issues: Issue[]) => {
    for (const issue of issues) {
      const line = lines.find((l) => l.slug === issue.slug && l.size === issue.size);
      if (!line) continue;
      if (issue.reason === "insufficient-stock" && issue.available && issue.available > 0) {
        setQty(line, issue.available);
      } else {
        removeLine(line);
      }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          lines: lines.map((l) => ({
            slug: l.slug,
            size: l.size,
            color: l.color,
            qty: l.qty,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.orderNumber) {
        clearCart();
        router.push(`/order-confirmed/${data.orderNumber}`);
        return;
      }
      if (res.status === 409 && Array.isArray(data.issues)) {
        applyIssues(data.issues);
        setError(
          "Availability changed while you were checking out — we've updated your basket. Please review it and place the order again."
        );
      } else {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network problem — please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight">Your basket is empty</h1>
        <p className="text-sm text-muted">Add something you love, then come back here.</p>
        <Link
          href="/collections/new-in"
          className="border border-ink px-8 py-3.5 text-xs font-bold uppercase tracking-[0.24em] transition-colors hover:bg-ink hover:text-white"
        >
          Shop New In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted">
        Home / Checkout
      </p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        {/* Delivery details */}
        <form onSubmit={submit} noValidate className="space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
            Delivery Details
          </h2>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-sale/40 bg-sale/5 px-4 py-3 text-sm text-sale"
            >
              {error}
            </motion.p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="name">Full name *</label>
              <input id="name" required value={form.name} onChange={set("name")} className={inputCls} autoComplete="name" />
              {fieldErrors.name && <p className="mt-1 text-xs text-sale">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="phone">Phone *</label>
              <input id="phone" required value={form.phone} onChange={set("phone")} className={inputCls} placeholder="03xx-xxxxxxx" autoComplete="tel" />
              {fieldErrors.phone && <p className="mt-1 text-xs text-sale">{fieldErrors.phone}</p>}
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="email">Email *</label>
            <input id="email" type="email" required value={form.email} onChange={set("email")} className={inputCls} autoComplete="email" />
            <p className="mt-1 text-xs text-muted">
              We&rsquo;ll email you at this address to confirm your order before dispatch.
            </p>
            {fieldErrors.email && <p className="mt-1 text-xs text-sale">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className={labelCls} htmlFor="address">Street address *</label>
            <input id="address" required value={form.address} onChange={set("address")} className={inputCls} placeholder="House, street, area" autoComplete="street-address" />
            {fieldErrors.address && <p className="mt-1 text-xs text-sale">{fieldErrors.address}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="city">City *</label>
              <input id="city" required value={form.city} onChange={set("city")} className={inputCls} autoComplete="address-level2" />
              {fieldErrors.city && <p className="mt-1 text-xs text-sale">{fieldErrors.city}</p>}
            </div>
            <div>
              <label className={labelCls} htmlFor="notes">Order notes (optional)</label>
              <input id="notes" value={form.notes} onChange={set("notes")} className={inputCls} placeholder="Landmark, delivery time…" />
            </div>
          </div>

          <div>
            <h2 className="mb-3 mt-8 text-sm font-bold uppercase tracking-[0.2em]">
              Payment
            </h2>
            <div className="flex items-center gap-3 border border-ink bg-paper px-4 py-3.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-ink">
                <span className="h-2 w-2 rounded-full bg-ink" />
              </span>
              <div>
                <p className="text-sm font-semibold">Cash on Delivery</p>
                <p className="text-xs text-muted">
                  Pay when your order arrives. We&rsquo;ll confirm by email first.
                </p>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="mt-4 w-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.28em] text-white transition-opacity hover:opacity-85 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place Order — ${formatPKR(total)}`}
          </motion.button>
        </form>

        {/* Order summary */}
        <aside className="h-fit border border-line bg-paper p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
            Order Summary
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {lines.map((line) => (
              <li key={`${line.slug}-${line.size}-${line.color}`} className="flex gap-3 py-3">
                <div className="relative">
                  <Image
                    src={line.image}
                    alt={line.name}
                    width={56}
                    height={74}
                    className="h-[74px] w-14 object-cover bg-white"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                    {line.qty}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">{line.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {line.color} / {line.size}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPKR(line.unitPrice * line.qty)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPKR(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
              <span>Total</span>
              <span>{formatPKR(total)}</span>
            </div>
          </div>
          {shipping > 0 && (
            <p className="mt-3 text-xs text-muted">
              Add {formatPKR(freeShippingThreshold - subtotal)} more for free shipping.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
