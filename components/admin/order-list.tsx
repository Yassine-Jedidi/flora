"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";
import { OrderStatusToggle } from "./order-status-toggle";
import { OrderStatus } from "@prisma/client";

interface OrderListProps {
  orders: Order[];
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function OrderList({ orders, pagination }: OrderListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[2rem] shadow-sm border border-pink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            {/* ... Table Header ... */}
            <TableHeader className="bg-pink-50/50">
              <TableRow className="hover:bg-transparent border-pink-100">
                <TableHead className="font-bold text-[#003366]">
                  Date & Time
                </TableHead>
                <TableHead className="font-bold text-[#003366]">
                  Customer
                </TableHead>
                <TableHead className="font-bold text-[#003366]">
                  Items (Qty x Price)
                </TableHead>
                <TableHead className="font-bold text-[#003366]">
                  Total Price
                </TableHead>
                <TableHead className="font-bold text-[#003366]">
                  Location
                </TableHead>
                <TableHead className="font-bold text-[#003366]">
                  Status
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
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-pink-50/10 border-pink-50"
                  >
                    <TableCell className="font-medium text-gray-600 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(order.createdAt), "HH:mm")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#003366]">
                          {order.fullName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {order.phoneNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium max-w-[250px]">
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
                    <TableCell className="font-bold text-[#FF8BBA]">
                      {Number(order.totalPrice).toFixed(2)} DT
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
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="rounded-full border-pink-100 text-[#003366] hover:bg-pink-50 hover:text-[#FF8BBA]"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm font-medium text-gray-500">
            Page{" "}
            <span className="text-[#003366] font-bold">
              {pagination.currentPage}
            </span>{" "}
            of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="rounded-full border-pink-100 text-[#003366] hover:bg-pink-50 hover:text-[#FF8BBA]"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
