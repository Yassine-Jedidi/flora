import { SearchContent } from "@/components/search/search-content";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;
    const t = await getTranslations("Metadata.search");

    return {
        title: q ? `${q} | ${t("title")}` : t("title"),
        description: t("description")
    };
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;
    return <SearchContent query={q} />;
}
