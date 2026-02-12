"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Laptop, Smartphone, Shield, Loader2, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SecuritySectionProps {
    sessions: any[];
    isLoadingSessions: boolean;
    onRevokeSession: (sessionId: string) => void;
    onOpenPasswordModal: () => void;
    onOpenDeleteModal: () => void;
    hasPassword: boolean;
}

export function SecuritySection({
    sessions,
    isLoadingSessions,
    onRevokeSession,
    onOpenPasswordModal,
    onOpenDeleteModal,
    hasPassword
}: SecuritySectionProps) {
    const t = useTranslations("Profile");
    const format = useFormatter();

    return (
        <div className="bg-white rounded-3xl md:rounded-[40px] border border-pink-50 shadow-sm p-5 md:p-8 max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <div>
                    <h3 className="text-2xl font-black text-flora-dark mb-2">{t("security.title")}</h3>
                    <p className="text-gray-400 font-bold">{t("security.description")}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gray-50/50 rounded-[30px] p-6 border border-gray-100">
                    <h4 className="font-black text-flora-dark mb-4 flex items-center gap-2">
                        <Laptop className="w-5 h-5 text-primary" />
                        {t("security.activeSessions")}
                    </h4>

                    <div className="space-y-4">
                        {isLoadingSessions ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-pink-300" />
                            </div>
                        ) : sessions.length > 0 ? (
                            sessions.map((sess) => {
                                const ua = sess.userAgent?.toLowerCase() ?? '';
                                return (
                                    <div key={sess.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ua.includes("mobile") ? "bg-purple-50" : "bg-blue-50"}`}>
                                                {ua.includes("mobile") ? (
                                                    <Smartphone className="w-5 h-5 text-purple-400" />
                                                ) : (
                                                    <Laptop className="w-5 h-5 text-blue-400" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-flora-dark text-sm">
                                                    {ua.includes("windows") ? t("security.devices.windows") :
                                                        ua.includes("mac") ? t("security.devices.mac") :
                                                            ua.includes("iphone") ? t("security.devices.iphone") :
                                                                ua.includes("android") ? t("security.devices.android") : t("security.devices.unknown")}
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {(sess.ipAddress === "::1" || sess.ipAddress === "127.0.0.1" || sess.ipAddress === "0000:0000:0000:0000:0000:0000:0000:0000") ? t("security.devices.localhost") : sess.ipAddress} • {format.dateTime(new Date(sess.createdAt), {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {sess.isCurrent ? (
                                            <Badge className="bg-green-100 text-green-600 border-none hover:bg-green-100">{t("security.currentBadge")}</Badge>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onRevokeSession(sess.id)}
                                                className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                            >
                                                {t("security.revokeBtn")}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-400 text-sm text-center">{t("security.noSessions")}</p>
                        )}
                    </div>
                </div>

                <Button
                    onClick={onOpenPasswordModal}
                    variant="outline"
                    className="w-full rounded-xl md:rounded-2xl py-6 md:py-8 border-gray-100 text-flora-dark font-bold hover:bg-gray-50 flex items-center justify-between px-5 md:px-8 group"
                >
                    {hasPassword ? t("security.changePasswordBtn") : t("security.setPasswordBtn")}
                    <ChevronRight className="w-5 h-5 opacity-30 group-hover:translate-x-1 transition-all" />
                </Button>

                <Button
                    onClick={onOpenDeleteModal}
                    variant="outline"
                    className="w-full rounded-xl md:rounded-2xl py-6 md:py-8 border-red-50 text-red-500 font-bold hover:bg-red-50 hover:text-red-600 flex items-center justify-between px-5 md:px-8 group mt-4 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 opacity-50 group-hover:text-red-500 transition-colors" />
                        {t("security.deleteAccountBtn")}
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-20 group-hover:translate-x-1 transition-all" />
                </Button>
            </div>
        </div>
    );
}
