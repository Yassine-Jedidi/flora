import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.admin");
    return {
        title: t("title"),
        description: t("description"),
        robots: { index: false, follow: false }
    };
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const t = await getTranslations("Admin.layout");

    return (
        <div className="min-h-screen flex flex-col bg-[#FDF8FA]">
            <Navbar />
            <main className="flex-1 container mx-auto pt-36 pb-12 px-4">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="bg-pink-100 text-primary px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-sm">
                            {t("badge")}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-flora-dark">
                            {t("title")}
                        </h1>
                        <p className="text-gray-500 max-w-lg">
                            {t("subtitle")}
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
