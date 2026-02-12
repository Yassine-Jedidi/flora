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
            title: `${product.name} | FloraAccess`,
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

async function ProductContentWrapper({ productId }: { productId: string }) {
    const product = await getProduct(productId);
    if (!product || !product.isLive) return notFound();
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
    const productForLd = await getProduct(productId);

    if (!productForLd || !productForLd.isLive) {
        return notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productForLd.name,
        "image": productForLd.images.map(img => img.url),
        "description": productForLd.description,
        "sku": productForLd.id,
        "offers": {
            "@type": "Offer",
            "url": `${BASE_URL}/product/${productForLd.id}`,
            "priceCurrency": "TND",
            "price": productForLd.discountedPrice ? productForLd.discountedPrice.toString() : productForLd.originalPrice.toString(),
            "availability": productForLd.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
                                    "item": BASE_URL
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": productForLd.category.name,
                                    "item": `${BASE_URL}/${productForLd.category.slug}`
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": productForLd.name,
                                    "item": `${BASE_URL}/product/${productForLd.id}`
                                }
                            ]
                        }
                    ])
                }}
            />
            <Navbar />

            <main className="flex-1 pt-32 pb-24">
                <Suspense fallback={<ProductPageSkeleton />}>
                    <ProductContentWrapper productId={productId} />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
}
