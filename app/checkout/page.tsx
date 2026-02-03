import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata.checkout");
  return {
    title: t("title"),
    description: t("description")
  };
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
