import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.packs");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/packs",
        },
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: "/packs",
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

export default async function PacksPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
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
