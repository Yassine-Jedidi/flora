import { ProfileClient } from "@/components/profile/profile-client";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.profile");
    return {
        title: t("title"),
        description: t("description"),
        robots: { index: false, follow: false }
    };
}

export default function ProfilePage() {
    return <ProfileClient />;
}
