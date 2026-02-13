import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
    const locale = await getLocale();
    const t = await getTranslations("Metadata.categories.packs");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/packs",
            languages: {
                "fr-TN": "/packs",
                "en-TN": "/packs",
                "x-default": "/packs",
            },
        },
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: "/packs",
            siteName: "FloraAccess",
            images: [
                {
                    url: "/logo.png",
                    width: 587,
                    height: 581,
                    alt: "FloraAccess Jewelry Tunisia",
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

export default async function PacksPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="packs"
            title={t("titles.packs")}
            subtitle={t("subtitles.packs")}
            searchParams={searchParams}
        />
    );
}
