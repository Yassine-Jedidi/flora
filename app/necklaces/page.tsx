import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.necklaces");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/necklaces",
        },
        openGraph: {
            title: `${t("title")} | FloraAccess`,
            description: t("description"),
            url: "/necklaces",
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

export default async function NecklacesPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
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
