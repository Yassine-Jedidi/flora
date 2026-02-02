"use server";

import prisma from "@/lib/db";
import { OrderSchema, type OrderValues } from "@/lib/validations/order";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { checkRateLimit } from "@/lib/rate-limit";

export async function createOrder(values: OrderValues) {
  try {
    // Check rate limit inside try block for unified error handling
    const rateLimit = await checkRateLimit({
      key: "order-creation",
      window: 60 * 10, // 10 minutes
      max: 3, // 3 orders every 10 minutes
    });

    if (!rateLimit.success) {
      return {
        error: `Too many orders. Please try again in ${rateLimit.message}.`,
      };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Validate all fields including items and totalPrice
    const validatedFields = OrderSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error:
          "Invalid order data. Please check your cart and shipping details.",
      };
    }

    const validatedData = validatedFields.data;

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id,
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber,
        governorate: validatedData.governorate,
        city: validatedData.city,
        detailedAddress: validatedData.detailedAddress,
        totalPrice: validatedData.totalPrice,
        status: "PENDING",
        items: {
          create: validatedData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Send order confirmation email if user is logged in
    if (session?.user?.email) {
      try {
        // Fetch product names for the email summary
        const productIds = validatedData.items.map((item) => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        });

        // Map product names to order items
        const emailItems = validatedData.items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            name: product?.name || "Product Item",
            quantity: item.quantity,
            price: item.price,
          };
        });

        const { sendOrderConfirmationEmail } = await import("@/lib/mail");

        // We don't await this to avoid blocking the UI, but it will run in the background
        sendOrderConfirmationEmail({
          orderId: order.id,
          userEmail: session.user.email,
          userName: session.user.name,
          totalPrice: validatedData.totalPrice,
          items: emailItems,
          shippingAddress: {
            fullName: validatedData.fullName,
            governorate: validatedData.governorate,
            city: validatedData.city,
            detailedAddress: validatedData.detailedAddress,
          },
        }).catch((err) => console.error("Email background error:", err));
      } catch (emailError) {
        console.error(
          "Failed to initiate order confirmation email:",
          emailError,
        );
        // We don't return an error here because the order was already successfully created
      }
    }

    // If user is logged in and wants to save the address
    if (session && validatedData.saveAddress) {
      // ... existing address logic ...
      const addressCount = await prisma.address.count({
        where: { userId: session.user.id },
      });

      await prisma.address.create({
        data: {
          userId: session.user.id,
          name: `Address ${addressCount + 1}`,
          fullName: validatedData.fullName,
          phoneNumber: validatedData.phoneNumber,
          governorate: validatedData.governorate,
          city: validatedData.city,
          detailedAddress: validatedData.detailedAddress,
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
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
      },
    });

    // Send order delivered email if status is DELIVERED and user is logged in
    if (status === "DELIVERED" && order.user?.email) {
      try {
        const { sendOrderDeliveredEmail } = await import("@/lib/mail");

        // Background task
        sendOrderDeliveredEmail({
          orderId: order.id,
          userEmail: order.user.email,
          userName: order.user.name,
        }).catch((err) =>
          console.error("Delivered Email background error:", err),
        );
      } catch (emailError) {
        console.error("Failed to initiate order delivered email:", emailError);
      }
    }

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

export async function getOrderById(orderId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Not authenticated" };
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id, // Security: Ensure this order belongs to the user
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
    });

    if (!order) {
      return { error: "Order not found" };
    }

    return {
      success: true,
      order: {
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
      },
    };
  } catch (error) {
    console.error("Fetch Order error:", error);
    return { error: "An error occurred while fetching the order." };
  }
}
