"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // Hardcoded translations as a fallback since NextIntlClientProvider 
    // is not available in global-error
    const t = (key: string) => {
        const messages: Record<string, string> = {
            title: "Oups ! Quelque chose s'est mal passé",
            description: "Nous avons rencontré une erreur inattendue. Nos artisans travaillent pour réparer cela.",
            retry: "Réessayer",
            backHome: "Retour à l'accueil",
        };
        return messages[key] || key;
    };

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <html>
            <body className="min-h-screen flex flex-col bg-white font-sans antialiased text-[#5D5056] relative overflow-hidden">
                <main className="flex-1 flex flex-col items-center justify-center relative pt-20 pb-20">
                    {/* Decorative Background Elements */}
                    <div
                        className="absolute inset-0 opacity-[0.3] pointer-events-none"
                        style={{
                            backgroundImage: `radial-gradient(var(--primary, #FF6B9A) 0.5px, transparent 0.5px)`,
                            backgroundSize: "32px 32px",
                        }}
                    />

                    {/* Floating Decorative Elements */}
                    <div className="absolute top-1/6 left-[10%] w-24 h-24 bg-red-50/50 rounded-full animate-pulse [animation-duration:5s]" />
                    <div className="absolute bottom-1/6 right-[10%] w-32 h-32 bg-pink-100/30 rounded-full rotate-45 animate-bounce [animation-duration:4s]" />

                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="max-w-2xl mx-auto">
                            {/* Error Icon */}
                            <div className="relative inline-block mb-8 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-lg shadow-red-50">
                                    <AlertCircle className="w-12 h-12 text-red-500" />
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                                {t("title")}
                            </h1>

                            <p className="text-slate-500 text-lg md:text-xl font-medium mb-12 max-w-lg mx-auto leading-relaxed">
                                {t("description")}
                            </p>

                            {/* Error Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
                                <Button
                                    onClick={reset}
                                    className="w-full h-14 px-8 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 gap-3"
                                >
                                    <RefreshCcw className="w-5 h-5" />
                                    {t("retry")}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full h-14 px-8 rounded-full border-2 border-pink-200 text-pink-600 hover:bg-pink-50 font-bold text-lg transition-all hover:scale-105 active:scale-95 gap-3"
                                    onClick={() => window.location.href = '/'}
                                >
                                    <Home className="w-5 h-5" />
                                    {t("backHome")}
                                </Button>
                            </div>

                            {/* Technical Detail (Visible only in dev) */}
                            {process.env.NODE_ENV === "development" && (
                                <div className="mt-16 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left max-w-lg mx-auto overflow-hidden">
                                    <p className="text-xs font-mono text-red-500 mb-2 font-bold uppercase tracking-wider">Debug Info:</p>
                                    <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap break-all bg-white p-4 rounded-lg border border-slate-100">
                                        {error.message}
                                        {error.digest && `\nDigest: ${error.digest}`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
