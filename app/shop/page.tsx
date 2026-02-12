import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/constants/site";

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ category?: string }>
}) {
    const { category } = await searchParams;
    const t = await getTranslations("Metadata.categories.all");
    const tTitles = await getTranslations("Shop.titles");

    const isValidCategory = category && ["rings", "bracelets", "necklaces", "earrings", "packs"].includes(category);

    const dynamicTitle = isValidCategory
        ? `${tTitles(category)} | FloraAccess`
        : t("title");

    const canonicalUrl = isValidCategory
        ? `/shop?category=${category}`
        : "/shop";

    return {
        title: dynamicTitle,
        description: t("description"),
        alternates: {
            canonical: canonicalUrl,
            languages: {
                "fr-TN": canonicalUrl,
                "en-TN": canonicalUrl,
                "x-default": canonicalUrl,
            },
        },
        openGraph: {
            title: dynamicTitle,
            description: t("description"),
            url: `${BASE_URL}${canonicalUrl}`,
            images: [
                {
                    url: "/logo.png",
                    width: 800,
                    height: 600,
                    alt: "FloraAccess Collection",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: dynamicTitle,
            description: t("description"),
            images: ["/logo.png"],
        },
    };
}

export default async function ShopPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="all"
            title={t("titles.all")}
            subtitle={t("subtitles.all")}
            searchParams={searchParams}
        />
    );
}
