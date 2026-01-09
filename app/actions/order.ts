"use server";

import prisma from "@/lib/db";
import { OrderSchema, type OrderFormValues } from "@/lib/validations/order";

export async function createOrder(values: OrderFormValues & { items: { productId: string; quantity: number; price: number }[]; totalPrice: number }) {
    try {
        const validatedFields = OrderSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: "Invalid data." };
        }

        if (!values.items || values.items.length === 0) {
            return { error: "Your cart is empty." };
        }

        const order = await prisma.order.create({
            data: {
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                governorate: values.governorate,
                city: values.city,
                detailedAddress: values.detailedAddress,
                totalPrice: values.totalPrice,
                status: "PENDING",
                items: {
                    create: values.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Order creation error:", error);
        return { error: "An error occurred while creating the order." };
    }
}
