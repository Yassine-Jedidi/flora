"use client";

import { useEffect, useState } from "react";
import { getUserOrders } from "@/app/actions/order";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Price } from "@/components/shop/price";
import { Bow } from "@/components/icons/bow";
import {
    ShoppingBag,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    Calendar,
    ArrowLeft
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatPrice } from "@/lib/utils";

const statusConfig = {
    PENDING: {
        label: "Pending",
        icon: Clock,
        className: "bg-yellow-50 text-yellow-600 border-yellow-100",
    },
    CONFIRMED: {
        label: "Confirmed",
        icon: CheckCircle2,
        className: "bg-blue-50 text-blue-600 border-blue-100",
    },
    SHIPPED: {
        label: "Shipped",
        icon: Truck,
        className: "bg-purple-50 text-purple-600 border-purple-100",
    },
    DELIVERED: {
        label: "Delivered",
        icon: CheckCircle2,
        className: "bg-green-50 text-green-600 border-green-100",
    },
    CANCELLED: {
        label: "Cancelled",
        icon: XCircle,
        className: "bg-red-50 text-red-600 border-red-100",
    },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const result = await getUserOrders();
            if (result.success) {
                setOrders(result.orders);
            }
            setIsLoading(false);
        };
        fetchOrders();
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-12">
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-400 hover:text-primary font-bold mb-8 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            Back to shop
                        </Link>

                        <div className="flex items-end gap-3 mb-2">
                            <h1 className="text-4xl font-black text-flora-dark tracking-tight">
                                My Orders
                            </h1>
                            <Bow className="w-8 h-8 text-primary mb-1 animate-bounce-slow" />
                        </div>
                        <p className="text-gray-400 font-bold">
                            Review and track your Flora treasures.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 w-full bg-gray-50 rounded-[40px] animate-pulse" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-pink-50/30 rounded-[40px] border-2 border-dashed border-pink-100">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <ShoppingBag className="w-10 h-10 text-pink-200" />
                            </div>
                            <h2 className="text-2xl font-black text-flora-dark mb-2">No treasures yet!</h2>
                            <p className="text-gray-400 font-bold mb-8">
                                Your shopping bag is waiting for its first gems.
                            </p>
                            <Link href="/">
                                <Button className="bg-primary hover:bg-[#FF75AA] text-white rounded-full px-10 py-6 font-black text-lg transition-all shadow-lg shadow-pink-100">
                                    Start Shopping
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {orders.map((order) => {
                                const config = statusConfig[order.status as keyof typeof statusConfig];
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={order.id}
                                        className="group bg-white rounded-[40px] border border-pink-50 hover:border-pink-100 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-pink-100/30"
                                    >
                                        {/* Order Status Header */}
                                        <div className="p-8 border-b border-pink-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</span>
                                                    <span className="font-black text-flora-dark">#{order.id.slice(-8).toUpperCase()}</span>
                                                </div>
                                                <div className="w-px h-8 bg-pink-100 mx-2" />
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</span>
                                                    <div className="flex items-center gap-1.5 font-bold text-flora-dark">
                                                        <Calendar className="w-3.5 h-3.5 text-pink-300" />
                                                        {format(new Date(order.createdAt), "MMM d, yyyy")}
                                                    </div>
                                                </div>
                                            </div>

                                            <Badge className={`rounded-full px-4 py-1.5 flex items-center gap-2 border shadow-sm ${config.className}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span className="font-black text-xs uppercase tracking-wider">{config.label}</span>
                                            </Badge>
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-8">
                                            <div className="space-y-6">
                                                {order.items.map((item: any) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/product/${item.productId}`}
                                                        className="flex gap-6 group/item hover:bg-pink-50/30 p-4 rounded-3xl transition-all -mx-4"
                                                    >
                                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 border border-pink-50 shrink-0">
                                                            {item.product.images?.[0]?.url && (
                                                                <Image
                                                                    src={item.product.images[0].url}
                                                                    alt={item.product.name}
                                                                    fill
                                                                    className="object-cover transition-transform group-hover/item:scale-110"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-black text-flora-dark truncate group-hover/item:text-primary transition-colors text-lg">
                                                                        {item.product.name}
                                                                    </h4>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge variant="outline" className="rounded-full bg-white text-[10px] font-black border-pink-100">
                                                                            QTY: {item.quantity}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <Price price={item.price * item.quantity} size="sm" color="text-flora-dark" />
                                                                    <div className="flex items-center text-[10px] font-black text-primary gap-1 mt-2 lg:opacity-0 lg:group-hover/item:opacity-100 transition-all">
                                                                        <span>View Treasure</span>
                                                                        <ChevronRight className="w-3 h-3" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            <div className="mt-8 pt-8 border-t border-dashed border-pink-100 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-purple-50 p-3 rounded-2xl">
                                                        <Truck className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping to</p>
                                                        <p className="text-sm font-bold text-flora-dark">{order.city}, {order.governorate}</p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total amount</p>
                                                    <Price price={order.totalPrice} size="xl" color="text-flora-purple font-black" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
