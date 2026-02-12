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
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata({
    params
}: {
    params: Promise<{ productId: string }>
}): Promise<Metadata> {
    const { productId } = await params;
    const product = await getProduct(productId);

    if (!product || !product.isLive) {
        return {
            title: "Product Not Found",
        };
    }

    const description = product.description.slice(0, 160);

    return {
        title: product.name,
        description: description,
        openGraph: {
            title: `${product.name} | FloraAccess`,
            description: description,
            type: "article",
            url: `https://www.floraaccess.tn/product/${product.id}`,
            images: product.images.map(image => ({
                url: image.url,
                width: 1200,
                height: 630,
                alt: product.name,
            })),
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: description,
            images: product.images.map(image => image.url),
        },
    };
}

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

    const t = await getTranslations("Shop.product");

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images.map(img => img.url),
        "description": product.description,
        "sku": product.id,
        "offers": {
            "@type": "Offer",
            "url": `https://www.floraaccess.tn/product/${product.id}`,
            "priceCurrency": "TND",
            "price": product.discountedPrice ? product.discountedPrice.toString() : product.originalPrice.toString(),
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "7.000",
                    "currency": "TND"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "TN"
                }
            }
        },
        "brand": {
            "@type": "Brand",
            "name": "FloraAccess"
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        jsonLd,
                        {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Accueil",
                                    "item": "https://www.floraaccess.tn"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": product.category.name,
                                    "item": `https://www.floraaccess.tn/${product.category.slug}`
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": product.name,
                                    "item": `https://www.floraaccess.tn/product/${product.id}`
                                }
                            ]
                        }
                    ])
                }}
            />
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
                            {t("backTo", { category: product.category.name })}
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
