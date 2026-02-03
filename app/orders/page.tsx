import { OrdersClient } from "@/components/orders/orders-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.orders");
    return {
        title: t("title"),
        description: t("description")
    };
}

export default function OrdersPage() {
    return <OrdersClient />;
}
