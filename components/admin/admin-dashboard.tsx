"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ListTodo, Pencil } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { ProductList } from "@/components/admin/product-list";
import { ProductFormValues } from "@/lib/validations/product";

interface ProductImage {
    id: string;
    url: string;
}

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number | string;
    stock: number;
    categoryId: string;
    category: Category;
    images: ProductImage[];
    isFeatured: boolean;
    isArchived: boolean;
}

interface AdminDashboardProps {
    categories: Category[];
    products: Product[];
}

export function AdminDashboard({ categories, products }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState("inventory");
    const [editingProduct, setEditingProduct] = useState<(ProductFormValues & { id: string }) | null>(null);

    const handleEdit = (product: Product) => {
        // Prepare initial data for the form
        const initialData = {
            ...product,
            price: Number(product.price),
            images: product.images.map((img) => img.url),
        };
        setEditingProduct(initialData);
        setActiveTab("edit");
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setActiveTab("inventory");
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-10">
                <TabsList className="bg-white border border-pink-50 p-1.5 h-14 rounded-full shadow-lg shadow-pink-100/30">
                    <TabsTrigger
                        value="add"
                        className="rounded-full px-8 h-full data-[state=active]:bg-[#FF8BBA] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[#003366]"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add New Product
                    </TabsTrigger>

                    {editingProduct && (
                        <TabsTrigger
                            value="edit"
                            className="rounded-full px-8 h-full data-[state=active]:bg-[#FF8BBA] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[#003366]"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Product
                        </TabsTrigger>
                    )}

                    <TabsTrigger
                        value="inventory"
                        className="rounded-full px-8 h-full data-[state=active]:bg-[#FF8BBA] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[#003366]"
                    >
                        <ListTodo className="w-4 h-4 mr-2" />
                        Your Inventory
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="add" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProductForm
                    categories={categories}
                    onSuccess={() => setActiveTab("inventory")}
                />
            </TabsContent>

            {editingProduct && (
                <TabsContent value="edit" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProductForm
                        key={editingProduct.id}
                        categories={categories}
                        initialData={editingProduct}
                        onCancel={handleCancelEdit}
                        onSuccess={() => {
                            setEditingProduct(null);
                            setActiveTab("inventory");
                        }}
                    />
                </TabsContent>
            )}

            <TabsContent value="inventory" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProductList
                    products={products}
                    onEdit={handleEdit}
                />
            </TabsContent>
        </Tabs>
    );
}
