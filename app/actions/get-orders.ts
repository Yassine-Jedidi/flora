"use server";

import prisma from "@/lib/db";

export async function getOrders(page: number = 1, pageSize: number = 10) {
    try {
        const skip = (page - 1) * pageSize;
        
        const [total, orders] = await prisma.$transaction([
            prisma.order.count(),
            prisma.order.findMany({
                include: {
                    product: {
                        select: {
                            name: true,
                            price: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: pageSize,
                skip: skip,
            })
        ]);

        const mappedOrders = orders.map(order => ({
            ...order,
            totalPrice: order.totalPrice.toNumber(),
            product: {
                ...order.product,
                price: order.product.price.toNumber()
            }
        }));

        return {
            orders: mappedOrders,
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page
        };
    } catch (error) {
        console.error("Failed to fetch orders:", error);
        return {
            orders: [],
            total: 0,
            totalPages: 0,
            currentPage: 1
        };
    }
}
