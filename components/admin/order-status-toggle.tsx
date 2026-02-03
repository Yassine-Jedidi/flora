"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatus } from "@/app/actions/order";
import { toast } from "sonner";
import { Loader2, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrderStatusToggleProps {
    orderId: string;
    currentStatus: OrderStatus;
}


export function OrderStatusToggle({ orderId, currentStatus }: OrderStatusToggleProps) {
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations("Admin.orders");

    const statusConfig = {
        PENDING: {
            label: t("filters.status.pending"),
            className: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border-yellow-200",
            icon: Clock,
        },
        CONFIRMED: {
            label: t("filters.status.confirmed"),
            className: "bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200",
            icon: CheckCircle2,
        },
        SHIPPED: {
            label: t("filters.status.shipped"),
            className: "bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200",
            icon: Truck,
        },
        DELIVERED: {
            label: t("filters.status.delivered"),
            className: "bg-green-100 text-green-600 hover:bg-green-200 border-green-200",
            icon: CheckCircle2,
        },
        CANCELLED: {
            label: t("filters.status.cancelled"),
            className: "bg-red-100 text-red-600 hover:bg-red-200 border-red-200",
            icon: XCircle,
        },
    };

    const onStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === currentStatus) return;

        try {
            setIsLoading(true);
            const result = await updateOrderStatus(orderId, newStatus);

            if (result.success) {
                toast.success(t("status.updated", { status: statusConfig[newStatus].label }));
            } else {
                toast.error(result.error || t("status.error"));
            }
        } catch {
            toast.error(t("status.error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Select
            defaultValue={currentStatus}
            onValueChange={onStatusChange}
            disabled={isLoading}
        >
            <SelectTrigger className="w-[140px] h-9 rounded-full border-none bg-transparent hover:bg-pink-50/50 transition-colors p-0 focus:ring-0 focus:ring-offset-0">
                <div className="flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                    ) : (
                        <Badge
                            variant="outline"
                            className={`
                ${statusConfig[currentStatus].className}
                uppercase tracking-wider text-[10px] font-bold rounded-full px-3 py-1 border shadow-sm flex items-center gap-1.5
              `}
                        >
                            {(() => {
                                const Icon = statusConfig[currentStatus].icon;
                                const textColor = statusConfig[currentStatus].className.split(' ').find(c => c.startsWith('text-'));
                                return <Icon className={`w-3 h-3 ${textColor}`} />;
                            })()}
                            {statusConfig[currentStatus].label}
                        </Badge>
                    )}
                </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-pink-100 shadow-xl overflow-hidden">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    const textColor = config.className.split(' ').find(c => c.startsWith('text-'));
                    return (
                        <SelectItem
                            key={status}
                            value={status}
                            className="focus:bg-pink-50 focus:text-[#3E343C] cursor-pointer py-2 px-4"
                        >
                            <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${textColor}`} />
                                <span className="text-xs font-bold text-[#3E343C] uppercase tracking-wider">
                                    {config.label}
                                </span>
                            </div>
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
