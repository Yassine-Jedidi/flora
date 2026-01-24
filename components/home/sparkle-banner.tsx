"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SparkleBanner() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Autoplay was prevented:", error);
            });
        }
    }, []);

    return (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl mx-4 md:mx-16 md:my-4 border border-pink-500/10 shadow-2xl bg-black">
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/sparkle-bg.png"
                className="absolute inset-0 w-full h-full object-cover object-center scale-105 pointer-events-none"
            >
                <source src="/bg-video.mp4" type="video/mp4" />
            </video>

            {/* Subtle dark gradient at the bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />

            <div className="relative z-10 container mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-2 drop-shadow-xl tracking-tight">
                    Sparkle Every Day
                </h1>

                <div className="flex justify-center items-center gap-1 mb-6 filter drop-shadow-md">
                    <span className="text-2xl md:text-3xl">✨</span>
                    <span className="text-4xl md:text-5xl -mt-2">✨</span>
                    <span className="text-2xl md:text-3xl">✨</span>
                </div>

                <p className="text-base md:text-xl text-white font-medium max-w-2xl mx-auto mb-10 drop-shadow-md opacity-90">
                    Discover the cutest accessories to brighten up your daily look.
                </p>

                <Button className="bg-[#FF8BBA] hover:bg-[#FF75AA] text-white rounded-full px-8 md:px-10 py-5 md:py-7 text-base md:text-lg font-semibold shadow-lg transition-all hover:scale-105 border-none">
                    Shop New Arrivals <ArrowRight className="ms-2 w-5 h-5 md:w-6 md:h-6" />
                </Button>
            </div>
        </section>
    );
}
