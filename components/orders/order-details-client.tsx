"use client";

import { useEffect, useState, use } from "react";
import { getOrderById } from "@/app/actions/order";
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
    ArrowLeft,
    Loader2,
    MapPin,
    Package,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { SHIPPING_COST } from "@/lib/constants/shipping";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useRef } from "react";


export function OrderDetailsClient({ params }: { params: Promise<{ orderId: string }> }) {
    const t = useTranslations("Orders.details");
    const resolvedParams = use(params);
    const orderId = resolvedParams.orderId;

    const statusConfig = {
        PENDING: {
            label: t("statusLabel.pending"),
            icon: Clock,
            className: "bg-yellow-50 text-yellow-600 border-yellow-100",
            description: t("statusDesc.pending"),
        },
        CONFIRMED: {
            label: t("statusLabel.confirmed"),
            icon: CheckCircle2,
            className: "bg-blue-50 text-blue-600 border-blue-100",
            description: t("statusDesc.confirmed"),
        },
        SHIPPED: {
            label: t("statusLabel.shipped"),
            icon: Truck,
            className: "bg-purple-50 text-purple-600 border-purple-100",
            description: t("statusDesc.shipped"),
        },
        DELIVERED: {
            label: t("statusLabel.delivered"),
            icon: CheckCircle2,
            className: "bg-green-50 text-green-600 border-green-100",
            description: t("statusDesc.delivered"),
        },
        CANCELLED: {
            label: t("statusLabel.cancelled"),
            icon: XCircle,
            className: "bg-red-50 text-red-600 border-red-100",
            description: t("statusDesc.cancelled"),
        },
    };

    const defaultStatusConfig = {
        label: t("statusLabel.processing"),
        icon: Clock,
        className: "bg-gray-50 text-gray-600 border-gray-100",
        description: t("statusDesc.processing"),
    };

    const ORDER_STATUS_SEQUENCE = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;
    const ORDER_STATUS_WITH_CANCELLED = [...ORDER_STATUS_SEQUENCE, 'CANCELLED'] as const;

    const { data: session, isPending: isSessionPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrderById>>["order"] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Track if user was previously logged in
    const wasLoggedIn = useRef(false);

    useEffect(() => {
        if (session) {
            wasLoggedIn.current = true;
        }
    }, [session]);

    useEffect(() => {
        if (!isSessionPending && !session) {
            if (wasLoggedIn.current) {
                router.push("/");
            } else {
                router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            }
        }
    }, [isSessionPending, session, router, pathname]);

    useEffect(() => {
        const fetchOrder = async () => {
            setIsLoading(true);
            const result = await getOrderById(orderId);
            if (result.success && result.order) {
                setOrder(result.order);
            } else {
                setError(result.error || t("errorMessage") || "Failed to load order");
            }
            setIsLoading(false);
        };
        fetchOrder();
    }, [orderId, t]);

    if (isSessionPending || !session || isLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center">
                        <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-flora-dark mb-2">{t("notFoundTitle")}</h2>
                        <p className="text-gray-400 font-bold mb-8">{error || t("notFoundSubtitle")}</p>
                        <Link href="/orders">
                            <Button className="bg-primary hover:bg-[#FF75AA] text-white rounded-full px-8 py-6 font-black transition-all">
                                {t("backToOrders")}
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const config = statusConfig[order.status as keyof typeof statusConfig] ?? defaultStatusConfig;
    const StatusIcon = config.icon;

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/orders"
                            className="inline-flex items-center text-gray-400 hover:text-primary font-bold mb-6 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            {t("backToAll")}
                        </Link>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-3xl font-black text-flora-dark tracking-tight">
                                        {t("title")}
                                    </h1>
                                    <Bow className="w-8 h-8 text-primary shrink-0" />
                                </div>
                                <p className="text-gray-400 font-bold">
                                    {t("orderNo")} <span className="text-flora-dark">#{order.id.slice(-8).toUpperCase()}</span> • {format(new Date(order.createdAt), "MMMM d, yyyy")}
                                </p>
                            </div>
                            <Badge className={`rounded-full px-4 py-2 flex items-center gap-2 border shadow-sm ${config.className}`}>
                                <StatusIcon className="w-4 h-4" />
                                <span className="font-black text-xs uppercase tracking-wider">{config.label}</span>
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side: Items & Status */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Banner */}
                            <div className="bg-white rounded-[32px] p-8 border border-pink-50 shadow-sm relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -mr-8 -mt-8 rounded-full ${config.className.split(' ')[0]}`} />
                                <h3 className="text-lg font-black text-flora-dark mb-2 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    {t("packageStatus")}
                                </h3>
                                <p className="text-gray-500 font-bold relative z-10">{config.description}</p>

                                {/* Simple Progress Bar */}
                                <div className="mt-8 flex items-center gap-2">
                                    {ORDER_STATUS_SEQUENCE.map((s) => {
                                        const currentIdx = ORDER_STATUS_WITH_CANCELLED.indexOf(order.status);
                                        const thisIdx = ORDER_STATUS_WITH_CANCELLED.indexOf(s);
                                        const isCompleted = thisIdx <= currentIdx && order.status !== 'CANCELLED';

                                        return (
                                            <div key={s} className="flex-1 flex flex-col gap-2">
                                                <div className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted ? 'bg-primary' : 'bg-gray-100'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-tighter text-center ${isCompleted ? 'text-primary' : 'text-gray-300'}`}>
                                                    {s === 'PENDING' ? t("steps.received") : t(`steps.${s.toLowerCase()}` as any)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="bg-white rounded-[40px] border border-pink-50 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-pink-50 bg-gray-50/30">
                                    <h3 className="text-lg font-black text-flora-dark flex items-center gap-2">
                                        <ShoppingBag className="w-5 h-5 text-primary" />
                                        {t("orderedItems")}
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex gap-6 p-4 rounded-3xl hover:bg-pink-50/20 transition-all border border-transparent hover:border-pink-50"
                                        >
                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-pink-50 shrink-0">
                                                {item.product.images?.[0]?.url && (
                                                    <Image
                                                        src={item.product.images[0].url}
                                                        alt={item.product.name}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h4 className="font-black text-flora-dark truncate text-lg">
                                                            {item.product.name}
                                                        </h4>
                                                        <p className="text-sm font-bold text-gray-400 mt-1">
                                                            {t("quantity")}: <span className="text-primary">{item.quantity}</span>
                                                        </p>
                                                    </div>
                                                    <Price price={item.price * item.quantity} size="sm" color="text-flora-dark font-black" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary calculation */}
                                <div className="p-8 bg-gray-50/50 border-t border-pink-50 space-y-3">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t("summary")}</h4>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                        <span>{t("subtotal")}</span>
                                        <span>{(order.totalPrice - SHIPPING_COST).toFixed(3)} TND</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                        <span>{t("shipping")}</span>
                                        <span>{SHIPPING_COST.toFixed(3)} TND</span>
                                    </div>
                                    <div className="h-px bg-pink-100 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black text-flora-dark">{t("total")}</span>
                                        <Price price={order.totalPrice} size="xl" color="text-primary font-black scale-110 origin-right" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Shipping Details */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-[32px] p-8 border border-pink-50 shadow-sm sticky top-32">
                                <h3 className="text-lg font-black text-flora-dark mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    {t("deliveryDetails")}
                                </h3>

                                <div className="space-y-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("fullName")}</span>
                                        <p className="font-black text-flora-dark">{order.fullName}</p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("phoneNumber")}</span>
                                        <p className="font-bold text-flora-dark">{order.phoneNumber}</p>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("address")}</span>
                                        <p className="text-sm font-bold text-flora-dark leading-relaxed">
                                            {order.detailedAddress}<br />
                                            {order.city}, {order.governorate}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-pink-50">
                                        <div className="bg-pink-50/50 rounded-2xl p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <Truck className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("paymentMethod")}</p>
                                                <p className="text-xs font-black text-flora-dark">{t("cod")}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
