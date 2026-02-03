"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Globe, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LanguageSwitcherProps {
    variant?: "navbar" | "footer" | "dropdown";
}

export function LanguageSwitcher({ variant = "navbar" }: LanguageSwitcherProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();

    const switchLanguage = (newLocale: string) => {
        if (newLocale === locale) return;

        startTransition(() => {
            // Set cookie
            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
            // Refresh to apply new language
            router.refresh();
        });
    };

    const navT = useTranslations("Navigation");

    if (variant === "dropdown") {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        aria-label={navT("selectLanguage")}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-50 text-flora-dark hover:bg-pink-100 transition-colors focus:outline-none"
                    >
                        <Globe className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 mt-2 rounded-2xl p-1 border-pink-50 shadow-xl">
                    <DropdownMenuItem
                        onClick={() => switchLanguage("en")}
                        className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition-colors",
                            locale === "en" ? "text-primary bg-pink-50" : "text-flora-dark hover:bg-pink-50/50"
                        )}
                    >
                        English
                        {locale === "en" && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => switchLanguage("fr")}
                        className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition-colors",
                            locale === "fr" ? "text-primary bg-pink-50" : "text-flora-dark hover:bg-pink-50/50"
                        )}
                    >
                        Français
                        {locale === "fr" && <Check className="w-3 h-3" />}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    if (variant === "footer") {
        return (
            <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => switchLanguage("en")}
                        disabled={isPending}
                        className={cn(
                            "px-2 py-1 text-xs font-bold transition-colors rounded",
                            locale === "en"
                                ? "text-primary"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        EN
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={() => switchLanguage("fr")}
                        disabled={isPending}
                        className={cn(
                            "px-2 py-1 text-xs font-bold transition-colors rounded",
                            locale === "fr"
                                ? "text-primary"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        FR
                    </button>
                </div>
            </div>
        );
    }

    // Navbar variant - more compact pill
    return (
        <div className="flex items-center gap-1 px-3 py-1.5 bg-pink-50/50 rounded-full border border-pink-100">
            <button
                onClick={() => switchLanguage("en")}
                disabled={isPending}
                className={cn(
                    "px-2 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all rounded-full",
                    locale === "en"
                        ? "bg-primary text-white"
                        : "text-gray-500 hover:text-primary"
                )}
            >
                EN
            </button>
            <span className="text-gray-300 text-xs">|</span>
            <button
                onClick={() => switchLanguage("fr")}
                disabled={isPending}
                className={cn(
                    "px-2 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all rounded-full",
                    locale === "fr"
                        ? "bg-primary text-white"
                        : "text-gray-500 hover:text-primary"
                )}
            >
                FR
            </button>
        </div>
    );
}

