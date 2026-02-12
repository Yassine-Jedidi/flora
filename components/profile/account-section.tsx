"use client";

import { useTranslations, useFormatter } from "next-intl";
import { User, Mail, Calendar, Phone, Shield, Pencil, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AccountSectionProps {
    session: any;
    onEditProfile: () => void;
    addresses: any[];
    linkedAccounts: any[];
    isLoadingAccounts: boolean;
}

export function AccountSection({
    session,
    onEditProfile,
    addresses,
    linkedAccounts,
    isLoadingAccounts
}: AccountSectionProps) {
    const t = useTranslations("Profile");
    const format = useFormatter();

    return (
        <div className="bg-white rounded-3xl md:rounded-[40px] border border-pink-50 shadow-sm p-5 md:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl md:text-2xl font-black text-flora-dark mb-6 md:mb-8">{t("account.personalInfo")}</h3>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">{t("account.labelName")}</Label>
                        <div className="relative group/input cursor-pointer" onClick={onEditProfile}>
                            <Input
                                value={session.user.name}
                                readOnly
                                className="rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 py-4 md:py-7 px-5 font-bold text-flora-dark text-base md:text-lg cursor-pointer group-hover/input:bg-pink-50/50 group-hover/input:border-pink-100 transition-all"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Pencil className="w-4 h-4 text-gray-300 group-hover/input:text-primary transition-colors" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">{t("account.labelEmail")}</Label>
                        <div className="relative">
                            <Input
                                value={session.user.email}
                                disabled
                                className="rounded-xl md:rounded-2xl border-gray-100 bg-gray-50/50 py-4 md:py-7 px-5 font-bold text-flora-dark text-base md:text-lg"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Mail className="w-5 h-5 text-gray-300" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">{t("account.labelMemberSince")}</Label>
                        <div className="relative">
                            <div className="rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50/50 py-4 px-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-flora-dark text-sm">
                                        {format.dateTime(new Date(session.user.createdAt), {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("account.joinedFlora")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold ml-1 text-gray-400 uppercase tracking-widest text-[10px]">{t("account.labelPhone")}</Label>
                        <div className="relative">
                            <div className="rounded-xl md:rounded-2xl border border-gray-100 bg-gray-50/50 py-4 px-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-black text-flora-dark text-sm">
                                        {addresses.find((a: any) => a.isDefault)?.phoneNumber || addresses[0]?.phoneNumber || t("account.noPhone")}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("account.activeContact")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linked Accounts Section */}
                <div className="space-y-4">
                    <h4 className="font-black text-flora-dark flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        {t("account.linkedAccounts")}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isLoadingAccounts ? (
                            <>
                                <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                                <div className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                            </>
                        ) : linkedAccounts.length > 0 ? (
                            linkedAccounts.map((acc: any) => (
                                <div key={acc.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${acc.providerId === 'google' ? 'bg-red-50 text-red-500' :
                                        acc.providerId === 'facebook' ? 'bg-blue-50 text-blue-600' :
                                            'bg-gray-50 text-gray-500'
                                        }`}>
                                        {acc.providerId === 'google' ? (
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.08 2.76-5.413 2.76-7.88 0-.52-.054-1.28-.16-1.96H12.48z" /></svg>
                                        ) : acc.providerId === 'facebook' ? (
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        ) : (
                                            <Mail className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-flora-dark capitalize">{acc.providerId === 'credential' ? t("account.credentialProvider") : acc.providerId}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{t("account.connectedDate", {
                                            date: format.dateTime(new Date(acc.createdAt), {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })
                                        })}</p>
                                    </div>
                                    <div className="ml-auto">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-sm">{t("account.noLinkedAccounts")}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
