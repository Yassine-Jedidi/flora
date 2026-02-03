"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { requestPasswordReset } from "@/lib/auth-client";
import { Bow } from "@/components/icons/bow";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
    const t = useTranslations("Auth.forgotPassword");
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            await requestPasswordReset({
                email,
                redirectTo: "/reset-password", // Redirect user here after clicking email link
            }, {
                onSuccess: () => {
                    setIsSent(true);
                    toast.success(t("success"));
                },
                onError: (ctx: { error: { message?: string } }) => {
                    toast.error(ctx.error.message || t("error"));
                }
            });
        } catch (error) {
            toast.error(t("unexpectedError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-4 relative">
                {/* Minimalist Background Element */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-pink-50/50 to-transparent -z-10" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="max-w-[440px] w-full"
                >
                    <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black text-flora-dark tracking-tight mb-2">{t("title")}</h1>
                            <p className="text-gray-400 text-sm font-medium">
                                {t("subtitle")} <Bow className="w-4 h-4 text-primary inline-block shrink-0 ms-1" />
                            </p>
                        </div>

                        {isSent ? (
                            <div className="bg-purple-50 rounded-2xl p-6 text-center space-y-4 border border-purple-100">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-black text-flora-dark">{t("sent.title")}</h3>
                                <p className="text-gray-500 text-sm font-medium">
                                    {t("sent.message")} <span className="font-bold text-flora-dark">{email}</span>
                                </p>
                                <Button asChild variant="outline" className="mt-4 rounded-xl font-bold w-full h-11 border-purple-200 text-purple-700 hover:bg-purple-100/50">
                                    <Link href="/signin">{t("backToSignIn")}</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-flora-dark font-bold ml-1 text-[11px] uppercase tracking-wider opacity-60">
                                        {t("emailLabel")}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t("emailPlaceholder")}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-12 rounded-xl border-gray-100 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm pl-11"
                                            required
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-primary hover:bg-[#FF75AA] text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        t("submit")
                                    )}
                                </Button>

                                <div className="text-center pt-2">
                                    <Link href="/signin" className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest">
                                        <ArrowLeft className="w-3 h-3" />
                                        {t("backToSignIn")}
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
