import { OrderDetailsClient } from "@/components/orders/order-details-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = await params;
    const t = await getTranslations("Orders.details");
    return {
        title: `${t("title")} #${orderId.slice(-8).toUpperCase()} | Flora Accessories`,
        description: t("statusDesc.processing"),
        robots: { index: false, follow: false }
    };
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
    return <OrderDetailsClient params={params} />;
}
