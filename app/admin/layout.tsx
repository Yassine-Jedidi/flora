import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[#FDF8FA]">
            <Navbar />
            <main className="flex-1 container mx-auto pt-36 pb-12 px-4">
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

                    <AdminNav />

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
