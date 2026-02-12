"use client";

import { useEffect, useState, Suspense } from "react";
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
    ArrowLeft,
    Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
import { PaginationControl } from "@/components/ui/pagination-control";
import { motion } from "motion/react";
import { useTranslations, useFormatter } from "next-intl";

import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useRef } from "react";


function OrdersContent() {
    const t = useTranslations("Orders");
    const format = useFormatter();
    const searchParams = useSearchParams();

    const statusConfig = {
        PENDING: {
            label: t("status.pending"),
            icon: Clock,
            className: "bg-yellow-50 text-yellow-600 border-yellow-100",
        },
        CONFIRMED: {
            label: t("status.confirmed"),
            icon: CheckCircle2,
            className: "bg-blue-50 text-blue-600 border-blue-100",
        },
        SHIPPED: {
            label: t("status.shipped"),
            icon: Truck,
            className: "bg-purple-50 text-purple-600 border-purple-100",
        },
        DELIVERED: {
            label: t("status.delivered"),
            icon: CheckCircle2,
            className: "bg-green-50 text-green-600 border-green-100",
        },
        CANCELLED: {
            label: t("status.cancelled"),
            icon: XCircle,
            className: "bg-red-50 text-red-600 border-red-100",
        },
    };

    const defaultStatusConfig = {
        label: t("status.unknown"),
        icon: Clock,
        className: "bg-gray-50 text-gray-600 border-gray-100",
    };

    // Safely parse and validate page number
    const pageParam = searchParams.get("page");
    const parsedPage = parseInt(pageParam || "1", 10);
    const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;

    const { data: session, isPending: isSessionPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [orders, setOrders] = useState<any[]>([]);
    const [pagination, setPagination] = useState<{
        total: number;
        totalPages: number;
        currentPage: number;
    } | null>(null);
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
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null); // Clear previous errors

            try {
                const result = await getUserOrders(page);

                if (result.success && result.orders && result.pagination) {
                    setOrders(result.orders);
                    setPagination(result.pagination);
                    setError(null);
                } else {
                    // Handle API error response
                    setOrders([]);
                    setPagination(null);
                    setError(result.error || t("genericError") || "Failed to load orders");
                }
            } catch (err) {
                console.error("[FETCH_ORDERS_ERROR]", err);
                setOrders([]);
                setPagination(null);
                setError(t("errorMessage") || "An unexpected error occurred. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, [page, t]);

    if (isSessionPending || !session) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-28 md:pt-32 pb-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 md:mb-12">
                        <Link
                            href="/"
                            className="inline-flex items-center text-gray-400 hover:text-primary font-bold mb-6 md:mb-8 transition-colors group text-sm md:text-base"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                            {t("backToShop")}
                        </Link>

                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black text-flora-dark tracking-tight">
                                {t("title")}
                            </h1>
                            <div className="flex items-center gap-2">
                                <Bow className="w-6 h-6 md:w-8 md:h-8 text-primary animate-bounce-slow" />
                                {pagination && (
                                    <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 md:px-3 md:py-1 h-7 md:h-8 text-xs md:text-sm font-black bg-pink-50 text-pink-500 border border-pink-100">
                                        {t("count", { count: pagination.total })}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <p className="text-gray-400 font-bold text-sm md:text-base">
                            {t("subtitle")}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-48 w-full bg-gray-50 rounded-[40px] animate-pulse" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 md:py-20 px-6 bg-red-50/30 rounded-3xl md:rounded-[40px] border-2 border-dashed border-red-100">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <XCircle className="w-8 h-8 md:w-10 md:h-10 text-red-300" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-flora-dark mb-2">{t("errorTitle")}</h2>
                            <p className="text-gray-400 font-bold mb-8 text-sm md:text-base">
                                {error}
                            </p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-primary hover:bg-[#FF75AA] text-white rounded-full px-8 py-4 md:px-10 md:py-6 font-black text-base md:text-lg transition-all shadow-lg shadow-pink-100"
                            >
                                {t("tryAgain")}
                            </Button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12 md:py-20 px-6 bg-pink-50/30 rounded-3xl md:rounded-[40px] border-2 border-dashed border-pink-100">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-pink-200" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-flora-dark mb-2">{t("noOrdersTitle")}</h2>
                            <p className="text-gray-400 font-bold mb-8 text-sm md:text-base">
                                {t("noOrdersSubtitle")}
                            </p>
                            <Link href="/">
                                <Button className="bg-primary hover:bg-[#FF75AA] text-white rounded-full px-8 py-4 md:px-10 md:py-6 font-black text-base md:text-lg transition-all shadow-lg shadow-pink-100">
                                    {t("startShopping")}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {orders.map((order) => {
                                // Safe fallback for unknown status values
                                const config = statusConfig[order.status as keyof typeof statusConfig] ?? defaultStatusConfig;
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={order.id}
                                        className="group bg-white rounded-[40px] border border-pink-50 hover:border-pink-100 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-pink-100/30"
                                    >
                                        {/* Order Status Header */}
                                        <div className="p-5 md:p-8 border-b border-pink-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("orderId")}</span>
                                                    <Link href={`/orders/${order.id}`} className="font-black text-flora-dark hover:text-primary transition-colors hover:underline decoration-wavy underline-offset-4">
                                                        #{order.id.slice(-8).toUpperCase()}
                                                    </Link>
                                                </div>
                                                <div className="w-px h-6 md:h-8 bg-pink-100" />
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("date")}</span>
                                                    <div className="flex items-center gap-1.5 font-bold text-flora-dark text-sm md:text-base">
                                                        <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 text-pink-300" />
                                                        {format.dateTime(new Date(order.createdAt), {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            <Badge className={`rounded-full px-3 py-1 md:px-4 md:py-1.5 flex items-center gap-1.5 md:gap-2 border shadow-sm ${config.className}`}>
                                                <StatusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider">{config.label}</span>
                                            </Badge>
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-8">
                                            <div className="space-y-6">
                                                {order.items.map((item: any) => (
                                                    <Link
                                                        key={item.id}
                                                        href={`/product/${item.productId}`}
                                                        className="flex gap-4 md:gap-6 group/item hover:bg-pink-50/30 p-3 md:p-4 rounded-3xl transition-all -mx-2 md:-mx-4"
                                                    >
                                                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-gray-50 border border-pink-50 shrink-0">
                                                            {item.product.images?.[0]?.url && (
                                                                <Image
                                                                    src={item.product.images[0].url}
                                                                    alt={item.product.name}
                                                                    fill
                                                                    sizes="(max-width: 768px) 80px, 96px"
                                                                    className="object-cover transition-transform group-hover/item:scale-110"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                                <div className="min-w-0">
                                                                    <h4 className="font-black text-flora-dark truncate group-hover/item:text-primary transition-colors text-base md:text-lg">
                                                                        {item.product.name}
                                                                    </h4>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge variant="outline" className="rounded-full bg-white text-[9px] md:text-[10px] font-black border-pink-100">
                                                                            QTY: {item.quantity}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                                                                    <Price price={item.price * item.quantity} size="sm" color="text-flora-dark" />
                                                                    <div className="flex items-center text-[10px] font-black text-primary gap-1 mt-2 lg:opacity-0 lg:group-hover/item:opacity-100 transition-all">
                                                                        <span className="hidden sm:inline">{t("viewTreasure")}</span>
                                                                        <ChevronRight className="w-3 h-3" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-dashed border-pink-100 flex flex-col gap-6">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-purple-50 p-2.5 md:p-3 rounded-2xl">
                                                            <Truck className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("shippingTo")}</p>
                                                            <p className="text-xs md:text-sm font-bold text-flora-dark">{order.city}, {order.governorate}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Price Summary */}
                                                <div className="bg-gray-50/50 rounded-2xl p-4 space-y-2">
                                                    <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-400">
                                                        <span>{t("subtotal")}</span>
                                                        <Price price={order.totalPrice - order.shippingCost} size="xs" color="text-gray-500" />
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs md:text-sm font-bold text-gray-400">
                                                        <span>{t("shipping")}</span>
                                                        <Price price={order.shippingCost} size="xs" color="text-gray-500" />
                                                    </div>
                                                    <div className="h-px bg-pink-100 my-1" />
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("totalAmount")}</p>
                                                        <Price price={order.totalPrice} size="md" color="text-flora-purple font-black" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <Link href={`/orders/${order.id}`}>
                                                    <motion.button
                                                        whileHover="hover"
                                                        whileTap="tap"
                                                        initial="initial"
                                                        className="relative"
                                                    >
                                                        <Button asChild variant="outline" className="text-flora-dark border-pink-100 bg-white hover:bg-pink-50 hover:text-flora-dark hover:border-pink-200 rounded-full font-bold text-xs h-10 px-6 transition-all shadow-sm">
                                                            <span>
                                                                {t("viewDetails")}
                                                                <motion.span
                                                                    className="inline-flex ml-1"
                                                                    variants={{
                                                                        initial: { x: 0 },
                                                                        hover: { x: 4 },
                                                                        tap: { x: 0 }
                                                                    }}
                                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                                >
                                                                    <ChevronRight className="w-3 h-3" />
                                                                </motion.span>
                                                            </span>
                                                        </Button>
                                                    </motion.button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    )}

                    {pagination && !isLoading && (
                        <div className="mt-8">
                            <PaginationControl
                                total={pagination.total}
                                totalPages={pagination.totalPages}
                                currentPage={pagination.currentPage}
                                showSinglePage={true}
                            />
                        </div>
                    )}
                </div>
            </main >

            <Footer />
        </div >
    );
}

export function OrdersClient() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
