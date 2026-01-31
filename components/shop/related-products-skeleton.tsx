import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export function RelatedProductsSkeleton() {
    return (
        <div className="mt-32 pt-16 border-t border-pink-50">
            <div className="flex flex-col items-center text-center space-y-4 mb-16 px-4">
                <div className="flex items-center justify-center flex-wrap gap-2 md:gap-3">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-pink-100" />
                    <div className="h-10 md:h-14 w-64 bg-pink-50 rounded-full animate-pulse" />
                </div>
                <div className="h-4 w-48 bg-gray-50 rounded animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="aspect-square w-full rounded-[2.5rem] bg-gray-50" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-3/4 bg-gray-100" />
                            <Skeleton className="h-4 w-1/4 bg-pink-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
