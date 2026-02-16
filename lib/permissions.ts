"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const t = await getTranslations("Errors");
    return { error: t("unauthenticated"), session: null };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role?.toLowerCase() !== "admin") {
    const t = await getTranslations("Errors");
    return { error: t("unauthorized"), session: null };
  }

  return { error: null, session };
}
