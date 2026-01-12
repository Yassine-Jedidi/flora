import { getOrders } from "@/app/actions/get-orders";
import { OrderList } from "@/components/admin/order-list";

interface OrdersPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const ordersData = await getOrders(page);

    return (
        <OrderList
            orders={ordersData.orders}
            pagination={{
                currentPage: ordersData.currentPage,
                totalPages: ordersData.totalPages,
            }}
        />
    );
}
