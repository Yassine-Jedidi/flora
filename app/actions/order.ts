"use server";

import prisma from "@/lib/db";
import { OrderSchema, type OrderValues } from "@/lib/validations/order";
import { revalidatePath } from "next/cache";
import { Prisma, OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTranslations, getLocale } from "next-intl/server";

import { checkRateLimit } from "@/lib/rate-limit";
import { SHIPPING_COST } from "@/lib/constants/shipping";

export async function createOrder(values: OrderValues) {
  try {
    const t = await getTranslations("Errors.orders");

    // Get session first to use userId for rate limiting (prevents IP spoofing)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check rate limit with userId if authenticated
    const rateLimit = await checkRateLimit({
      key: "order-creation",
      window: 60 * 10, // 10 minutes
      max: 3, // 3 orders every 10 minutes
      userId: session?.user?.id,
    });

    if (!rateLimit.success) {
      return {
        error: t("rateLimit", { message: rateLimit.message || "" }),
      };
    }

    // Validate all fields including items and totalPrice
    const validatedFields = OrderSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: t("invalidData"),
      };
    }

    const validatedData = validatedFields.data;

    // Security: Re-calculate prices from DB to prevent tampering
    const productIds = validatedData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Stock validation: Check if all products have sufficient stock
    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return { error: t("productNotFound") };
      }
      if (product.stock < item.quantity) {
        return { error: t("outOfStock", { product: product.name, stock: product.stock }) };
      }
    }

    let recomputedSubtotal = new Prisma.Decimal(0);
    const finalItems = validatedData.items.map((item) => {
      const dbProduct = products.find((p) => p.id === item.productId);
      if (!dbProduct) throw new Error(`Product ${item.productId} not found`);

      const price = dbProduct.discountedPrice ?? dbProduct.originalPrice;
      recomputedSubtotal = recomputedSubtotal.add(price.mul(item.quantity));

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: price,
      };
    });

    // Total price = items subtotal + shipping cost
    const shippingCost = new Prisma.Decimal(SHIPPING_COST);
    const recomputedTotalPrice = recomputedSubtotal.add(shippingCost);

    // Get user's locale to store with the order
    const locale = await getLocale();

    // Use transaction to ensure atomic order creation and stock decrement
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: session?.user?.id,
          fullName: validatedData.fullName,
          phoneNumber: validatedData.phoneNumber,
          governorate: validatedData.governorate,
          city: validatedData.city,
          detailedAddress: validatedData.detailedAddress,
          totalPrice: recomputedTotalPrice,
          shippingCost: shippingCost,
          status: "PENDING",
          language: locale,
          items: {
            create: finalItems,
          },
        },
      });

      // Decrement stock for each item
      for (const item of finalItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    // Send order confirmation email if user is logged in
    if (session?.user?.email) {
      try {
        // Map verified items for email (using trusted server-side data)
        const emailItems = finalItems.map((item) => {
          // Reuse 'products' from the validation step (line 46)
          const product = products.find((p) => p.id === item.productId);
          return {
            name: product?.name || "Product Item",
            quantity: item.quantity,
            price: item.price.toNumber(),
          };
        });

        const { sendOrderConfirmationEmail } = await import("@/lib/mail");

        // Fire-and-forget pattern: We intentionally don't await to avoid blocking the UI.
        // The catch handler is properly attached and will log any email sending errors.
        // Email failures won't affect order creation success since the order is already saved.
        sendOrderConfirmationEmail({
          orderId: order.id,
          userEmail: session.user.email,
          userName: session.user.name ?? validatedData.fullName,
          totalPrice: recomputedTotalPrice.toNumber(),
          shippingCost: shippingCost.toNumber(),
          items: emailItems,
          shippingAddress: {
            fullName: validatedData.fullName,
            governorate: validatedData.governorate,
            city: validatedData.city,
            detailedAddress: validatedData.detailedAddress,
          },
          locale,
        }).catch((err: Error) => console.error("Email background error:", err));
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
    const t = await getTranslations("Errors.orders");
    return { error: t("createError") };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { error: t("unauthorized") || "Unauthorized" };
    }

    // Check ownership or admin status
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });

    if (!existingOrder) {
      const t = await getTranslations("Errors.orders");
      return { error: t("notFound") };
    }

    const isOwner = existingOrder.userId === session.user.id;

    // Direct DB check for role to avoid stale sessions
    const userRole = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = userRole?.role === "admin";

    if (!isOwner && !isAdmin) {
      const t = await getTranslations("Errors");
      return { error: t("unauthorized") || "Unauthorized" };
    }

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

        // Fire-and-forget pattern: Email sending happens in the background.
        // Errors are logged but don't affect the order status update success.
        // Uses the language stored at order creation time, not the admin's browser locale.
        sendOrderDeliveredEmail({
          orderId: order.id,
          userEmail: order.user.email,
          userName: order.user.name ?? "there",
          locale: order.language,
        }).catch((err: Error) =>
          console.error("Delivered Email background error:", err),
        );
      } catch (emailError) {
        console.error("Failed to initiate order delivered email:", emailError);
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("Update Order Status error:", error);
    const t = await getTranslations("Errors.orders");
    return { error: t("updateStatusError") };
  }
}

export async function getUserOrders(page: number = 1, pageSize: number = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { error: t("unauthenticated") };
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
        shippingCost: order.shippingCost.toNumber(),
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
    const t = await getTranslations("Errors.orders");
    return { error: t("fetchError") };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      const t = await getTranslations("Errors");
      return { error: t("unauthenticated") };
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
      const t = await getTranslations("Errors.orders");
      return { error: t("notFound") };
    }

    return {
      success: true,
      order: {
        ...order,
        totalPrice: order.totalPrice.toNumber(),
        shippingCost: order.shippingCost.toNumber(),
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
    const t = await getTranslations("Errors.orders");
    return { error: t("fetchSingleError") };
  }
}
