import { getProduct } from "@/app/actions/get-products";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProductDetails } from "@/components/shop/product-details";
import { RelatedProducts } from "@/components/shop/related-products";
import { RelatedProductsSkeleton } from "@/components/shop/related-products-skeleton";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react";

export default async function ProductPage({
    params
}: {
    params: Promise<{ productId: string }>
}) {
    const { productId } = await params;

    // We only await the main product data
    const product = await getProduct(productId);

    if (!product || !product.isLive) {
        return notFound();
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4">
                    {/* Breadcrumbs / Back navigation */}
                    <div className="mb-12">
                        <Link
                            href={`/${product.category.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#8B7E84] hover:text-primary transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                                <ChevronLeft className="w-4 h-4 text-[#8B7E84] group-hover:text-primary" />
                            </div>
                            Back to {product.category.name}
                        </Link>
                    </div>

                    <ProductDetails product={product} />

                    {/* Related Products Section wrapped in Suspense */}
                    <Suspense fallback={<RelatedProductsSkeleton />}>
                        <RelatedProducts categoryId={product.categoryId} productId={product.id} />
                    </Suspense>
                </div>
            </main>

            <Footer />
        </div>
    );
}
