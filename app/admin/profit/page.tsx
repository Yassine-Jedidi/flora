import { getProducts } from "@/app/actions/get-products";
import { ProfitCalculator } from "@/components/admin/profit-calculator";

export default async function ProfitPage() {
    const products = await getProducts();

    return (
        <ProfitCalculator products={products} />
    );
}
