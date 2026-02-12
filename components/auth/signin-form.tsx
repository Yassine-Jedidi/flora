"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Loader2,
} from "lucide-react";
import { Bow } from "@/components/icons/bow";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useTranslations } from "next-intl";

export function SignInForm() {
    const t = useTranslations("Auth.signIn");
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const signInSchema = z.object({
        email: z.email(t("validationDesc")).max(50, t("validationDesc")),
        password: z.string().min(1, t("validationDesc")).max(32, t("validationDesc")),
    });

    type SignInValues = z.infer<typeof signInSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInValues>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = async (values: SignInValues) => {
        setIsLoading(true);
        try {
            const { error } = await signIn.email({
                email: values.email,
                password: values.password,
                callbackURL: "/",
            });

            if (error) {
                toast.error(error.message || t("error"));
            } else {
                toast.success(t("success"));
                router.push("/");
                router.refresh();
            }
        } catch (err: any) {
            toast.error(t("unexpectedError"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignIn = async (provider: "google" | "facebook") => {
        setIsLoading(true);
        try {
            await signIn.social({
                provider,
                callbackURL: "/",
            });
        } catch (err: any) {
            toast.error(t("unexpectedError"));
        } finally {
            setIsLoading(false);
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
                            <h1 className="text-3xl font-black text-flora-dark tracking-tight mb-2">
                                {t("title")}
                            </h1>
                            <p className="text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                                {t("subtitle")} <Bow className="w-4 h-4 text-primary shrink-0" />
                            </p>
                        </div>

                        {/* Social Providers - At Top */}
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleSocialSignIn("google")}
                                className="h-12 rounded-2xl border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-all hover:border-primary/30 flex items-center justify-center gap-3"
                            >
                                <FcGoogle className="w-5 h-5" />
                                {t("google")}
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleSocialSignIn("facebook")}
                                className="h-12 rounded-2xl border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-all hover:border-primary/30 flex items-center justify-center gap-3"
                            >
                                <FaFacebook className="w-5 h-5 text-[#1877F2]" />
                                {t("facebook")}
                            </Button>
                        </div>

                        <div className="relative mb-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-gray-300">
                                <span className="bg-white px-4">{t("orEmail")}</span>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit(onSubmit, (errors) => {
                                console.error("Sign In Validation Errors:", errors);
                                const errorMessages = Object.values(errors);
                                if (errorMessages.length > 0) {
                                    toast.error(t("validationError"), {
                                        description: (errorMessages[0]?.message as string) || t("validationDesc"),
                                    });
                                }
                            })}
                            className="space-y-5"
                        >
                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-flora-dark font-bold ml-1 text-[11px] uppercase tracking-wider opacity-60">
                                    {t("emailLabel")}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        placeholder={t("emailPlaceholder")}
                                        className="h-12 rounded-xl border-gray-100 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <Label htmlFor="password" className="text-flora-dark font-bold text-[11px] uppercase tracking-wider opacity-60">
                                        {t("passwordLabel")}
                                    </Label>
                                    <Link href="/forgot-password" className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                                        {t("forgotPassword")}
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register("password")}
                                        placeholder={t("passwordPlaceholder")}
                                        className="h-12 rounded-xl border-gray-100 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="pt-3">
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full h-12 bg-primary hover:bg-[#FF75AA] text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {t("signIn")}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 text-center pt-2 border-t border-gray-50">
                            <p className="text-gray-400 text-xs font-medium">
                                {t("noAccount")}{" "}
                                <Link
                                    href="/signup"
                                    className="text-primary hover:text-primary/80 transition-colors font-bold ml-1"
                                >
                                    {t("signUp")}
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
