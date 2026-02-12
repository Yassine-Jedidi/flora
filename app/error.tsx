"use client";

import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useTranslations } from "next-intl";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const t = useTranslations("Error");

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden pt-32 pb-20">
                {/* Decorative Background Elements */}
                <div
                    className="absolute inset-0 opacity-[0.3] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(var(--primary) 0.5px, transparent 0.5px)`,
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Floating Decorative Elements */}
                <div className="absolute top-1/4 left-[15%] w-16 h-16 bg-red-50 rounded-full animate-bounce [animation-duration:3s]" />
                <div className="absolute bottom-1/4 right-[15%] w-12 h-12 bg-pink-100 rounded-2xl rotate-45 animate-pulse" />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="max-w-2xl mx-auto">
                        {/* Error Icon */}
                        <div className="relative inline-block mb-8 animate-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-12 h-12 text-red-400" />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-flora-dark mb-4 tracking-tight">
                            {t("title")}
                        </h1>

                        <p className="text-[#8B7E84] text-lg font-medium mb-10 max-w-md mx-auto leading-relaxed">
                            {t("description")}
                        </p>

                        {/* Error Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                onClick={reset}
                                className="w-full sm:w-auto h-14 px-8 rounded-full bg-flora-dark hover:bg-black text-white font-bold text-lg shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95 gap-2"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                {t("retry")}
                            </Button>

                            <Link href="/" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full h-14 px-8 rounded-full border-2 border-pink-100 text-flora-dark hover:bg-pink-50 font-bold text-lg transition-all hover:scale-105 active:scale-95 gap-2">
                                    <Home className="w-5 h-5" />
                                    {t("backHome")}
                                </Button>
                            </Link>
                        </div>

                        {/* Technical Detail (Visible only in dev) */}
                        {process.env.NODE_ENV === "development" && (
                            <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-100 text-left max-w-lg mx-auto overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-500 mb-2 font-bold">Error Metadata:</p>
                                <pre className="text-[10px] text-gray-500 font-mono whitespace-pre-wrap">
                                    {error.message}
                                    {error.digest && `\nDigest: ${error.digest}`}
                                </pre>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
