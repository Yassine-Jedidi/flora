import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
    const locale = await getLocale();
    const t = await getTranslations("Metadata.categories.necklaces");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/necklaces",
            languages: {
                "fr-TN": "/necklaces",
                "en-TN": "/necklaces",
                "x-default": "/necklaces",
            },
        },
        openGraph: {
            title: t("title"),
            description: t("description"),
            url: "/necklaces",
            siteName: "Flora Accessories",
            images: [
                {
                    url: "/logo.png",
                    width: 587,
                    height: 581,
                    alt: "Flora Accessories Jewelry Tunisia",
                },
            ],
            locale: locale.replace("-", "_"),
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: t("title"),
            description: t("description"),
            images: ["/logo.png"],
        },
    };
}

export default async function NecklacesPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="necklaces"
            title={t("titles.necklaces")}
            subtitle={t("subtitles.necklaces")}
            searchParams={searchParams}
        />
    );
}
