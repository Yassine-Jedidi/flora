import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

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
