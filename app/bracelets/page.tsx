import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations, getLocale } from "next-intl/server";

export async function generateMetadata() {
    const locale = await getLocale();
    const t = await getTranslations("Metadata.categories.bracelets");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/bracelets",
            languages: {
                "fr-TN": "/bracelets",
                "en-TN": "/bracelets",
                "x-default": "/bracelets",
            },
        },
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: "/bracelets",
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

export default async function BraceletsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string; category?: string; page?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="bracelets"
            title={t("titles.bracelets")}
            subtitle={t("subtitles.bracelets")}
            searchParams={searchParams}
        />
    );
}
