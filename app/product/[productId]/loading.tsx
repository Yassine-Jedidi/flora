import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 pt-32 pb-24">
                <div className="container mx-auto px-4">
                    {/* Breadcrumbs Skeleton */}
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                <ChevronLeft className="w-4 h-4 text-gray-300" />
                            </div>
                            <Skeleton className="h-4 w-32 bg-pink-50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
                        {/* Left Column: Images Grid Skeleton */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square rounded-[40px] overflow-hidden bg-gray-50 border border-gray-100">
                                <Skeleton className="w-full h-full bg-gray-100" />
                            </div>
                            {/* Thumbnails */}
                            <div className="grid grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                                        <Skeleton className="w-full h-full bg-gray-50" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Details Skeleton */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                {/* Category Badge */}
                                <Skeleton className="h-8 w-24 rounded-full bg-pink-100" />

                                {/* Title */}
                                <Skeleton className="h-12 w-3/4 bg-gray-100" />

                                {/* Price */}
                                <Skeleton className="h-10 w-32 bg-gray-100" />

                                {/* Description */}
                                <div className="space-y-2 pt-4">
                                    <Skeleton className="h-4 w-full bg-gray-50" />
                                    <Skeleton className="h-4 w-full bg-gray-50" />
                                    <Skeleton className="h-4 w-2/3 bg-gray-50" />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-8 space-y-4">
                                <Skeleton className="h-14 w-full rounded-full bg-gray-100" />
                                <Skeleton className="h-14 w-full rounded-full bg-pink-50" />
                            </div>

                            {/* Features/Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 pt-8">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <Skeleton className="h-10 w-10 rounded-full bg-gray-50" />
                                        <Skeleton className="h-3 w-16 bg-gray-50" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
