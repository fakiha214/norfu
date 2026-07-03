import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import {
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING_FEE,
} from "@/lib/products";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();
  const threshold =
    Number(settings.free_shipping_threshold) || DEFAULT_FREE_SHIPPING_THRESHOLD;
  const shippingFee = Number(settings.shipping_fee) || DEFAULT_SHIPPING_FEE;

  return <CheckoutForm freeShippingThreshold={threshold} shippingFee={shippingFee} />;
}
