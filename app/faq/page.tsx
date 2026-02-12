import { FAQClient } from "@/components/faq/faq-client";
import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/constants/site";
import { SHIPPING_COST } from "@/lib/constants/shipping";

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

export default async function FAQPage() {
    const t = await getTranslations("FAQ");

    // Define FAQ Schema questions and answers
    const faqQuestions = [
        { q: t("questions.orderPlacementQ"), a: t("questions.orderPlacementA") },
        { q: t("questions.durabilityQ"), a: t("questions.durabilityA") },
        { q: t("questions.stockQ"), a: t("questions.stockA") },
        { q: t("questions.shippingCostQ"), a: t("questions.shippingCostA", { cost: SHIPPING_COST.toFixed(2) }) },
        { q: t("questions.deliveryTimeQ"), a: t("questions.deliveryTimeA") },
        { q: t("questions.openPackageQ"), a: t("questions.openPackageA") },
        { q: t("questions.paymentMethodsQ"), a: t("questions.paymentMethodsA") },
        { q: t("questions.bankTransferQ"), a: t("questions.bankTransferA") }
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify([
                        {
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
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": faqQuestions.map(item => ({
                                "@type": "Question",
                                "name": item.q,
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": item.a
                                }
                            }))
                        }
                    ])
                }}
            />
            <FAQClient />
        </>
    );
}
