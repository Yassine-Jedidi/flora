import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations, getLocale } from "next-intl/server";
import { BASE_URL } from "@/lib/constants/site";
import { isValidCategory } from "@/lib/constants/categories";

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ category?: string }>
}) {
    const locale = await getLocale();
    const { category } = await searchParams;
    const t = await getTranslations("Metadata.categories.all");
    const tTitles = await getTranslations("Shop.titles");

    const isValid = isValidCategory(category);

    const dynamicTitle = isValid
        ? `${tTitles(category as string)} | FloraAccess`
        : `${t("title")} | FloraAccess`;

    const canonicalUrl = isValid
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
            siteName: "FloraAccess",
            images: [
                {
                    url: "/logo.png",
                    width: 587,
                    height: 581,
                    alt: "FloraAccess Collection",
                },
            ],
            locale: locale.replace("-", "_"),
            type: "website",
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
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    const { category } = await searchParams;
    const t = await getTranslations("Shop");
    const tTitles = await getTranslations("Shop.titles");

    const isValid = isValidCategory(category);

    const title = isValid
        ? tTitles(category as string)
        : t("titles.all");

    const subtitle = isValid
        ? t(`subtitles.${category}`)
        : t("subtitles.all");

    return (
        <CategoryPage
            categorySlug="all"
            title={title}
            subtitle={subtitle}
            searchParams={searchParams}
        />
    );
}
