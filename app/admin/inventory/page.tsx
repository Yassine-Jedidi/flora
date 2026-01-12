import { getProducts } from "@/app/actions/get-products";
import { ProductList } from "@/components/admin/product-list";

export default async function InventoryPage() {
    const products = await getProducts();

    return (
        <ProductList products={products} />
    );
}
