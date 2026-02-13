"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function ProductUpload() {
    const t = useTranslations("Admin.productForm");
    const [images, setImages] = useState<string[]>([]);

    return (
        <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/30">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-[#3E343C]">{t("placeholders.uploadTitle")}</h3>
                <p className="text-sm text-gray-500">{t("placeholders.uploadDesc")}</p>
            </div>

            <UploadDropzone
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    const urls = res.map((f) => f.url);
                    setImages((prev) => [...prev, ...urls]);
                    toast.success(t("toasts.uploadComplete"));
                }}
                onUploadError={(error: Error) => {
                    // Do something with the error.
                    toast.error(`${t("toasts.errorGeneric")}: ${error.message}`);
                }}
                appearance={{
                    button: "bg-[#FF8BBA] hover:bg-[#FF75AA] rounded-full px-6 transition-all",
                    allowedContent: "text-pink-400 font-medium",
                    label: "text-[#3E343C] font-semibold hover:text-pink-600",
                    container: "bg-white border-pink-100",
                }}
            />

            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {images.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-pink-100 shadow-sm">
                            <Image
                                src={url}
                                alt={`Product ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
