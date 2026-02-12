"use server";

import prisma from "@/lib/db";
import { Prisma, OrderStatus } from "@prisma/client";

export interface OrderFilters {
  search?: string;
  status?:
    | "all"
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
  governorate?: string;
  dateRange?: "all" | "today" | "week" | "month";
}

export async function getOrders(
  page: number = 1,
  pageSize: number = 10,
  filters?: OrderFilters,
) {
  try {
    const skip = (page - 1) * pageSize;

    // Build where clause based on filters
    const where: Prisma.OrderWhereInput = {};

    // Search filter (customer name or phone)
    if (filters?.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { phoneNumber: { contains: filters.search } },
      ];
    }

    // Status filter
    if (filters?.status && filters.status !== "all") {
      const statusMap: Record<string, OrderStatus> = {
        pending: OrderStatus.PENDING,
        confirmed: OrderStatus.CONFIRMED,
        shipped: OrderStatus.SHIPPED,
        delivered: OrderStatus.DELIVERED,
        cancelled: OrderStatus.CANCELLED,
      };
      where.status = statusMap[filters.status];
    }

    // Governorate filter
    if (filters?.governorate && filters.governorate !== "all") {
      where.governorate = filters.governorate;
    }

    // Date range filter
    if (filters?.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(0);
      }

      where.createdAt = { gte: startDate };
    }

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
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

    const mappedOrders = orders.map((order) => ({
      ...order,
      totalPrice: order.totalPrice.toNumber(),
      shippingCost: order.shippingCost.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toNumber(),
      })),
    }));

    return {
      orders: mappedOrders,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return {
      orders: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
}

// Get unique governorates for filter dropdown
export async function getOrderGovernorates(): Promise<string[]> {
  try {
    const governorates = await prisma.order.findMany({
      select: { governorate: true },
      distinct: ["governorate"],
      orderBy: { governorate: "asc" },
    });
    return governorates.map((g) => g.governorate);
  } catch (error) {
    console.error("Failed to fetch governorates:", error);
    return [];
  }
}
