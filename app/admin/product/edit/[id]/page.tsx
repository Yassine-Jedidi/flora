"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories, seedCategories } from "@/app/actions/product";
import { getProduct } from "@/app/actions/get-products";
import { ProductFormValues } from "@/lib/validations/product";

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [initialData, setInitialData] = useState<(ProductFormValues & { id: string }) | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                let cats = await getCategories();
                if (cats.length === 0) {
                    await seedCategories();
                    cats = await getCategories();
                }
                setCategories(cats.map(c => ({ id: c.id, name: c.name })));

                // Fetch Product
                const product = await getProduct(id);
                if (product) {
                    setInitialData({
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
                    });
                } else {
                    // Handle 404
                    router.push("/admin/inventory");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    if (loading) {
        return <div className="flex justify-center py-20">Loading...</div>;
    }

    if (!initialData) return null;

    return (
        <ProductForm
            categories={categories}
            initialData={initialData}
            onSuccess={() => router.push("/admin/inventory")}
            onCancel={() => router.push("/admin/inventory")}
        />
    );
}
