"use server";

import prisma from "@/lib/db";
import { OrderSchema, type OrderFormValues } from "@/lib/validations/order";

export async function createOrder(productId: string, values: OrderFormValues) {
    try {
        const validatedFields = OrderSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: "Invalid data." };
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return { error: "Product not found." };
        }

        const order = await prisma.order.create({
            data: {
                productId,
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                governorate: values.governorate,
                city: values.city,
                detailedAddress: values.detailedAddress,
                quantity: values.quantity,
                totalPrice: Number(product.price) * values.quantity,
                status: "PENDING",
            }
        });

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Order creation error:", error);
        return { error: "An error occurred while creating the order." };
    }
}
