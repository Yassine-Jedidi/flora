"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { resetPassword } from "@/lib/auth-client";
import { Bow } from "@/components/icons/bow";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

function ResetPasswordForm() {
    const t = useTranslations("Auth.resetPassword");
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get("error");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const token = searchParams.get("token");

    if (!token && !error) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-flora-dark">{t("invalidLink.title")}</h3>
                <p className="text-gray-500 font-medium">
                    {t("invalidLink.message")}
                </p>
                <Button asChild className="rounded-xl font-bold w-full h-12 bg-primary text-white">
                    <Link href="/forgot-password">{t("invalidLink.requestNew")}</Link>
                </Button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-flora-dark">{t("invalidLink.title")}</h3>
                <p className="text-gray-500 font-medium">
                    {t("invalidLink.message")}
                </p>
                <Button asChild className="rounded-xl font-bold w-full h-12 bg-primary text-white">
                    <Link href="/forgot-password">{t("invalidLink.requestNew")}</Link>
                </Button>
            </div>
        );
    }

    // token is already declared above

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error(t("mismatchError"));
            return;
        }

        if (password.length < 8) {
            toast.error(t("lengthError"));
            return;
        }

        setIsSubmitting(true);
        try {
            await resetPassword({
                newPassword: password,
                token: token || undefined
            }, {
                onSuccess: () => {
                    toast.success(t("success"));
                    router.push("/signin");
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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
                <Label htmlFor="password" className="text-flora-dark font-bold ml-1 text-[11px] uppercase tracking-wider opacity-60">{t("newPasswordLabel")}</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl border-gray-100 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm pl-11"
                        required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                        aria-pressed={showPassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-flora-dark font-bold ml-1 text-[11px] uppercase tracking-wider opacity-60">{t("confirmPasswordLabel")}</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 rounded-xl border-gray-100 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm pl-11"
                        required
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
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
    );
}

export function ResetPasswordClient() {
    const t = useTranslations("Auth.resetPassword");
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

                        <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>}>
                            <ResetPasswordForm />
                        </Suspense>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
