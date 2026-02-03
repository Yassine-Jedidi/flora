import { SignUpForm } from "@/components/auth/signup-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.auth.signUp");
    return {
        title: t("title"),
        description: t("description")
    };
}

export default function SignUpPage() {
    return <SignUpForm />;
}
