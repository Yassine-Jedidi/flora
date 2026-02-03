import { getProducts, getCategories } from "@/app/actions/get-products";
import { ProductList } from "@/components/admin/product-list";
import { InventoryFilters } from "@/components/admin/inventory-filters";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.admin.inventory");
    return {
        title: t("title"),
        description: t("description")
    };
}

interface InventoryPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
        category?: string;
        status?: string;
        stock?: string;
    }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;

    const filters = {
        search: params?.search,
        category: params?.category,
        status: params?.status as "all" | "live" | "paused" | "archived" | undefined,
        stock: params?.stock as "all" | "inStock" | "lowStock" | "outOfStock" | undefined,
    };

    const [productsData, categories] = await Promise.all([
        getProducts(page, 10, filters),
        getCategories(),
    ]);

    return (
        <div>
            <InventoryFilters categories={categories} />
            <ProductList
                products={productsData.products}
                pagination={{
                    currentPage: productsData.currentPage,
                    totalPages: productsData.totalPages,
                }}
            />
        </div>
    );
}
