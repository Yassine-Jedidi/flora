import { ShippingContent } from "@/components/shipping/shipping-content";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.shipping");
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: "/shipping",
            languages: {
                "fr-TN": "/shipping",
                "en-TN": "/shipping",
                "x-default": "/shipping",
            },
        },
    };
}

export default function ShippingPage() {
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
                                "name": "Livraison",
                                "item": "https://www.floraaccess.tn/shipping"
                            }
                        ]
                    })
                }}
            />
            <ShippingContent />
        </>
    );
}
