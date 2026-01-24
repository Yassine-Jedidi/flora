import { ProductForm } from "@/components/admin/product-form";
import { getCategories, seedCategories } from "@/app/actions/product";

export default async function NewProductPage() {
    // Fetch Categories
    let categories = await getCategories();
    // Core categories we expect
    const coreSlugs = ["rings", "bracelets", "necklaces", "earrings", "packs"];
    const hasAllCore = coreSlugs.every(slug => categories.some(c => c.slug === slug));

    if (categories.length === 0 || !hasAllCore) {
        await seedCategories();
        categories = await getCategories();
    }

    return (
        <div className="container mx-auto py-10">
            <ProductForm
                categories={categories.map(c => ({ id: c.id, name: c.name }))}
            />
        </div>
    );
}
