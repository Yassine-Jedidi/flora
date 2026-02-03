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
    return <FAQClient />;
}
