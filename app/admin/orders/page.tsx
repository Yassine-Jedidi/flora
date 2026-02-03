import { getOrders, getOrderGovernorates } from "@/app/actions/get-orders";
import { OrderList } from "@/components/admin/order-list";
import { OrderFilters } from "@/components/admin/order-filters";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.admin.orders");
    return {
        title: t("title"),
        description: t("description")
    };
}

interface OrdersPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        status?: string;
        governorate?: string;
        dateRange?: string;
    }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;

    const filters = {
        search: params?.search,
        status: params?.status as "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | undefined,
        governorate: params?.governorate,
        dateRange: params?.dateRange as "all" | "today" | "week" | "month" | undefined,
    };

    const [ordersData, governorates] = await Promise.all([
        getOrders(page, 10, filters),
        getOrderGovernorates(),
    ]);

    return (
        <div>
            <OrderFilters governorates={governorates} />
            <OrderList
                orders={ordersData.orders}
                pagination={{
                    currentPage: ordersData.currentPage,
                    totalPages: ordersData.totalPages,
                    total: ordersData.total,
                }}
            />
        </div>
    );
}
