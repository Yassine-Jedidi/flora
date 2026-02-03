import { ResetPasswordClient } from "@/components/auth/reset-password-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.auth.resetPassword");
    return {
        title: t("title"),
        description: t("description")
    };
}

export default function ResetPasswordPage() {
    return <ResetPasswordClient />;
}
