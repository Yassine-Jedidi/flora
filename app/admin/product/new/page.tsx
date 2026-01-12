"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories, seedCategories } from "@/app/actions/product";

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            let cats = await getCategories();
            if (cats.length === 0) {
                await seedCategories();
                cats = await getCategories();
            }
            setCategories(cats.map(c => ({ id: c.id, name: c.name })));
        };
        fetchCategories();
    }, []);

    return (
        <ProductForm
            categories={categories}
            onSuccess={() => router.push("/admin/inventory")}
        />
    );
}
