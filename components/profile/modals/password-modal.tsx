"use client";

import { useTranslations } from "next-intl";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PasswordModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    hasPassword: boolean;
    passwordForm: {
        currentPassword?: string;
        newPassword: string;
        confirmPassword: string;
    };
    setPasswordForm: (form: any) => void;
    isChangingPassword: boolean;
    onSave: () => Promise<void>;
}

export function PasswordModal({
    isOpen,
    onOpenChange,
    hasPassword,
    passwordForm,
    setPasswordForm,
    isChangingPassword,
    onSave
}: PasswordModalProps) {
    const t = useTranslations("Profile");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl md:rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-md bg-white">
                <div className="p-5 md:p-6 lg:p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl md:text-3xl font-black text-flora-dark text-center flex items-center justify-center gap-2">
                            {hasPassword ? t("passwordModal.titleChange") : t("passwordModal.titleSet")}
                            <Shield className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                        </DialogTitle>
                        <DialogDescription className="text-center font-bold text-gray-400">
                            {hasPassword ? t("passwordModal.descChange") : t("passwordModal.descSet")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {hasPassword && (
                            <div className="space-y-2">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("passwordModal.labelCurrent")}</Label>
                                <Input
                                    type="password"
                                    placeholder={t("passwordModal.placeholderCurrent")}
                                    className="rounded-xl md:rounded-2xl border-purple-100 focus:border-purple-300 focus:ring-purple-200 py-4 md:py-7 px-5 font-bold text-base md:text-lg text-flora-dark placeholder:text-purple-200"
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("passwordModal.labelNew")}</Label>
                            <Input
                                type="password"
                                placeholder={t("passwordModal.placeholderNew")}
                                className="rounded-2xl border-purple-100 focus:border-purple-300 focus:ring-purple-200 py-7 px-5 font-bold text-lg text-flora-dark placeholder:text-purple-200"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("passwordModal.labelConfirm")}</Label>
                            <Input
                                type="password"
                                placeholder={t("passwordModal.placeholderConfirm")}
                                className="rounded-2xl border-purple-100 focus:border-purple-300 focus:ring-purple-200 py-7 px-5 font-bold text-lg text-flora-dark placeholder:text-purple-200"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            />
                        </div>

                        <Button
                            onClick={onSave}
                            disabled={isChangingPassword}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-full py-4 md:py-8 font-black text-lg md:text-xl shadow-xl shadow-purple-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {isChangingPassword ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-7 h-7 animate-spin" />
                                    <span>{t("passwordModal.loading")}</span>
                                </div>
                            ) : (
                                hasPassword ? t("passwordModal.submitChange") : t("passwordModal.submitSet")
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
