"use server";

import prisma from "@/lib/db";
import { OrderSchema, type OrderFormValues } from "@/lib/validations/order";

export async function createOrder(productId: string, values: OrderFormValues) {
    try {
        const validatedFields = OrderSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: "Données invalides." };
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return { error: "Produit non trouvé." };
        }

        const order = await prisma.order.create({
            data: {
                productId,
                fullName: values.fullName,
                phoneNumber: values.phoneNumber,
                governorate: values.governorate,
                city: values.city,
                detailedAddress: values.detailedAddress,
                totalPrice: product.price,
                status: "PENDING",
            }
        });

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error("Order creation error:", error);
        return { error: "Une erreur est survenue lors de la création de la commande." };
    }
}
