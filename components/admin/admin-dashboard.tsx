"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ListTodo, Pencil, ShoppingBag, Calculator } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { ProductList } from "@/components/admin/product-list";
import { OrderList } from "@/components/admin/order-list";
import { ProfitCalculator } from "@/components/admin/profit-calculator";
import { ProductFormValues } from "@/lib/validations/product";
import { Product, Order } from "@/lib/types";

interface AdminDashboardProps {
  categories: { id: string; name: string }[];
  products: Product[];
  orders: Order[];
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function AdminDashboard({
  categories,
  products,
  orders,
  pagination,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("orders");
  const [editingProduct, setEditingProduct] = useState<
    (ProductFormValues & { id: string }) | null
  >(null);

  const handleEdit = (product: Product) => {
    // Prepare initial data for the form
    const initialData = {
      name: product.name,
      description: product.description,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice || 0,
      stock: product.stock,
      categoryId: product.categoryId,
      isFeatured: product.isFeatured,
      isArchived: product.isArchived,
      images: product.images.map((img) => img.url),
      id: product.id,
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
            value="orders"
            className="rounded-full px-8 h-full data-[state=active]:bg-[#FF8BBA] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[#003366]"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Orders
          </TabsTrigger>

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

          <TabsTrigger
            value="profit"
            className="rounded-full px-8 h-full data-[state=active]:bg-[#FF8BBA] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[#003366]"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Profit Calc
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="orders"
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <OrderList orders={orders} pagination={pagination} />
      </TabsContent>

      <TabsContent
        value="add"
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <ProductForm
          categories={categories}
          onSuccess={() => setActiveTab("inventory")}
        />
      </TabsContent>

      {editingProduct && (
        <TabsContent
          value="edit"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
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

      <TabsContent
        value="inventory"
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <ProductList products={products} onEdit={handleEdit} />
      </TabsContent>

      <TabsContent
        value="profit"
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <ProfitCalculator products={products} />
      </TabsContent>
    </Tabs>
  );
}
