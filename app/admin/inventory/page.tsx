import { getProducts } from "@/app/actions/get-products";
import { ProductList } from "@/components/admin/product-list";

interface InventoryPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const productsData = await getProducts(page);

    return (
        <ProductList
            products={productsData.products}
            pagination={{
                currentPage: productsData.currentPage,
                totalPages: productsData.totalPages,
            }}
        />
    );
}
