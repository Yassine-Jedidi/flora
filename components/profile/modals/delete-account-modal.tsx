"use client";

import { useTranslations } from "next-intl";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Bow } from "@/components/icons/bow";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isDeletingAccount: boolean;
    onDelete: () => Promise<void>;
}

export function DeleteAccountModal({
    isOpen,
    onOpenChange,
    isDeletingAccount,
    onDelete
}: DeleteAccountModalProps) {
    const t = useTranslations("Profile");

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl md:rounded-[40px] border-none shadow-3xl p-0 overflow-hidden max-w-xs md:max-w-md bg-white">
                <div className="p-5 md:p-8 space-y-4 md:space-y-5">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-xl md:text-2xl font-black text-flora-dark text-center tracking-tight">
                            {t("deleteAccount.modalTitle")}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-bold text-xs md:text-sm leading-relaxed text-center px-2 md:px-4">
                            {t("deleteAccount.modalDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-red-50/50 border border-red-100/50 rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-start gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">{t("deleteAccount.privacyNotice")}</p>
                            <p className="text-[11px] font-bold text-red-700/70 leading-relaxed">
                                {t("deleteAccount.privacyMessage")}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                        <Button
                            onClick={onDelete}
                            disabled={isDeletingAccount}
                            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full py-4 md:py-6 font-black text-sm md:text-base shadow-xl shadow-red-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                        >
                            {isDeletingAccount ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                t("deleteAccount.confirmBtn")
                            )}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="ghost" className="w-full rounded-full py-4 md:py-7 text-gray-400 font-black uppercase tracking-widest text-[10px] border border-gray-100 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-95">
                                {t("deleteAccount.cancelBtn")} <Bow className="w-3.5 h-3.5 text-primary ml-1 inline-block" />
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
