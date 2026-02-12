import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.auth.forgotPassword");
    return {
        title: t("title"),
        description: t("description"),
        robots: { index: false, follow: false }
    };
}

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
