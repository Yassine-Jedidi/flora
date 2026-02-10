"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Loader2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getGovernorates, getDelegations } from "@/lib/locations-data";

interface AddressModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingAddress: any;
    addressForm: {
        name: string;
        fullName: string;
        phoneNumber: string;
        governorate: string;
        city: string;
        detailedAddress: string;
    };
    setAddressForm: (form: any) => void;
    isSavingAddress: boolean;
    onSave: () => Promise<void>;
}

export function AddressModal({
    isOpen,
    onOpenChange,
    editingAddress,
    addressForm,
    setAddressForm,
    isSavingAddress,
    onSave
}: AddressModalProps) {
    const t = useTranslations("Profile");

    const selectedGov = addressForm.governorate;
    const governorates = useMemo(() => getGovernorates(), []);
    const availableCities = useMemo(() => getDelegations(selectedGov), [selectedGov]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl md:rounded-[40px] border-none shadow-2xl p-0 overflow-hidden max-w-xl bg-white">
                <div className="p-5 md:p-6 lg:p-8 space-y-6 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    <DialogHeader>
                        <DialogTitle className="text-2xl md:text-3xl font-black text-flora-dark text-center flex items-center justify-center">
                            {editingAddress ? t("addresses.modal.titleUpdate") : t("addresses.modal.titleNew")}
                            <MapPin className="ml-2 w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </DialogTitle>
                        <DialogDescription className="text-center font-bold text-gray-400">
                            {editingAddress ? t("addresses.modal.descUpdate") : t("addresses.modal.descNew")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Address Label (Home/Work/Other) */}
                        <div className="space-y-2">
                            <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("addresses.modal.labelName")}</Label>
                            <div className="relative">
                                <Input
                                    placeholder={t("addresses.modal.placeholderName")}
                                    className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-200 py-4 md:py-7 px-5 font-bold text-base md:text-lg text-flora-dark"
                                    value={addressForm.name}
                                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("addresses.modal.labelFullName")}</Label>
                                <Input
                                    placeholder={t("addresses.modal.placeholderFullName")}
                                    className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-200 py-4 md:py-7 px-5 font-bold text-flora-dark"
                                    value={addressForm.fullName}
                                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("addresses.modal.labelPhone")}</Label>
                                <Input
                                    placeholder={t("addresses.modal.placeholderPhone")}
                                    className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-200 py-4 md:py-7 px-5 font-bold text-flora-dark"
                                    value={addressForm.phoneNumber}
                                    onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("addresses.modal.labelGov")}</Label>
                                <Select
                                    value={addressForm.governorate}
                                    onValueChange={(v) => setAddressForm({ ...addressForm, governorate: v, city: "" })}
                                >
                                    <SelectTrigger className="w-full rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-200 h-12 md:h-14 font-bold text-flora-dark bg-white">
                                        <SelectValue placeholder={t("addresses.modal.selectPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-pink-100 shadow-xl max-h-60">
                                        {governorates.map((gov) => (
                                            <SelectItem key={gov} value={gov} className="font-bold text-flora-dark rounded-xl my-1">{gov}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("addresses.modal.labelCity")}</Label>
                                <Select
                                    disabled={!selectedGov}
                                    value={addressForm.city}
                                    onValueChange={(v) => setAddressForm({ ...addressForm, city: v })}
                                >
                                    <SelectTrigger className="w-full rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-200 h-12 md:h-14 font-bold text-flora-dark bg-white">
                                        <SelectValue placeholder={t("addresses.modal.selectPlaceholder")} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-pink-100 shadow-xl max-h-60">
                                        {availableCities.map((city) => (
                                            <SelectItem key={city} value={city} className="font-bold text-flora-dark rounded-xl my-1">{city}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-flora-dark font-black ml-1 uppercase tracking-widest text-[10px]">{t("addresses.modal.labelDetailed")}</Label>
                            <Input
                                placeholder={t("addresses.modal.placeholderDetailed")}
                                className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-200 py-4 md:py-7 px-5 font-bold text-flora-dark"
                                value={addressForm.detailedAddress}
                                onChange={(e) => setAddressForm({ ...addressForm, detailedAddress: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={onSave}
                            disabled={isSavingAddress}
                            className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-full py-4 md:py-8 font-black text-lg md:text-xl shadow-xl shadow-pink-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isSavingAddress ? (
                                <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                                editingAddress ? t("addresses.modal.submitUpdate") : t("addresses.modal.submitNew")
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
