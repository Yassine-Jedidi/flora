"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { deleteProduct } from "@/app/actions/product";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Product } from "@/lib/types";
import { useTranslations } from "next-intl";

interface ProductListProps {
  products: Product[];
  pagination?: {
    currentPage: number;
    totalPages: number;
  };
}

export function ProductList({ products, pagination }: ProductListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const t = useTranslations("Admin.inventory.list");

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const onDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        toast.success(t("delete.success"));
        router.refresh();
      } else {
        toast.error(result.error || t("delete.error"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t("delete.error"));
    } finally {
      setIsDeleting(null);
    }
  };

  if (products.length === 0) {
    return (
      <>
        <Card className="border-dashed border-pink-200 bg-pink-50/10 rounded-3xl">
          <CardContent className="py-20 flex flex-col items-center justify-center">
            <p className="text-gray-400 italic">
              {t("empty")}
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <Card className="border-pink-100 shadow-xl shadow-pink-100/10 rounded-3xl overflow-hidden">
        <CardHeader className="bg-pink-50/30 border-b border-pink-100/50 py-4">
          <CardTitle className="text-lg font-bold text-flora-dark">
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-pink-50">
                <TableHead className="px-2 md:px-6 font-bold text-flora-dark">
                  {t("table.product")}
                </TableHead>
                <TableHead className="hidden md:table-cell px-6 font-bold text-flora-dark">
                  {t("table.category")}
                </TableHead>
                <TableHead className="px-2 md:px-6 font-bold text-flora-dark">
                  {t("table.price")}
                </TableHead>
                <TableHead className="hidden sm:table-cell px-2 md:px-6 font-bold text-flora-dark">
                  {t("table.stock")}
                </TableHead>
                <TableHead className="hidden lg:table-cell px-6 font-bold text-flora-dark">
                  {t("table.status")}
                </TableHead>
                <TableHead className="px-2 md:px-6 font-bold text-flora-dark text-right">
                  {t("table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="hover:bg-pink-50/20 border-pink-50 transition-colors"
                >
                  <TableCell className="px-2 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-pink-100 shadow-sm transition-transform hover:scale-105">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-pink-100" />
                        )}
                      </div>
                      <span className="font-bold text-flora-dark text-sm md:text-base flex items-center gap-2">
                        {product.name}
                        {product._count && product._count.packItems > 0 && (
                          <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-600 border-purple-200 py-0 h-5">
                            {t("badges.pack")}
                          </Badge>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell px-6 py-4">
                    <Badge
                      variant="secondary"
                      className="bg-pink-100/50 text-pink-600 border-none hover:bg-pink-100 font-semibold"
                    >
                      {product.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {product.discountedPrice &&
                        Number(product.discountedPrice) <
                        Number(product.originalPrice) && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 line-through">
                              {Number(product.originalPrice).toFixed(3)} DT
                            </span>
                            <Badge className="bg-red-500 hover:bg-red-600 text-[10px] px-1.5 py-0">
                              -
                              {Math.round(
                                ((Number(product.originalPrice) -
                                  Number(product.discountedPrice)) /
                                  Number(product.originalPrice)) *
                                100
                              )}
                              %
                            </Badge>
                          </div>
                        )}
                      <span className="font-bold text-gray-700">
                        {Number(
                          product.discountedPrice || product.originalPrice
                        ).toFixed(3)}{" "}
                        <span className="text-[10px] text-gray-400">DT</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`text-sm font-semibold ${product.stock <= 5 ? "text-red-500" : "text-gray-600"
                        }`}
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex gap-2">
                      {product.isArchived ? (
                        <Badge
                          variant="outline"
                          className="text-gray-400 border-gray-200 bg-gray-50"
                        >
                          {t("badges.archived")}
                        </Badge>
                      ) : !product.isLive ? (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-200 bg-amber-50 font-bold"
                        >
                          {t("badges.paused")}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          {t("badges.live")}
                        </Badge>
                      )}
                      {product.isFeatured && (
                        <Badge className="bg-primary hover:bg-[#FF75AA]">
                          {t("badges.featured")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-flora-dark hover:bg-pink-50 rounded-full"
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
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
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
                            <AlertDialogCancel className="rounded-full border-pink-100 text-gray-500 hover:bg-pink-50 transition-all">
                              {t("delete.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(product.id)}
                              className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
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
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="rounded-full border-pink-100 text-flora-dark hover:bg-pink-50 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("pagination.previous")}
          </Button>
          <div className="text-sm font-medium text-gray-500">
            {t("pagination.pageInfo", { current: pagination.currentPage, total: pagination.totalPages })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="rounded-full border-pink-100 text-flora-dark hover:bg-pink-50 hover:text-primary"
          >
            {t("pagination.next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </>
  );
}
