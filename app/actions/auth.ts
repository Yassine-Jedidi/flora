"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export async function signUpEmailAction(values: {
  email: string;
  name: string;
  password: string;
}) {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: values.email,
        password: values.password,
        name: values.name,
      },
      headers: await headers(),
    });

    return { success: true, data: res };
  } catch (error: any) {
    const t = await getTranslations("Errors.auth");
    return {
      success: false,
      error: error.message || t("failedToCreate"),
    };
  }
}

export async function signInEmailAction(values: {
  email: string;
  password: string;
}) {
  try {
    const res = await auth.api.signInEmail({
      body: {
        email: values.email,
        password: values.password,
      },
      headers: await headers(),
    });

    return { success: true, data: res };
  } catch (error: any) {
    const t = await getTranslations("Errors.auth");
    return {
      success: false,
      error: error.message || t("invalidCredentials"),
    };
  }
}
