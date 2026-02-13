"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { deleteProduct } from "@/app/actions/product";
import { InventoryMobileCard } from "./inventory-mobile-card";
import { InventoryDesktopTable } from "./inventory-desktop-table";

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

  return (
    <div className="space-y-6">
      <div className="">
        {products.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-pink-100 shadow-sm">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-pink-300" />
            </div>
            <h3 className="text-flora-dark font-black text-xl mb-2">{t("noTreasuresFound")}</h3>
            <p className="text-gray-400 font-medium max-w-xs mx-auto">
              {t("emptySelection")}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Card Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {products.map((product) => (
                <InventoryMobileCard
                  key={product.id}
                  product={product}
                  onDelete={onDelete}
                  isDeleting={isDeleting === product.id}
                />
              ))}
            </div>

            {/* Desktop View - Premium Table */}
            <InventoryDesktopTable
              products={products}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-4 border border-pink-100/50 flex items-center justify-between shadow-sm">
          <div className="hidden sm:block text-sm font-black text-flora-dark/60 tracking-tight ps-2">
            {t("pagination.pageInfo", { current: pagination.currentPage, total: pagination.totalPages })}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="flex-1 sm:flex-none rounded-2xl border-pink-100 text-flora-dark font-black h-10 px-6 hover:bg-pink-50 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t("pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="flex-1 sm:flex-none rounded-2xl border-pink-100 text-flora-dark font-black h-10 px-6 hover:bg-pink-50 transition-all disabled:opacity-30"
            >
              {t("pagination.next")}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
