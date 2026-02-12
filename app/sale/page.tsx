import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Metadata.sale");
    const BASE_URL = "https://www.floraaccess.tn";

    return {
        title: t("title"),
        description: t("description"),
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: `${BASE_URL}/sale`,
            images: [
                {
                    url: "/logo.png",
                    width: 800,
                    height: 600,
                    alt: "FloraAccess Sale Collection",
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
