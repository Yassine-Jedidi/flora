import { getAllProducts } from "@/app/actions/get-products";
import { ProfitCalculator } from "@/components/admin/profit-calculator";

export default async function ProfitPage() {
    const products = await getAllProducts();

    return (
        <ProfitCalculator products={products} />
    );
}
