"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getAddresses() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
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
    return { success: false, error: "Failed to fetch addresses" };
  }
}

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
    return { success: false, error: "Not authenticated" };
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
    return { success: false, error: "Failed to create address" };
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
    return { success: false, error: "Not authenticated" };
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
    return { success: false, error: "Failed to update address" };
  }
}

export async function deleteAddress(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { success: false, error: "Not authenticated" };
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
    return { success: false, error: "Failed to delete address" };
  }
}
