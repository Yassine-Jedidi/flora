"use client";

import { useTranslations } from "next-intl";
import { Plus, MapPin, Home, Briefcase, Phone, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressSectionProps {
    addresses: any[];
    isLoadingAddresses: boolean;
    onAddAddress: () => void;
    onEditAddress: (address: any) => void;
    onDeleteAddress: (id: string, name: string) => void;
    onSetDefaultAddress: (address: any) => void;
}

export function AddressSection({
    addresses,
    isLoadingAddresses,
    onAddAddress,
    onEditAddress,
    onDeleteAddress,
    onSetDefaultAddress
}: AddressSectionProps) {
    const t = useTranslations("Profile");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <div className="lg:col-span-4 space-y-4">
                <h2 className="text-xl md:text-2xl font-black text-flora-dark">{t("addresses.title")}</h2>
                <p className="text-gray-400 font-bold leading-relaxed">
                    {t("addresses.description")}
                </p>
                <Button
                    onClick={onAddAddress}
                    className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-xl md:rounded-2xl py-6 md:py-8 font-black text-base md:text-lg shadow-lg shadow-pink-100 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    {t("addresses.addBtn")}
                </Button>
            </div>

            <div className="lg:col-span-8">
                {isLoadingAddresses ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-48 bg-gray-50 rounded-[40px] animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="bg-pink-50/20 rounded-3xl md:rounded-[40px] border-2 border-dashed border-pink-100 p-8 md:p-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <MapPin className="w-8 h-8 text-pink-200" />
                        </div>
                        <h3 className="text-xl font-black text-flora-dark mb-2">{t("addresses.empty.title")}</h3>
                        <p className="text-gray-400 font-bold mb-6">{t("addresses.empty.message")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`group relative bg-white p-5 md:p-8 rounded-3xl md:rounded-[40px] border-2 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/30 ${addr.isDefault ? "border-primary bg-pink-50/5" : "border-pink-50 hover:border-pink-100"
                                    }`}
                            >
                                {addr.isDefault && (
                                    <div className="absolute top-6 right-6">
                                        <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-pink-200">
                                            {t("addresses.card.default")}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col h-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className={`p-2 rounded-xl ${addr.name.toLowerCase() === 'home' ? 'bg-blue-50 text-blue-400' : addr.name.toLowerCase() === 'work' ? 'bg-purple-50 text-purple-400' : 'bg-gray-50 text-gray-400'}`}>
                                            {addr.name.toLowerCase() === 'home' ? <Home className="w-4 h-4" /> : addr.name.toLowerCase() === 'work' ? <Briefcase className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                        </div>
                                        <h4 className="font-black text-flora-dark uppercase tracking-widest text-xs">{addr.name}</h4>
                                    </div>

                                    <div className="space-y-1 mb-8 flex-1">
                                        <p className="font-black text-flora-dark text-lg">{addr.fullName}</p>
                                        <p className="font-bold text-gray-400 text-sm flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" />
                                            {addr.phoneNumber}
                                        </p>
                                        <p className="font-bold text-gray-400 text-sm mt-3 leading-relaxed">
                                            {addr.detailedAddress},<br />
                                            {addr.city}, {addr.governorate}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 border-t border-pink-50">
                                        <button
                                            onClick={() => onEditAddress(addr)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl md:rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-pink-50 hover:text-primary transition-all group/btn"
                                        >
                                            <Pencil className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110" />
                                            {t("addresses.card.edit")}
                                        </button>
                                        {!addr.isDefault && (
                                            <button
                                                onClick={() => onSetDefaultAddress(addr)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-pink-50 hover:text-primary transition-all group/btn"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="w-3.5 h-3.5 transition-transform group-hover/btn:scale-110"
                                                >
                                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                                </svg>
                                                {t("addresses.card.setDefault")}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDeleteAddress(addr.id, addr.name)}
                                            className="w-12 flex items-center justify-center py-2.5 rounded-xl md:rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group/del"
                                        >
                                            <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
