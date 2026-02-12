"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations, useFormatter } from "next-intl";
import { Order } from "@/lib/types";
import { OrderStatusToggle } from "./order-status-toggle";
import { OrderStatus } from "@prisma/client";
import { PaginationControl } from "@/components/ui/pagination-control";


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
  const format = useFormatter();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[2rem] shadow-sm border border-pink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            {/* ... Table Header ... */}
            <TableHeader className="bg-pink-50/50">
              <TableRow className="hover:bg-transparent border-pink-100">
                <TableHead className="font-bold text-flora-dark text-xs md:text-sm">
                  {t("date")}
                </TableHead>
                <TableHead className="font-bold text-flora-dark text-xs md:text-sm">
                  {t("customer")}
                </TableHead>
                <TableHead className="hidden lg:table-cell font-bold text-flora-dark text-xs md:text-sm">
                  {t("items")}
                </TableHead>
                <TableHead className="font-bold text-flora-dark text-xs md:text-sm">
                  {t("total")}
                </TableHead>
                <TableHead className="hidden md:table-cell font-bold text-flora-dark text-xs md:text-sm">
                  {t("location")}
                </TableHead>
                <TableHead className="font-bold text-flora-dark text-xs md:text-sm">
                  {t("status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    {t("empty")}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-pink-50/10 border-pink-50"
                  >
                    <TableCell className="font-medium text-gray-600 whitespace-nowrap text-xs md:text-sm px-2 md:px-4 py-3 md:py-4">
                      <div className="flex flex-col">
                        <span>
                          {format.dateTime(new Date(order.createdAt), {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format.dateTime(new Date(order.createdAt), {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-flora-dark">
                          {order.fullName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.phoneNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-gray-600 font-medium max-w-[250px] px-2 md:px-4 py-3 md:py-4">
                      <div className="flex flex-col gap-1">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between gap-4 text-xs"
                          >
                            <span className="truncate flex-1">
                              {item.product.name}
                            </span>
                            <span className="font-bold shrink-0">
                              {item.quantity} x {Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs md:text-sm px-2 md:px-4 py-3 md:py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-400">
                          {(Number(order.totalPrice) - (order.shippingCost || 0)).toFixed(2)} DT
                        </span>
                        <span className="text-gray-400">
                          + {(order.shippingCost || 0).toFixed(2)} {t("ship")}
                        </span>
                        <span className="font-bold text-primary border-t border-pink-100 pt-0.5 mt-0.5">
                          {Number(order.totalPrice).toFixed(2)} DT
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm text-gray-600">
                        <span>
                          {order.city}, {order.governorate}
                        </span>
                        <span
                          className="text-xs text-gray-400 truncate max-w-[150px]"
                          title={order.detailedAddress}
                        >
                          {order.detailedAddress}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrderStatusToggle
                        orderId={order.id}
                        currentStatus={order.status as OrderStatus}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && (
        <PaginationControl
          total={pagination.total}
          totalPages={pagination.totalPages}
          currentPage={pagination.currentPage}
          showSinglePage={true}
        />
      )}
    </div>
  );
}

