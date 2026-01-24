import { getCategories, getProduct } from "@/app/actions/get-products";
import { getAvailableProducts } from "@/app/actions/pack";
import { PackForm } from "@/components/admin/pack-form";
import { notFound } from "next/navigation";

interface EditPackPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPackPage({ params }: EditPackPageProps) {
    const { id } = await params;

    const [categories, availableProducts, pack] = await Promise.all([
        getCategories(),
        getAvailableProducts(),
        getProduct(id),
    ]);

    if (!pack) {
        return notFound();
    }

    // Transform pack data to match PackFormValues
    // We need to extract the pack items into the expected format
    const initialData = {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        originalPrice: pack.originalPrice,
        discountedPrice: pack.discountedPrice || 0,
        stock: pack.stock,
        categoryId: pack.categoryId,
        isFeatured: pack.isFeatured,
        isArchived: pack.isArchived,
        isLive: pack.isLive,
        images: pack.images.map((img: any) => img.url),
        packItems: pack.packItems?.map(pi => ({
            itemId: pi.itemId,
            quantity: pi.quantity,
        })) || [],
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 md:px-0">
            <PackForm
                categories={categories}
                availableProducts={availableProducts as any}
                initialData={initialData as any}
            />
        </div>
    );
}
