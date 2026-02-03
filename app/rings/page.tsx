import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.rings");
    return {
        title: t("title"),
        description: t("description")
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
