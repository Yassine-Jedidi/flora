import { getCategories, seedCategories } from "@/app/actions/product";
import { getProducts } from "@/app/actions/get-products";
import { ProductForm } from "@/components/admin/product-form";
import { ProductList } from "@/components/admin/product-list";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ListTodo } from "lucide-react";

export default async function AdminPage() {
    let categories = await getCategories();
    const products = await getProducts();

    // If no categories exist, seed some defaults automatically for the user
    if (categories.length === 0) {
        await seedCategories();
        categories = await getCategories();
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FDF8FA]">
            <Navbar />
            <main className="flex-1 container mx-auto py-12 px-4">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="bg-pink-100 text-[#FF8BBA] px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-sm">
                            Admin Dashboard
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366]">
                            Treasure Management ✨
                        </h1>
                        <p className="text-gray-500 max-w-lg">
                            Manage your beautiful collection and list new accessories for your customers.
                        </p>
                    </div>

                    <Tabs defaultValue="add" className="w-full">
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-white border border-pink-50 p-1.5 h-14 rounded-full shadow-lg shadow-pink-100/30">
                                <TabsTrigger
                                    value="add"
                                    className="rounded-full px-8 h-full data-[state=active]:bg-[#FF8BBA] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[#003366]"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add New Product
                                </TabsTrigger>
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
                            <ProductForm categories={categories} />
                        </TabsContent>

                        <TabsContent value="inventory" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ProductList products={products} />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
}
