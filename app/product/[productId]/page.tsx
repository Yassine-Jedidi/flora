import { getProduct, getProductsByCategory } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductDetails } from "@/components/shop/product-details";
import { ProductCard } from "@/components/shop/product-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";

export default async function ProductPage({
    params
}: {
    params: Promise<{ productId: string }>
}) {
    const { productId } = await params;
    const product = await getProduct(productId);

    if (!product || !product.isLive) {
        return notFound();
    }

    const allCategoryProducts = await getProductsByCategory(product.category.slug);
    const relatedProducts = allCategoryProducts
        .filter(p => p.id !== productId)
        .slice(0, 4);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4">
                    {/* Breadcrumbs / Back navigation */}
                    <div className="mb-12">
                        <Link
                            href={`/${product.category.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#8B7E84] hover:text-[#FF8BBA] transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                                <ChevronLeft className="w-4 h-4 text-[#8B7E84] group-hover:text-[#FF8BBA]" />
                            </div>
                            Back to {product.category.name}
                        </Link>
                    </div>

                    <ProductDetails product={product} />

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-32 pt-16 border-t border-pink-50">
                            <div className="flex flex-col items-center text-center space-y-4 mb-16">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#FF8BBA]" />
                                    <h2 className="text-3xl font-black text-[#3E343C]">You might also love</h2>
                                </div>
                                <p className="text-[#8B7E84] font-medium">Discover more handpicked treasures from our collection</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
