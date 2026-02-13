"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Order } from "@/lib/types";
import { OrderStatusToggle } from "./order-status-toggle";
import { OrderStatus } from "@prisma/client";
import { Calendar, Clock, MapPin, Package, Phone, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrderMobileCardProps {
    order: Order;
}

export function OrderMobileCard({ order }: OrderMobileCardProps) {
    const t = useTranslations("Admin.orders.table");
    const format = useFormatter();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-pink-100 flex flex-col gap-4 transition-all active:scale-[0.98]">
            {/* Header: Status and Date */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <OrderStatusToggle
                        orderId={order.id}
                        currentStatus={order.status as OrderStatus}
                    />
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[11px] font-black text-flora-dark flex items-center justify-end gap-1.5">
                        <Calendar className="w-3 h-3 text-pink-400" />
                        {format.dateTime(new Date(order.createdAt), {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center justify-end gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 opacity-60" />
                        {format.dateTime(new Date(order.createdAt), {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })}
                    </div>
                </div>
            </div>

            {/* Customer Info Card */}
            <div className="flex items-center gap-3 bg-pink-50/40 p-3.5 rounded-2xl border border-pink-100/30">
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-pink-100">
                    <User className="w-5 h-5 text-pink-400" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-black text-flora-dark text-[15px] truncate tracking-tight">{order.fullName}</span>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-pink-400 opacity-70" />
                        <span className="group-hover:text-pink-500">{order.phoneNumber}</span>
                    </div>
                </div>
            </div>

            {/* Location Details */}
            <div className="flex items-center gap-2.5 px-1.5 mt-1 border-t border-pink-50 pt-3">
                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-pink-500" />
                </div>
                <div className="text-[13px] font-black text-flora-dark truncate flex-1 min-w-0">
                    {order.governorate}, {order.city} • {order.detailedAddress}
                </div>
            </div>

            {/* Items Section */}
            <div className="border-t border-dashed border-pink-200 pt-4 px-1">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "flex items-center justify-between w-full p-3 rounded-2xl transition-all",
                        isExpanded ? "bg-flora-dark text-white" : "bg-pink-50/50 text-flora-dark hover:bg-pink-50"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <Package className={cn("w-4 h-4", isExpanded ? "text-pink-300" : "text-pink-500")} />
                        <span className="text-xs font-black uppercase tracking-wider">
                            {order.items.length} {order.items.length === 1 ? 'Treasure' : 'Treasures'}
                        </span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")} />
                </button>

                {isExpanded && (
                    <div className="mt-3 space-y-2 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between gap-4 text-xs">
                                <span className="text-gray-600 font-bold truncate flex-1 leading-tight">{item.product.name}</span>
                                <span className="font-black whitespace-nowrap text-flora-dark bg-white px-2 py-0.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                                    {item.quantity} × {Number(item.price).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        <div className="pt-3 mt-1 border-t border-gray-200/50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shipping</span>
                            <span className="text-xs font-bold text-gray-500 italic">+{Number(order.shippingCost).toFixed(2)} {t("ship")}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: Price Summary */}
            <div className="flex justify-between items-center pt-2 px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">Total to collect</span>
                </div>
                <div className="text-2xl font-black text-primary flex items-baseline gap-1">
                    {Number(order.totalPrice).toFixed(2)}
                    <span className="text-[12px] font-black opacity-70">DT</span>
                </div>
            </div>
        </div>
    );
}
