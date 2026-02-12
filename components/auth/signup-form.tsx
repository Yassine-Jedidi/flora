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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, signIn } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useTranslations } from "next-intl";

export function SignUpForm() {
    const t = useTranslations("Auth.signUp");
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const signUpSchema = z.object({
        name: z.string().min(2, t("validation.nameMin")).max(50, t("validation.maxName")),
        email: z.email(t("validation.emailInvalid")).max(50, t("validation.maxEmail")),
        password: z.string().min(8, t("validation.passwordMin")).max(32, t("validation.maxPassword")),
    });

    type SignUpValues = z.infer<typeof signUpSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpValues>({
        resolver: zodResolver(signUpSchema),
    });

    const onSubmit = async (values: SignUpValues) => {
        setIsLoading(true);
        try {
            const { error } = await signUp.email({
                email: values.email,
                password: values.password,
                name: values.name,
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

    const handleSocialSignUp = async (provider: "google" | "facebook") => {
        setIsLoading(true);
        try {
            const { error } = await signIn.social({
                provider,
                callbackURL: "/",
            });

            if (error) {
                toast.error(error.message || t("socialError", { provider }));
            }
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
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-50/50 to-transparent -z-10" />

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
                                {t("subtitle")} <Bow className="w-4 h-4 text-flora-purple shrink-0" />
                            </p>
                        </div>

                        {/* Social Providers - Moved to Top */}
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleSocialSignUp("google")}
                                className="h-12 rounded-2xl border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-all hover:border-flora-purple/30 flex items-center justify-center gap-3"
                            >
                                <FcGoogle className="w-5 h-5" />
                                {t("google")}
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => handleSocialSignUp("facebook")}
                                className="h-12 rounded-2xl border-gray-100 font-bold text-gray-600 hover:bg-gray-50 transition-all hover:border-flora-purple/30 flex items-center justify-center gap-3"
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
                                console.error("Sign Up Validation Errors:", errors);
                                const errorMessages = Object.values(errors);
                                if (errorMessages.length > 0) {
                                    toast.error(t("validationError"), {
                                        description: (errorMessages[0]?.message as string) || t("validationDesc"),
                                    });
                                }
                            })}
                            className="space-y-5"
                        >
                            {/* Name Field */}
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-flora-dark font-bold ml-1 text-[11px] uppercase tracking-wider opacity-60">
                                    {t("nameLabel")}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        {...register("name")}
                                        placeholder={t("namePlaceholder")}
                                        className="h-12 rounded-xl border-purple-100 bg-transparent focus:ring-flora-purple/20 focus:border-flora-purple placeholder:text-purple-300 selection:bg-flora-purple shadow-[0_2px_10px_rgba(167,139,250,0.05)] transition-all font-medium text-sm"
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

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
                                        className="h-12 rounded-xl border-purple-100 bg-transparent focus:ring-flora-purple/20 focus:border-flora-purple placeholder:text-purple-300 selection:bg-flora-purple shadow-[0_2px_10px_rgba(167,139,250,0.05)] transition-all font-medium text-sm"
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
                                <Label htmlFor="password" className="text-flora-dark font-bold ml-1 text-[11px] uppercase tracking-wider opacity-60">
                                    {t("passwordLabel")}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register("password")}
                                        placeholder={t("passwordPlaceholder")}
                                        className="h-12 rounded-xl border-purple-100 bg-transparent focus:ring-flora-purple/20 focus:border-flora-purple placeholder:text-purple-300 selection:bg-flora-purple shadow-[0_2px_10px_rgba(167,139,250,0.05)] transition-all font-medium text-sm"
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
                                    className="w-full h-12 bg-flora-purple hover:bg-[#8B5CF6] text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {t("signUp")}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 text-center pt-2 border-t border-gray-50">
                            <p className="text-gray-400 text-xs font-medium">
                                {t("hasAccount")}{" "}
                                <Link
                                    href="/signin"
                                    className="text-flora-purple hover:text-flora-purple/80 transition-colors font-bold ml-1"
                                >
                                    {t("signIn")}
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
