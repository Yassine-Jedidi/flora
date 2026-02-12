import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.rings");
    const BASE_URL = "https://www.floraaccess.tn";

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: `${BASE_URL}/rings`,
            images: [
                {
                    url: "/logo.png",
                    width: 800,
                    height: 600,
                    alt: "FloraAccess Rings Collection",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: t("title"),
            description: t("description"),
            images: ["/logo.png"],
        },
    };
}

export default async function RingsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
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
