import { ShippingContent } from "@/components/shipping/shipping-content";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.shipping");
    return {
        title: t("title"),
        description: t("description")
    };
}

export default function ShippingPage() {
    return <ShippingContent />;
}
