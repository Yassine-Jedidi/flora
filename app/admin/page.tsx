import { getCategories, seedCategories } from "@/app/actions/product";
import { getProducts } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

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

                    <AdminDashboard
                        categories={categories.map(c => ({ id: c.id, name: c.name }))}
                        products={products}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
