import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations, getLocale } from "next-intl/server";
import { BASE_URL } from "@/lib/constants/site";

export async function generateMetadata() {
    const locale = await getLocale();
    const t = await getTranslations("Metadata.categories.rings");

    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/rings",
            languages: {
                "fr-TN": "/rings",
                "en-TN": "/rings",
                "x-default": "/rings",
            },
        },
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: `${BASE_URL}/rings`,
            siteName: "FloraAccess",
            images: [
                {
                    url: "/logo.png",
                    width: 587,
                    height: 581,
                    alt: "FloraAccess Rings Collection",
                },
            ],
            locale: locale.replace("-", "_"),
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            images: ["/logo.png"],
        },
    };
}

export default async function RingsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="rings"
            title={t("titles.rings")}
            subtitle={t("subtitles.rings")}
            searchParams={searchParams}
        />
    );
}
