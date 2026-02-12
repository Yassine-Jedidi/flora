import { SearchContent } from "@/components/search/search-content";
import { getTranslations } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;
    const t = await getTranslations("Metadata.search");

    return {
        title: q ? `${q} | ${t("title")}` : t("title"),
        description: t("description"),
        alternates: {
            canonical: "/search",
            languages: {
                "fr-TN": "/search",
                "en-TN": "/search",
                "x-default": "/search",
            },
        },
    };
}

function SearchSkeleton() {
    return (
        <div className="container mx-auto px-4 py-32">
            <div className="flex flex-col items-center mb-16">
                <Skeleton className="h-12 w-64 rounded-xl mb-4" />
                <Skeleton className="h-6 w-48 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />
                ))}
            </div>
        </div>
    );
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams;
    return (
        <div className="min-h-screen flex flex-col bg-white">
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
            <Navbar />
            <main className="flex-1">
                <Suspense fallback={<SearchSkeleton />}>
                    <SearchContent query={q} />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
}
