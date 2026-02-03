"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, PlusCircle, ListTodo, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function AdminNav() {
    const pathname = usePathname();
    const t = useTranslations("Admin.nav");

    const navItems = [
        {
            href: "/admin/orders",
            label: t("orders"),
            icon: ShoppingBag,
        },
        {
            href: "/admin/product/new",
            label: t("newProduct"),
            icon: PlusCircle,
        },
        {
            href: "/admin/product/new-pack",
            label: t("newPack"),
            icon: PlusCircle,
        },
        {
            href: "/admin/inventory",
            label: t("inventory"),
            icon: ListTodo,
        },
        {
            href: "/admin/profit",
            label: t("profit"),
            icon: Calculator,
        },
    ];

    return (
        <div className="flex justify-center mb-10 w-full overflow-x-auto scrollbar-hide">
            <div className="bg-white border border-pink-50 p-1 h-12 rounded-full shadow-lg shadow-pink-100/30 flex items-center gap-1 min-w-fit">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center rounded-full px-3 sm:px-4 md:px-6 h-full transition-all font-bold whitespace-nowrap text-xs sm:text-sm",
                                isActive
                                    ? "bg-primary text-white shadow-md"
                                    : "text-flora-dark hover:bg-pink-50"
                            )}
                        >
                            <item.icon className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
