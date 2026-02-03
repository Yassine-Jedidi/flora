"use client";

import { useTranslations } from "next-intl";
import { User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Bow } from "@/components/icons/bow";

interface ProfileHeroProps {
    session: any;
    onEditProfile: () => void;
}

export function ProfileHero({ session, onEditProfile }: ProfileHeroProps) {
    const t = useTranslations("Profile");

    return (
        <div className="relative mb-8 md:mb-12 rounded-3xl md:rounded-[40px] bg-gradient-to-br from-flora-purple/10 via-pink-50/50 to-white p-6 md:p-8 lg:p-12 overflow-hidden border border-pink-50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-flora-purple rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500" />
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                        {session.user.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name}
                                fill
                                sizes="(max-width: 768px) 96px, 128px"
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-flora-dark">
                                <User className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-flora-dark tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                        {t("hero.greeting", { name: session.user.name.split(' ')[0] })}
                        <Bow className="w-6 h-6 md:w-8 md:h-8 text-primary animate-bounce-slow" />
                    </h1>
                    <p className="text-gray-500 font-bold flex items-center justify-center md:justify-start gap-2">
                        <Mail className="w-4 h-4 text-pink-300" />
                        {session.user.email}
                    </p>
                </div>
                <Button
                    onClick={onEditProfile}
                    className="bg-white hover:bg-pink-50 text-flora-dark border border-pink-100 rounded-full px-6 py-4 md:px-8 md:py-6 text-sm md:text-base font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105"
                >
                    {t("hero.editProfile")}
                </Button>
            </div>
        </div>
    );
}
