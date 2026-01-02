import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SparkleBanner() {
    return (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl mx-16 my-12 border border-pink-500/10 shadow-2xl">
            <Image
                src="/sparkle-bg.png"
                alt="Background"
                fill
                priority
                unoptimized
                className="object-cover object-center scale-105"
            />

            {/* Subtle dark gradient at the bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />

            <div className="relative z-10 container mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-2 drop-shadow-xl tracking-tight">
                    Sparkle Every Day
                </h1>

                <div className="flex justify-center items-center gap-1 mb-6 filter drop-shadow-md">
                    <span className="text-3xl">✨</span>
                    <span className="text-5xl -mt-2">✨</span>
                    <span className="text-3xl">✨</span>
                </div>

                <p className="text-lg md:text-xl text-white font-medium max-w-2xl mx-auto mb-10 drop-shadow-md opacity-90">
                    Discover the cutest accessories to brighten up your daily look.
                </p>

                <Button className="bg-[#FF8BBA] hover:bg-[#FF75AA] text-white rounded-full px-10 py-7 text-lg font-semibold shadow-sm transition-all hover:scale-105 border-none">
                    Shop New Arrivals <ArrowRight className="ms-2 w-6 h-6" />
                </Button>
            </div>
        </section>
    );
}
