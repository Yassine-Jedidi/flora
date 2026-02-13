"use client";

import { useTranslations } from "next-intl";
import { Order } from "@/lib/types";
import { PaginationControl } from "@/components/ui/pagination-control";
import { Package } from "lucide-react";
import { OrderMobileCard } from "./order-mobile-card";
import { OrderDesktopTable } from "./order-desktop-table";


interface OrderListProps {
  orders: Order[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

export function OrderList({ orders, pagination }: OrderListProps) {
  const t = useTranslations("Admin.orders.table");

  return (
    <div className="space-y-6">
      <div className="">
        {orders.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-pink-100 shadow-sm">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-pink-300" />
            </div>
            <p className="text-gray-500 font-medium">{t("empty")}</p>
          </div>
        ) : (
          <>
            {/* Mobile View - Card Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {orders.map((order) => (
                <OrderMobileCard key={order.id} order={order} />
              ))}
            </div>

            {/* Desktop View - Premium Table */}
            <OrderDesktopTable orders={orders} />
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-4 border border-pink-100/50">
          <PaginationControl
            total={pagination.total}
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            showSinglePage={true}
          />
        </div>
      )}
    </div>
  );
}
