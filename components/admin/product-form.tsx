"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema, type ProductFormValues } from "@/lib/validations/product";
import { createProduct } from "@/app/actions/product";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface ProductFormProps {
    categories: { id: string; name: string }[];
}

export function ProductForm({ categories }: ProductFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const form = useForm({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            categoryId: "",
            stock: 0,
            images: [],
            isFeatured: false,
            isArchived: false,
        } as ProductFormValues,
    });

    const images = form.watch("images") || [];

    const onSubmit = async (values: ProductFormValues) => {
        setIsPending(true);
        setSuccess(null);
        try {
            console.log("Form Values:", values);
            const result = await createProduct(values);
            if (result.success) {
                setSuccess("Accessory listed successfully! ✨");
                router.refresh();
                form.reset();
                setTimeout(() => setSuccess(null), 5000);
            } else {
                alert(result.error || "Error creating product");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Something went wrong");
        } finally {
            setIsPending(false);
        }
    };

    const { startUpload, isUploading } = useUploadThing("productImage", {
        onClientUploadComplete: (res: { url: string }[]) => {
            const urls = res.map((f) => f.url);
            const updatedImages = [...images, ...urls];
            form.setValue("images", updatedImages, { shouldValidate: true });
        },
        onUploadError: () => {
            alert("Error uploading images");
        },
    });

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            await startUpload(files);
        }
    };

    const removeImage = (urlToRemove: string) => {
        const updatedImages = images.filter((url) => url !== urlToRemove);
        form.setValue("images", updatedImages, { shouldValidate: true });
    };

    const onInvalid = (errors: unknown) => {
        console.log("Form Errors:", errors);
    };

    return (
        <Card className="relative overflow-hidden border-pink-100 shadow-xl shadow-pink-100/20 rounded-3xl">
            {success && (
                <div className="absolute top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-green-50 text-green-600 px-6 py-2 rounded-full border border-green-100 font-bold text-sm shadow-sm">
                        {success}
                    </div>
                </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold text-[#003366]">Listing Details</CardTitle>
                    <CardDescription>Enter the information that will be shown to customers.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Left Column: Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#003366] font-bold">Product Name</Label>
                                <Input
                                    id="name"
                                    {...form.register("name")}
                                    placeholder="e.g. Sparkly Butterfly Clip"
                                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-red-500 text-xs">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[#003366] font-bold">Description</Label>
                                <Textarea
                                    id="description"
                                    {...form.register("description")}
                                    rows={4}
                                    placeholder="Tell a story about this accessory..."
                                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white resize-none"
                                />
                                {form.formState.errors.description && (
                                    <p className="text-red-500 text-xs">{form.formState.errors.description.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-[#003366] font-bold">Price (DT)</Label>
                                    <Input
                                        id="price"
                                        {...form.register("price")}
                                        type="number"
                                        step="0.01"
                                        className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                                    />
                                    {form.formState.errors.price && (
                                        <p className="text-red-500 text-xs">{form.formState.errors.price.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock" className="text-[#003366] font-bold">Initial Stock</Label>
                                    <Input
                                        id="stock"
                                        {...form.register("stock")}
                                        type="number"
                                        className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[#003366] font-bold">Category</Label>
                                <Select
                                    onValueChange={(value) => form.setValue("categoryId", value, { shouldValidate: true })}
                                    value={form.watch("categoryId")}
                                >
                                    <SelectTrigger className="rounded-xl border-pink-100 focus:ring-pink-300 bg-white text-left">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-white border-pink-100 shadow-xl">
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id} className="focus:bg-pink-50 cursor-pointer">
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.categoryId && (
                                    <p className="text-red-500 text-xs">{form.formState.errors.categoryId.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/30 border border-pink-100/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-[#003366]">Featured Product</Label>
                                    <p className="text-xs text-gray-500">Show this on the home page</p>
                                </div>
                                <Switch
                                    checked={form.watch("isFeatured")}
                                    onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                                    className="data-[state=checked]:bg-[#FF8BBA]"
                                />
                            </div>
                        </div>

                        {/* Right Column: Images */}
                        <div className="space-y-6">
                            <Label className="text-[#003366] font-bold">Product Photography</Label>

                            <div className="grid grid-cols-2 gap-4">
                                {images.map((url) => (
                                    <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border border-pink-100 group shadow-sm">
                                        <Image src={url} alt="Product" fill className="object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(url)}
                                            className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white p-2 rounded-full transition-all shadow-md transform scale-90 hover:scale-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 4 && (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            disabled={isUploading}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className={`
                                                aspect-square rounded-3xl border-2 border-dashed border-pink-200
                                                flex flex-col items-center justify-center p-6 text-center
                                                cursor-pointer transition-all hover:bg-pink-50/30 hover:border-pink-300
                                                ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                                            `}
                                        >
                                            <div className="bg-pink-100 p-3 rounded-full mb-3 text-[#FF8BBA] group-hover:scale-110 transition-transform">
                                                {isUploading ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <Plus className="w-6 h-6" />
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-[#003366]">
                                                {isUploading ? "Uploading..." : "Add Photo ✨"}
                                            </p>
                                            <p className="text-[10px] text-pink-400 mt-1">Max 4MB per image</p>
                                        </label>
                                    </div>
                                )}
                            </div>
                            {form.formState.errors.images && (
                                <p className="text-red-500 text-xs text-center">{form.formState.errors.images.message}</p>
                            )}
                            <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">
                                Best results with 1080x1080 square images
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-8 border-t border-pink-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <p className="text-xs text-gray-400 font-medium">
                        Your changes are saved to the secure inventory vault.
                    </p>
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="bg-[#FF8BBA] hover:bg-[#FF75AA] text-white px-8 py-2 rounded-full font-bold shadow-lg shadow-pink-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 h-auto text-sm"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        List This Accessory
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
