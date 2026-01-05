"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Order {
    id: string;
    product: {
        name: string;
        price: any;
    };
    fullName: string;
    phoneNumber: string;
    governorate: string;
    city: string;
    detailedAddress: string;
    quantity: number;
    totalPrice: any;
    status: string;
    createdAt: Date;
}

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
                                <TableHead className="font-bold text-[#003366]">Date & Time</TableHead>
                                <TableHead className="font-bold text-[#003366]">Customer</TableHead>
                                <TableHead className="font-bold text-[#003366]">Product</TableHead>
                                <TableHead className="font-bold text-[#003366]">Unit Price</TableHead>
                                <TableHead className="font-bold text-[#003366]">Quantity</TableHead>
                                <TableHead className="font-bold text-[#003366]">Total Price</TableHead>
                                <TableHead className="font-bold text-[#003366]">Location</TableHead>
                                <TableHead className="font-bold text-[#003366]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-pink-50/10 border-pink-50">
                                        <TableCell className="font-medium text-gray-600 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                                                <span className="text-xs text-gray-400">{format(new Date(order.createdAt), "HH:mm")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#003366]">{order.fullName}</span>
                                                <span className="text-xs text-gray-400">{order.phoneNumber}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600 font-medium">
                                            {order.product.name}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {Number(order.product.price).toFixed(2)} DT
                                        </TableCell>
                                        <TableCell className="text-gray-600 font-bold pl-8">{order.quantity}</TableCell>
                                        <TableCell className="font-bold text-[#FF8BBA]">
                                            {Number(order.totalPrice).toFixed(2)} DT
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-gray-600">
                                                <span>{order.city}, {order.governorate}</span>
                                                <span className="text-xs text-gray-400 truncate max-w-[150px]" title={order.detailedAddress}>
                                                    {order.detailedAddress}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`
                                                    ${order.status === "PENDING" ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200" : ""}
                                                    ${order.status === "CONFIRMED" ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : ""}
                                                    ${order.status === "SHIPPED" ? "bg-purple-100 text-purple-600 hover:bg-purple-200" : ""}
                                                    ${order.status === "DELIVERED" ? "bg-green-100 text-green-600 hover:bg-green-200" : ""}
                                                    ${order.status === "CANCELLED" ? "bg-red-100 text-red-600 hover:bg-red-200" : ""}
                                                    uppercase tracking-wider text-[10px] font-bold rounded-full px-3
                                                `}
                                            >
                                                {order.status}
                                            </Badge>
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
                        Page <span className="text-[#003366] font-bold">{pagination.currentPage}</span> of {pagination.totalPages}
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
