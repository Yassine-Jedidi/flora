import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/inventory/product-form";
import { seedCategories } from "@/app/actions/product";
import { getProduct, getCategories } from "@/app/actions/get-products";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.admin.editProduct");
    return {
        title: t("title"),
        description: t("description")
    };
}

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;

    // Fetch Categories
    let categories = await getCategories();
    if (categories.length === 0) {
        await seedCategories();
        categories = await getCategories();
    }

    // Fetch Product
    const product = await getProduct(id);

    if (!product) {
        return notFound();
    }

    const initialData = {
        name: product.name,
        description: product.description,
        originalPrice: product.originalPrice,
        discountedPrice: product.discountedPrice || 0,
        stock: product.stock,
        categoryId: product.categoryId,
        isFeatured: product.isFeatured,
        isArchived: product.isArchived,
        isLive: product.isLive,
        images: product.images.map((img) => img.url),
        id: product.id,
    };

    return (
        <div className="container mx-auto py-10">
            <ProductForm
                categories={categories.map(c => ({ id: c.id, name: c.name }))}
                initialData={initialData}
            />
        </div>
    );
}
