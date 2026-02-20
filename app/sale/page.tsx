import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations, getLocale } from "next-intl/server";
import { Metadata } from "next";
import { BASE_URL } from "@/lib/constants/site";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations("Metadata.sale");

    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/sale",
            languages: {
                "fr-TN": "/sale",
                "en-TN": "/sale",
                "x-default": "/sale",
            },
        },
        openGraph: {
            title: t("title"),
            description: t("description"),
            url: `${BASE_URL}/sale`,
            siteName: "Flora Accessories",
            images: [
                {
                    url: "/logo.png",
                    width: 587,
                    height: 581,
                    alt: "Flora Accessories Sale Collection",
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

export default async function SalePage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="sale"
            isSale={true}
            title={t("titles.sale")}
            subtitle={t("subtitles.sale")}
            searchParams={searchParams}
        />
    );
}
