import { getRelatedProducts } from "@/app/actions/get-products";
import { ProductCard } from "./product-card";
import { Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface RelatedProductsProps {
    categoryId: string;
    productId: string;
}

export async function RelatedProducts({ categoryId, productId }: RelatedProductsProps) {
    const relatedProducts = await getRelatedProducts(categoryId, productId);
    const t = await getTranslations("Shop.related");

    if (relatedProducts.length === 0) return null;

    return (
        <div className="mt-32 pt-16 border-t border-pink-50">
            <div className="flex flex-col items-center text-center space-y-4 mb-16 px-4">
                <div className="flex items-center justify-center flex-wrap gap-2 md:gap-3">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary fill-[#FF8BBA]/10" />
                    <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tighter">
                        {t("title")}
                    </h2>
                </div>
                <p className="text-[#B08B9B] font-medium max-w-lg">
                    {t("subtitle")}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}
