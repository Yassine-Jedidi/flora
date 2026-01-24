"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationControlProps {
    total: number;
    totalPages: number;
    currentPage: number;
}

export function PaginationControl({
    total,
    totalPages,
    currentPage,
}: PaginationControlProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    if (total === 0 || totalPages <= 1) return null;

    return (
        <div className="flex flex-col items-center gap-4 mt-12 pb-8">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-10 w-10 rounded-full border-pink-100 hover:bg-pink-50 hover:text-pink-600 disabled:opacity-30"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                            // Show first, last, current, and surrounding pages
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-full text-sm font-bold transition-all ${currentPage === page
                                            ? "bg-[#FF8BBA] text-white shadow-md scale-110"
                                            : "bg-[#FFF5F8] text-[#8B7E84] hover:bg-pink-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            }

                            // Show ellipsis based on gap
                            if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return (
                                    <span
                                        key={page}
                                        className="text-[#8B7E84]/50 font-bold"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            return null;
                        }
                    )}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-10 w-10 rounded-full border-pink-100 hover:bg-pink-50 hover:text-pink-600 disabled:opacity-30"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Viewing page {currentPage} of {totalPages}
            </p>
        </div>
    );
}
