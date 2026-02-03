import { CategoryPage } from "@/components/shop/category-page";
import { getTranslations } from "next-intl/server";

export default async function BraceletsPage({
    searchParams
}: {
    searchParams: Promise<{ sort?: string }>
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
