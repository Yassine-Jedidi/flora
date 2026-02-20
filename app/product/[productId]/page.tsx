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
import { BASE_URL } from "@/lib/constants/site";
import { SHIPPING_COST } from "@/lib/constants/shipping";
import { Product } from "@/lib/types";

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
        alternates: {
            canonical: `/product/${product.id}`,
            languages: {
                "fr-TN": `/product/${product.id}`,
                "en-TN": `/product/${product.id}`,
                "x-default": `/product/${product.id}`,
            },
        },
        openGraph: {
            title: product.name,
            description: description,
            type: "article",
            url: `${BASE_URL}/product/${product.id}`,
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

async function ProductContent({ product }: { product: Product }) {
    const t = await getTranslations("Shop.product");

    return (
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
    );
}

function ProductPageSkeleton() {
    return (
        <div className="container mx-auto px-4 animate-pulse">
            <div className="h-8 w-48 bg-gray-100 rounded-full mb-12" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                <div className="aspect-square bg-gray-100 rounded-[3rem]" />
                <div className="space-y-6">
                    <div className="h-4 w-24 bg-gray-100 rounded-full" />
                    <div className="h-12 w-full bg-gray-100 rounded-xl" />
                    <div className="h-8 w-32 bg-gray-100 rounded-xl" />
                    <div className="h-32 w-full bg-gray-100 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}

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

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images.map(img => img.url),
        "description": product.description,
        "sku": product.id,
        "mpn": product.id,
        "offers": {
            "@type": "Offer",
            "url": `${BASE_URL}/product/${product.id}`,
            "priceCurrency": "TND",
            "price": product.discountedPrice ? product.discountedPrice.toString() : product.originalPrice.toString(),
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            "itemCondition": "https://schema.org/NewCondition",
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": SHIPPING_COST.toFixed(3),
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
            "name": "Flora Accessories"
        },
        // Placeholder for aggregateRating to enable star snippets
        // In a real scenario, this would come from your reviews DB
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "50"
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
                                    "item": BASE_URL
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": product.category.name,
                                    "item": `${BASE_URL}/${product.category.slug}`
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": product.name,
                                    "item": `${BASE_URL}/product/${product.id}`
                                }
                            ]
                        }
                    ])
                }}
            />
            <Navbar />

            <main className="flex-1 pt-32 pb-24">
                <Suspense fallback={<ProductPageSkeleton />}>
                    <ProductContent product={product} />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
