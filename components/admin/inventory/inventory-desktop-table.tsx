"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

interface InventoryDesktopTableProps {
    products: Product[];
    onDelete: (id: string) => Promise<void>;
    isDeleting: string | null;
}

export function InventoryDesktopTable({ products, onDelete, isDeleting }: InventoryDesktopTableProps) {
    const t = useTranslations("Admin.inventory.list");

    return (
        <div className="hidden md:block bg-white rounded-[2.5rem] shadow-sm border border-pink-100 overflow-hidden">
            <div className="overflow-x-auto overflow-y-visible">
                <Table className="table-fixed w-full">
                    <TableHeader className="bg-pink-50/40">
                        <TableRow className="hover:bg-transparent border-pink-100 h-14">
                            <TableHead className="w-[300px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-6">
                                {t("table.product")}
                            </TableHead>
                            <TableHead className="hidden lg:table-cell w-[150px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-6">
                                {t("table.category")}
                            </TableHead>
                            <TableHead className="w-[150px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-6 text-center">
                                {t("table.price")}
                            </TableHead>
                            <TableHead className="w-[100px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-6 text-center">
                                {t("table.stock")}
                            </TableHead>
                            <TableHead className="w-[180px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-6 text-center">
                                {t("table.status")}
                            </TableHead>
                            <TableHead className="w-[120px] font-black text-flora-dark text-[11px] uppercase tracking-wider px-6 text-right">
                                {t("table.actions")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow
                                key={product.id}
                                className="hover:bg-pink-50/5 border-pink-50 transition-colors group"
                            >
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-pink-100 shadow-sm shrink-0 transition-transform group-hover:scale-105">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    fill
                                                    sizes="48px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-pink-50" />
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-black text-flora-dark text-[14px] truncate leading-tight">
                                                {product.name}
                                            </span>
                                            {product._count && product._count.packItems > 0 && (
                                                <div className="mt-1">
                                                    <Badge className="bg-purple-50 text-purple-600 border-none text-[9px] h-4 font-bold uppercase tracking-wider">
                                                        {t("badges.pack")}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell px-6 py-4">
                                    <Badge
                                        variant="secondary"
                                        className="bg-pink-50/80 text-pink-600 border-none hover:bg-pink-100/80 font-bold text-[11px] h-6 px-2.5"
                                    >
                                        {product.category.name}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center">
                                    <div className="flex flex-col gap-0.5">
                                        {product.discountedPrice &&
                                            Number(product.discountedPrice) < Number(product.originalPrice) && (
                                                <span className="text-[10px] text-gray-400 line-through font-medium">
                                                    {Number(product.originalPrice).toFixed(3)}
                                                </span>
                                            )}
                                        <span className="font-black text-flora-dark text-base tracking-tight">
                                            {Number(product.discountedPrice || product.originalPrice).toFixed(3)}
                                            <span className="ml-1 text-[10px] opacity-50">DT</span>
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center">
                                    <span className={`text-sm font-black ${product.stock <= 5 ? "text-red-500" : "text-flora-dark/70"}`}>
                                        {product.stock}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center">
                                    <div className="flex flex-wrap gap-1.5 justify-center">
                                        {product.isArchived ? (
                                            <Badge variant="outline" className="text-[10px] h-5 border-gray-200 text-gray-400 font-bold uppercase bg-gray-50/50">
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
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-1 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-gray-400 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors"
                                            asChild
                                        >
                                            <Link href={product._count && product._count.packItems > 0
                                                ? `/admin/product/edit-pack/${product.id}`
                                                : `/admin/product/edit/${product.id}`}>
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    disabled={isDeleting === product.id}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    {isDeleting === product.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-3xl border-pink-100">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-flora-dark font-bold text-xl">
                                                        {t("delete.title")}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="text-gray-500">
                                                        {t("delete.description", { name: product.name })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-full border-pink-100 text-gray-500 hover:bg-pink-50 transition-all font-bold">
                                                        {t("delete.cancel")}
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onDelete(product.id)}
                                                        className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-all px-6"
                                                    >
                                                        {t("delete.confirm")}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
