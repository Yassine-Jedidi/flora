import { getProductsByCategory } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { SortToggle } from "@/components/shop/sort-toggle";

export default async function RingsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const { sort } = await searchParams;
    const products = await getProductsByCategory("rings", sort || "popular");

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1">
                {/* Image-Matched Header */}
                <div className="relative overflow-hidden bg-[#FFF5F8] pt-24 pb-20">
                    {/* Dotted Pattern Background */}
                    <div
                        className="absolute inset-0 opacity-[0.4]"
                        style={{
                            backgroundImage: `radial-gradient(#FF8BBA 0.5px, transparent 0.5px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />

                    {/* Decorative Floating Squares */}
                    <style>{`
                        @keyframes bounce-high {
                            0%, 100% { transform: translateY(-50%) rotate(-6deg); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                            50% { transform: translateY(50%) rotate(-6deg); animation-timing-function: cubic-bezier(0,0,0.2,1); }
                        }
                    `}</style>
                    <div className="absolute top-1/4 left-[15%] w-10 h-10 bg-gradient-to-br from-white to-[#D2B48C] rotate-12 rounded-sm shadow-sm opacity-60 animate-bounce [animation-duration:3s]" />
                    <div className="absolute top-1/3 right-[12%] w-8 h-8 bg-gradient-to-tr from-white to-[#BC8F8F] rounded-sm shadow-sm opacity-50 [animation:bounce-high_4s_infinite]" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tight leading-none">
                                <span className="text-[#FF8BBA]">Rings</span>{" "}
                                <span className="text-[#3E343C]">Collection</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <p className="text-[#8B7E84] text-lg font-medium tracking-wide">
                                    Adorn your fingers with a touch of magic and sparkle
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Count Row */}
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center justify-between border-b border-pink-50 pb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-[#3E343C]">Jewelry Boutique</span>
                            <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                {products.length} Items
                            </span>
                        </div>

                        <SortToggle />
                    </div>
                </div>

                {/* Simplified Grid */}
                <div className="container mx-auto px-4 pb-24">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 bg-gray-50 rounded-3xl border border-gray-100">
                            <p className="text-lg text-gray-500 font-medium">New collection arriving soon.</p>
                        </div>
                    ) : (
                        <div key={sort} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
