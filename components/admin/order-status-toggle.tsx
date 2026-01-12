"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateOrderStatus } from "@/app/actions/order";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface OrderStatusToggleProps {
    orderId: string;
    currentStatus: OrderStatus;
}

const statusConfig = {
    PENDING: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border-yellow-200",
    },
    CONFIRMED: {
        label: "Confirmed",
        className: "bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200",
    },
    SHIPPED: {
        label: "Shipped",
        className: "bg-purple-100 text-purple-600 hover:bg-purple-200 border-purple-200",
    },
    DELIVERED: {
        label: "Delivered",
        className: "bg-green-100 text-green-600 hover:bg-green-200 border-green-200",
    },
    CANCELLED: {
        label: "Cancelled",
        className: "bg-red-100 text-red-600 hover:bg-red-200 border-red-200",
    },
};

export function OrderStatusToggle({ orderId, currentStatus }: OrderStatusToggleProps) {
    const [isLoading, setIsLoading] = useState(false);

    const onStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === currentStatus) return;

        try {
            setIsLoading(true);
            const result = await updateOrderStatus(orderId, newStatus);

            if (result.success) {
                toast.success(`Order status updated to ${newStatus.toLowerCase()}! ✨`);
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("Something went wrong");
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
                uppercase tracking-wider text-[10px] font-bold rounded-full px-3 py-1 border shadow-sm
              `}
                        >
                            {statusConfig[currentStatus].label}
                        </Badge>
                    )}
                </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-pink-100 shadow-xl overflow-hidden">
                {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem
                        key={status}
                        value={status}
                        className="focus:bg-pink-50 focus:text-[#003366] cursor-pointer py-2 px-4"
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.className.split(' ')[0]}`} />
                            <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                                {config.label}
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
