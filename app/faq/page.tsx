import { FAQClient } from "@/components/faq/faq-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.faq");
    return {
        title: t("title"),
        description: t("description")
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
                                "item": "https://www.floraaccess.tn"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "FAQ",
                                "item": "https://www.floraaccess.tn/faq"
                            }
                        ]
                    })
                }}
            />
            <FAQClient />
        </>
    );
}
