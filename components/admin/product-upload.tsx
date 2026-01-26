"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { useState } from "react";
import Image from "next/image";

export function ProductUpload() {
    const [images, setImages] = useState<string[]>([]);

    return (
        <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-pink-200 rounded-2xl bg-pink-50/30">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-[#3E343C]">Upload Product Images</h3>
                <p className="text-sm text-gray-500">Pick the cutest photos of your accessories (up to 4)</p>
            </div>

            <UploadDropzone
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    const urls = res.map((f) => f.url);
                    setImages((prev) => [...prev, ...urls]);
                    alert("Upload Completed!");
                }}
                onUploadError={(error: Error) => {
                    // Do something with the error.
                    alert(`ERROR! ${error.message}`);
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
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
