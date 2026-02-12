import { FAQClient } from "@/components/faq/faq-client";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/constants/site";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.faq");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/faq",
            languages: {
                "fr-TN": "/faq",
                "en-TN": "/faq",
                "x-default": "/faq",
            },
        },
    };
}

export default function FAQPage() {
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
                                "item": BASE_URL
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "FAQ",
                                "item": `${BASE_URL}/faq`
                            }
                        ]
                    })
                }}
            />
            <FAQClient />
        </>
    );
}
