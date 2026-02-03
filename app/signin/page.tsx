import { SignInForm } from "@/components/auth/signin-form";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.auth.signIn");
    return {
        title: t("title"),
        description: t("description")
    };
}

export default function SignInPage() {
    return <SignInForm />;
}
