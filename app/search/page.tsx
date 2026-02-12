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
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Accueil",
                                "item": "https://www.floraaccess.tn"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Recherche",
                                "item": "https://www.floraaccess.tn/search"
                            }
                        ]
                    })
                }}
            />
            <SearchContent query={q} />
        </>
    );
}
