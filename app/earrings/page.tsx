import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.earrings");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/earrings",
            languages: {
                "fr-TN": "/earrings",
                "en-TN": "/earrings",
                "x-default": "/earrings",
            },
        },
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: "/earrings",
            siteName: "FloraAccess",
            images: [
                {
                    url: "/logo.png",
                    width: 1200,
                    height: 630,
                    alt: "FloraAccess Jewelry Tunisia",
                },
            ],
            locale: "fr_TN",
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

export default async function EarringsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
}) {
    const t = await getTranslations("Shop");
    return (
        <CategoryPage
            categorySlug="earrings"
            title={t("titles.earrings")}
            subtitle={t("subtitles.earrings")}
            searchParams={searchParams}
        />
    );
}
