import { getProductsByCategory } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/shop/product-card";
import { SortToggle } from "@/components/shop/sort-toggle";

interface CategoryPageProps {
    categorySlug: string;
    title: string;
    subtitle: string;
    searchParams: Promise<{ sort?: string }>;
}

export async function CategoryPage({
    categorySlug,
    title,
    subtitle,
    searchParams
}: CategoryPageProps) {
    const { sort } = await searchParams;
    const products = await getProductsByCategory(categorySlug, sort || "popular");

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-32">
                {/* Image-Matched Header */}
                <div className="relative overflow-hidden bg-[#FFF5F8] pt-40 pb-20">
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
                                <span className="text-[#FF8BBA]">{title}</span>{" "}
                                <span className="text-[#3E343C]">Collection</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <p className="text-[#8B7E84] text-lg font-medium tracking-wide">
                                    {subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter & Count Row */}
                <div className="container mx-auto px-4 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-pink-50 pb-8 gap-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🎀</span>
                                <span className="text-2xl font-black text-[#FF8BBA] tracking-tight">The Flora Gallery</span>
                            </div>
                            <p className="text-[10px] font-black text-[#8B7E84]/60 uppercase tracking-[0.3em]">
                                {products.length} {products.length === 1 ? 'item' : 'items'}
                            </p>
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
                        <div key={sort || 'popular'} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
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
