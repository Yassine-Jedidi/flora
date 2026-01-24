import { getCategories, seedCategories } from "@/app/actions/product";
import { getAvailableProducts } from "@/app/actions/pack";
import { PackForm } from "@/components/admin/pack-form";

export default async function NewPackPage() {
    let categories = await getCategories();
    const hasPacks = categories.some(c => c.slug === "packs");

    if (categories.length === 0 || !hasPacks) {
        await seedCategories();
        categories = await getCategories();
    }

    const availableProducts = await getAvailableProducts();

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 md:px-0">
            <PackForm
                categories={categories}
                availableProducts={availableProducts as any}
            />
        </div>
    );
}
