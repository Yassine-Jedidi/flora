"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export async function getAddresses() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("unauthenticated") };
  }

  try {
    const addresses = await db.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: "desc",
      },
    });

    return { success: true, data: addresses };
  } catch (error) {
    console.error("[GET_ADDRESSES]", error);
    const t = await getTranslations("Errors.addresses");
    return { success: false, error: t("fetchError") };
  }
}

import { AddressSchema } from "@/lib/validations/order";

export async function createAddress(values: {
  name: string;
  fullName: string;
  phoneNumber: string;
  governorate: string;
  city: string;
  detailedAddress: string;
  isDefault?: boolean;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("unauthenticated") };
  }

  // Validate values
  const validatedFields = AddressSchema.safeParse(values);
  if (!validatedFields.success) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("validation") };
  }

  try {
    // If setting as default, unset other defaults
    if (values.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const addressCount = await db.address.count({
      where: { userId: session.user.id },
    });

    const t = await getTranslations("Errors.addresses");

    if (addressCount >= 4) {
      return {
        success: false,
        error: t("limitReached"),
      };
    }

    const address = await db.address.create({
      data: {
        ...values,
        userId: session.user.id,
        isDefault: values.isDefault || addressCount === 0, // Set as default if first address
      },
    });

    revalidatePath("/profile");
    return { success: true, data: address };
  } catch (error) {
    console.error("[CREATE_ADDRESS]", error);
    const t = await getTranslations("Errors.addresses");
    return { success: false, error: t("createError") };
  }
}

export async function updateAddress(
  id: string,
  values: {
    name?: string;
    fullName?: string;
    phoneNumber?: string;
    governorate?: string;
    city?: string;
    detailedAddress?: string;
    isDefault?: boolean;
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("unauthenticated") };
  }

  // Validate partial values
  const validatedFields = AddressSchema.partial().safeParse(values);
  if (!validatedFields.success) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("validation") };
  }

  try {
    if (values.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await db.address.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: values,
    });

    revalidatePath("/profile");
    return { success: true, data: address };
  } catch (error) {
    console.error("[UPDATE_ADDRESS]", error);
    const t = await getTranslations("Errors.addresses");
    return { success: false, error: t("updateError") };
  }
}

export async function deleteAddress(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const t = await getTranslations("Errors");
    return { success: false, error: t("unauthenticated") };
  }

  try {
    await db.address.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_ADDRESS]", error);
    const t = await getTranslations("Errors.addresses");
    return { success: false, error: t("deleteError") };
  }
}
