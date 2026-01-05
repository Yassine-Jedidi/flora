import { getCategories, seedCategories } from "@/app/actions/product";
import { getProducts } from "@/app/actions/get-products";
import { ProductForm } from "@/components/admin/product-form";
import { ProductList } from "@/components/admin/product-list";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

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
            <main className="flex-1 container mx-auto py-16 px-4">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="space-y-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-pink-100 text-[#FF8BBA] px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">
                                Admin Dashboard
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-[#003366]">
                                Add New Treasure ✨
                            </h1>
                            <p className="text-gray-500 max-w-lg">
                                Fill in the details below to add a new accessory to your beautiful collection.
                            </p>
                        </div>

                        <ProductForm categories={categories} />
                    </div>

                    <div className="space-y-8">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <h2 className="text-2xl font-bold text-[#003366]">Your Inventory</h2>
                            <p className="text-sm text-gray-500">Manage your recently listed accessories here.</p>
                        </div>

                        <ProductList products={products} />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
