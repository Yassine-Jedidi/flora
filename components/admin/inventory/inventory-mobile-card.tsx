"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Loader2, Package, Layers, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Product } from "@/lib/types";
import { useTranslations } from "next-intl";

interface InventoryMobileCardProps {
    product: Product;
    onDelete: (id: string) => Promise<void>;
    isDeleting: boolean;
}

export function InventoryMobileCard({ product, onDelete, isDeleting }: InventoryMobileCardProps) {
    const t = useTranslations("Admin.inventory.list");

    return (
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-pink-100 flex flex-col gap-4">
            {/* Top Section: Image and Info */}
            <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-pink-50 bg-pink-50/30 shrink-0">
                    {product.images[0] ? (
                        <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-pink-200" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col flex-1 min-w-0 justify-center gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-flora-dark text-[15px] leading-tight line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                        <Badge variant="secondary" className="bg-pink-50 text-pink-500 border-none text-[10px] h-5 px-2 font-bold uppercase tracking-wider">
                            {product.category.name}
                        </Badge>
                        {product._count && product._count.packItems > 0 && (
                            <Badge className="bg-purple-50 text-purple-500 border-none text-[10px] h-5 px-2 font-bold uppercase tracking-wider">
                                {t("badges.pack")}
                            </Badge>
                        )}
                    </div>

                    <div className="flex flex-col mt-1">
                        {product.discountedPrice &&
                            Number(product.discountedPrice) < Number(product.originalPrice) && (
                                <span className="text-[10px] text-gray-400 line-through font-medium">
                                    {Number(product.originalPrice).toFixed(3)} DT
                                </span>
                            )}
                        <span className="font-black text-flora-dark text-lg leading-none">
                            {Number(product.discountedPrice || product.originalPrice).toFixed(3)}
                            <span className="text-[10px] ml-1 opacity-50">DT</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Stats & Status */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {t("table.stock")}
                    </span>
                    <span className={`text-[13px] font-black ${product.stock <= 5 ? "text-red-500" : "text-flora-dark"}`}>
                        {product.stock} {t("units")}
                    </span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {t("table.status")}
                    </span>
                    <div className="flex gap-1.5 justify-end">
                        {product.isArchived ? (
                            <Badge variant="outline" className="text-[10px] h-5 border-gray-200 text-gray-400 font-bold uppercase">
                                {t("badges.archived")}
                            </Badge>
                        ) : !product.isLive ? (
                            <Badge variant="outline" className="text-[10px] h-5 border-amber-200 text-amber-500 font-bold uppercase bg-amber-50/50">
                                {t("badges.paused")}
                            </Badge>
                        ) : (
                            <Badge className="text-[10px] h-5 bg-green-500 font-bold uppercase">
                                {t("badges.live")}
                            </Badge>
                        )}
                        {product.isFeatured && (
                            <Badge className="text-[10px] h-5 bg-primary font-bold uppercase">
                                {t("badges.featured")}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Actions */}
            <div className="flex gap-2 pt-1">
                <Button
                    variant="ghost"
                    className="flex-1 bg-pink-50/80 hover:bg-pink-100 text-pink-600 font-black text-xs h-10 rounded-xl gap-2 transition-all active:scale-[0.98]"
                    asChild
                >
                    <Link href={product._count && product._count.packItems > 0
                        ? `/admin/product/edit-pack/${product.id}`
                        : `/admin/product/edit/${product.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                        {t("editProduct")}
                    </Link>
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            disabled={isDeleting}
                            variant="ghost"
                            className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-[0.98]"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-pink-100 max-w-[90vw] mx-auto">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-flora-dark font-bold text-xl">
                                {t("delete.title")}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500 text-sm">
                                {t("delete.description", { name: product.name })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col gap-2 pt-2">
                            <AlertDialogAction
                                onClick={() => onDelete(product.id)}
                                className="w-full rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold h-12 transition-all"
                            >
                                {t("delete.confirm")}
                            </AlertDialogAction>
                            <AlertDialogCancel className="w-full rounded-2xl border-none text-gray-500 font-bold h-10 hover:bg-gray-50 transition-all">
                                {t("delete.cancel")}
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
