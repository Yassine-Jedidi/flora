import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.earrings");
    return {
        title: t("title"),
        description: t("description")
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
