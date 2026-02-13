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
import { Calendar, Clock, MapPin, Phone, User } from "lucide-react";

interface OrderDesktopTableProps {
    orders: Order[];
}

export function OrderDesktopTable({ orders }: OrderDesktopTableProps) {
    const t = useTranslations("Admin.orders.table");
    const format = useFormatter();

    return (
        <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-pink-100 overflow-hidden">
            <div className="overflow-x-auto overflow-y-visible">
                <Table className="table-fixed w-full">
                    <TableHeader className="bg-pink-50/40">
                        <TableRow className="hover:bg-transparent border-pink-100 h-14">
                            <TableHead className="w-[140px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-4">
                                {t("date")}
                            </TableHead>
                            <TableHead className="w-[160px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-4">
                                {t("customer")}
                            </TableHead>
                            <TableHead className="hidden lg:table-cell w-[200px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-4">
                                {t("items")}
                            </TableHead>
                            <TableHead className="w-[110px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-4">
                                {t("total")}
                            </TableHead>
                            <TableHead className="hidden md:table-cell font-black text-flora-dark text-[11px] uppercase tracking-wider px-4">
                                {t("location")}
                            </TableHead>
                            <TableHead className="w-[150px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-4 text-center">
                                {t("status")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow
                                key={order.id}
                                className="hover:bg-pink-50/5 border-pink-50 transition-colors group"
                            >
                                <TableCell className="px-4 py-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-flora-dark font-bold text-[13px]">
                                            <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                            <span className="truncate">
                                                {format.dateTime(new Date(order.createdAt), {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-[10px] ps-5 font-medium">
                                            <Clock className="w-3 h-3 opacity-60 shrink-0" />
                                            <span>
                                                {format.dateTime(new Date(order.createdAt), {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                            <span className="font-black text-flora-dark text-[13px] truncate">
                                                {order.fullName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 ps-5 font-semibold group-hover:text-pink-500 transition-colors">
                                            <Phone className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                            <span className="truncate">{order.phoneNumber}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell px-4 py-5">
                                    <div className="flex flex-col gap-1.5 max-w-[180px]">
                                        {order.items.slice(0, 2).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between gap-2 text-[10px] font-medium text-gray-600 bg-pink-50/30 px-2 py-1 rounded-lg"
                                            >
                                                <span className="truncate flex-1">
                                                    {item.product.name}
                                                </span>
                                                <span className="font-black shrink-0 text-pink-500 bg-white px-1.5 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                                    {item.quantity}×
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 2 && (
                                            <span className="text-[9px] text-gray-400 italic px-2 font-medium">
                                                + {order.items.length - 2} {t("others") || "others"}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="text-[9px] text-gray-400 flex items-center gap-1 font-medium italic">
                                            <span>{(Number(order.totalPrice) - (order.shippingCost || 0)).toFixed(3)}</span>
                                            <span className="text-[8px] opacity-70">+{(order.shippingCost || 0).toFixed(3)} DT</span>
                                        </div>
                                        <span className="font-black text-primary text-base tracking-tight whitespace-nowrap">
                                            {Number(order.totalPrice).toFixed(3)} <span className="text-[10px] font-bold">DT</span>
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5">
                                    <div className="flex items-start gap-2 max-w-[220px]">
                                        <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                                        <div className="flex flex-col min-w-0" title={`${order.governorate}, ${order.city} • ${order.detailedAddress}`}>
                                            <span className="text-[13px] font-black text-flora-dark truncate">
                                                {order.governorate}, {order.city}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium truncate leading-tight">
                                                {order.detailedAddress}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-5 text-center">
                                    <div className="flex justify-center scale-90 origin-center">
                                        <OrderStatusToggle
                                            orderId={order.id}
                                            currentStatus={order.status as OrderStatus}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
