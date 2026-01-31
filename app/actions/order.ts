"use server";

import prisma from "@/lib/db";
import { OrderSchema, type OrderFormValues } from "@/lib/validations/order";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createOrder(
  values: OrderFormValues & {
    items: { productId: string; quantity: number; price: number }[];
    totalPrice: number;
  },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const validatedFields = OrderSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid data." };
    }

    if (!values.items || values.items.length === 0) {
      return { error: "Your cart is empty." };
    }

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id,
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        governorate: values.governorate,
        city: values.city,
        detailedAddress: values.detailedAddress,
        totalPrice: values.totalPrice,
        status: "PENDING",
        items: {
          create: values.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // If user is logged in and wants to save the address
    if (session && values.saveAddress) {
      // Check if address already exists for this user to avoid duplicates if possible,
      // but for simplicity we'll just create a new one with a default label
      const addressCount = await prisma.address.count({
        where: { userId: session.user.id },
      });

      await prisma.address.create({
        data: {
          userId: session.user.id,
          name: `Address ${addressCount + 1}`,
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          governorate: values.governorate,
          city: values.city,
          detailedAddress: values.detailedAddress,
          isDefault: addressCount === 0,
        },
      });
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Order creation error:", error);
    return { error: "An error occurred while creating the order." };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Update Order Status error:", error);
    return { error: "An error occurred while updating the order status." };
  }
}

export async function getUserOrders(page: number = 1, pageSize: number = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Not authenticated" };
    }

    const skip = (page - 1) * pageSize;

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.order.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: pageSize,
        skip: skip,
      }),
    ]);

    return {
      success: true,
      orders: orders.map((order) => ({
        ...order,
        totalPrice: order.totalPrice.toNumber(),
        items: order.items.map((item) => ({
          ...item,
          price: item.price.toNumber(),
          product: {
            ...item.product,
            originalPrice: item.product.originalPrice.toNumber(),
            discountedPrice: item.product.discountedPrice?.toNumber() || null,
          },
        })),
      })),
      pagination: {
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Fetch User Orders error:", error);
    return { error: "An error occurred while fetching your orders." };
  }
}
