"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useTranslations } from "next-intl";
import { Home } from "lucide-react";

export default function NotFound() {
    const t = useTranslations("NotFound");
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden pt-32 pb-20">
                {/* Decorative Background Elements */}
                <div
                    className="absolute inset-0 opacity-[0.3] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(var(--primary) 0.5px, transparent 0.5px)`,
                        backgroundSize: '32px 32px'
                    }}
                />

                {/* Floating Decorative Elements */}
                <div className="absolute top-1/4 left-[10%] w-12 h-12 bg-pink-100 rounded-2xl rotate-12 animate-pulse transition-all duration-1000" />
                <div className="absolute bottom-1/4 right-[10%] w-16 h-16 bg-purple-50 rounded-full animate-bounce transition-all duration-1000 [animation-duration:4s]" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-2xl mx-auto">
                        {/* 404 Text */}
                        <div className="relative inline-block mb-12 animate-in zoom-in duration-700">
                            <span className="text-[120px] font-black text-primary opacity-20 select-none leading-none">404</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-flora-dark mb-6 tracking-tight">
                            {t("title")} <br />
                            <span className="text-primary">{t("subtitle")}</span>
                        </h1>

                        <p className="text-[#8B7E84] text-lg font-medium mb-12 max-w-md mx-auto leading-relaxed">
                            {t("description")}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-[#FF75AA] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-pink-200 transition-all hover:scale-105 active:scale-95 text-lg"
                            >
                                <Home className="w-5 h-5" />
                                {t("backHome")}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
