import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.categories.necklaces");
    return {
        title: t("title"),
        description: t("description")
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
