"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getGovernorates, getDelegations } from "@/lib/locations-data";

interface LocationSelectorProps {
    governorate: string;
    city: string; // The form calls it city, but it will be Level 2 (Delegation)
    onGovernorateChange: (value: string) => void;
    onCityChange: (value: string) => void;
    errors?: {
        governorate?: string;
        city?: string;
    };
}

export function LocationSelector({
    governorate,
    city,
    onGovernorateChange,
    onCityChange,
    errors,
}: LocationSelectorProps) {
    const t = useTranslations("Checkout");

    const governorates = useMemo(() => getGovernorates(), []);

    const delegations = useMemo(() => {
        return getDelegations(governorate);
    }, [governorate]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label className="text-flora-dark font-bold ml-1">{t("governorate")}</Label>
                <Select
                    value={governorate}
                    onValueChange={(v) => {
                        onGovernorateChange(v);
                        onCityChange(""); // Reset delegation when governorate changes
                    }}
                >
                    <SelectTrigger className="w-full rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-300 h-11 md:h-13 text-flora-dark font-medium text-sm md:text-base bg-white">
                        <SelectValue placeholder={t("selectGovernorate")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl md:rounded-2xl border-pink-100 max-h-[300px]">
                        {governorates.map((gov) => (
                            <SelectItem key={gov} value={gov}>
                                {gov}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors?.governorate && (
                    <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                        {errors.governorate}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label className="text-flora-dark font-bold ml-1">{t("city")}</Label>
                <Select
                    disabled={!governorate}
                    value={city}
                    onValueChange={onCityChange}
                >
                    <SelectTrigger className="w-full rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-300 h-11 md:h-13 text-flora-dark font-medium text-sm md:text-base bg-white disabled:bg-gray-50/50">
                        <SelectValue placeholder={t("selectCity")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl md:rounded-2xl border-pink-100 max-h-[300px]">
                        {delegations.map((del) => (
                            <SelectItem key={del} value={del}>
                                {del}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors?.city && (
                    <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                        {errors.city}
                    </p>
                )}
            </div>
        </div>
    );
}
