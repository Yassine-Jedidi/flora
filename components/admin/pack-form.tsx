"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    PackSchema,
    type PackFormValues,
} from "@/lib/validations/pack";
import { createPack, updatePack } from "@/app/actions/pack";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { Loader2, Plus, X, Save, RotateCcw, Trash2, Package, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";

interface AvailableProduct {
    id: string;
    name: string;
    discountedPrice: any;
    originalPrice: any;
    stock: number;
    images: { url: string }[];
}

interface PackFormProps {
    categories: { id: string; name: string; slug: string }[];
    availableProducts: AvailableProduct[];
    initialData?: (PackFormValues & { id: string }) | null;
    onCancel?: () => void;
    onSuccess?: () => void;
}

export function PackForm({
    categories,
    availableProducts,
    initialData,
    onCancel,
    onSuccess,
}: PackFormProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [isManualPricing, setIsManualPricing] = useState(!!initialData);
    const [marketValue, setMarketValue] = useState(0);

    const form = useForm({
        resolver: zodResolver(PackSchema),
        defaultValues: (initialData
            ? {
                ...initialData,
                originalPrice: initialData.discountedPrice
                    ? Number(initialData.originalPrice)
                    : undefined,
                discountedPrice: initialData.discountedPrice
                    ? Number(initialData.discountedPrice)
                    : Number(initialData.originalPrice),
            }
            : {
                name: "",
                description: "",
                originalPrice: undefined,
                discountedPrice: undefined,
                categoryId: "",
                stock: 0,
                images: [],
                isFeatured: false,
                isArchived: false,
                isLive: true,
                packItems: [],
            }) as PackFormValues,
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "packItems",
    });

    const getProductById = useCallback((id: string) => {
        return availableProducts.find(p => p.id === id);
    }, [availableProducts]);

    // Use useWatch for better performance and to avoid some re-render loops
    const watchedItems = useWatch({
        control: form.control,
        name: "packItems"
    }) || [];

    const watchedItemImages = useWatch({
        control: form.control,
        name: "itemImages"
    }) || {};

    useEffect(() => {
        if (watchedItems.length === 0) {
            const current = form.getValues();
            if (current.discountedPrice !== 0) {
                form.setValue("discountedPrice", 0, { shouldDirty: false });
            }
            if (current.originalPrice !== undefined) {
                form.setValue("originalPrice", undefined, { shouldDirty: false });
            }
            if (current.stock !== 0) {
                form.setValue("stock", 0, { shouldDirty: false });
            }
            if (current.images?.length !== 0) {
                form.setValue("images", [], { shouldDirty: false });
            }
            return;
        }

        let totalShopValueSum = 0;
        let totalMarketValueSum = 0;
        let minStock = Infinity;
        const packImages: string[] = [];

        watchedItems.forEach((item, index) => {
            const product = getProductById(item.itemId);
            if (product) {
                const qty = Number(item.quantity) || 1;
                // Level 1: Market Value (always original)
                totalMarketValueSum += Number(product.originalPrice) * qty;

                // Level 2: Shop Value (current selling price - might already be discounted)
                const currentItemPrice = Number(product.discountedPrice || product.originalPrice);
                totalShopValueSum += currentItemPrice * qty;

                const possiblePacks = Math.floor(product.stock / qty);
                if (possiblePacks < minStock) minStock = possiblePacks;

                const itemImageUrl = watchedItemImages[index.toString()] || product.images[0]?.url;
                if (itemImageUrl) {
                    packImages.push(itemImageUrl);
                }
            }
        });

        const finalMarketValue = Number(totalMarketValueSum.toFixed(3));
        const finalShopValue = Number(totalShopValueSum.toFixed(3));
        const finalPackPrice = Number((finalShopValue * 0.95).toFixed(3)); // Default 5% pack discount
        const finalStock = minStock === Infinity ? 0 : minStock;

        setMarketValue(finalMarketValue);

        // CRITICAL: Only update if changed to prevent infinite loops
        const current = form.getValues();

        // ALWAYS update originalPrice (Stored as Market Value Sum) automatically
        if (current.originalPrice !== finalMarketValue) {
            form.setValue("originalPrice", finalMarketValue, { shouldDirty: true });
        }

        // Only auto-update discountedPrice (Pack Price) if NOT in manual mode
        if (!isManualPricing) {
            if (current.discountedPrice !== finalPackPrice) {
                form.setValue("discountedPrice", finalPackPrice, { shouldDirty: true });
            }
        }

        if (current.stock !== finalStock) {
            form.setValue("stock", finalStock, { shouldDirty: false });
        }

        // Deep comparison for images array
        if (JSON.stringify(current.images) !== JSON.stringify(packImages)) {
            form.setValue("images", packImages, { shouldDirty: false });
        }

        const packCategory = categories.find(c => c.slug === "packs");
        if (packCategory && current.categoryId !== packCategory.id) {
            form.setValue("categoryId", packCategory.id, { shouldDirty: false });
        }
    }, [watchedItems, watchedItemImages, categories, form.setValue, form.getValues, getProductById, isManualPricing]);

    const handleMagicCalculate = () => {
        let totalShopVal = 0;
        let totalMarketVal = 0;
        watchedItems.forEach((item) => {
            const product = getProductById(item.itemId);
            if (product) {
                const qty = Number(item.quantity) || 1;
                totalMarketVal += Number(product.originalPrice) * qty;
                totalShopVal += Number(product.discountedPrice || product.originalPrice) * qty;
            }
        });

        const roundedMarketTotal = Number(totalMarketVal.toFixed(3));
        const roundedShopTotal = Number(totalShopVal.toFixed(3));

        form.setValue("originalPrice", roundedMarketTotal, { shouldDirty: true });

        // Default discount: 5% off the SHOP value
        const discounted = Number((roundedShopTotal * 0.95).toFixed(3));
        form.setValue("discountedPrice", discounted, { shouldDirty: true });

        setIsManualPricing(false);
        toast.success("Auto-Pricing Active! ✨ (5% Pack Discount applied on Shop Value)");
    };

    const onSubmit = async (values: PackFormValues) => {
        setIsPending(true);
        setSuccess(null);
        try {
            // Ensure category is set if missing
            if (!values.categoryId) {
                const packCategory = categories.find(c => c.slug === "packs");
                if (packCategory) values.categoryId = packCategory.id;
            }

            const result = initialData
                ? await updatePack(initialData.id, values)
                : await createPack(values);

            if (result.success) {
                toast.success(result.success);
                router.push("/admin/inventory");
            } else {
                toast.error(result.error || "Error saving pack");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong");
        } finally {
            setIsPending(false);
        }
    };

    const onInvalid = (errors: unknown) => {
        console.log("Form Errors:", errors);
    };

    const handleAddProduct = () => {
        append({ itemId: "", quantity: 1 });
    };

    const handleImageSelectForItem = (index: number, url: string) => {
        const newItemImages = { ...watchedItemImages, [index.toString()]: url };
        form.setValue("itemImages", newItemImages);
    };

    const currentOriginalPrice = form.watch("originalPrice");
    const currentDiscountedPrice = form.watch("discountedPrice");
    const currentStock = form.watch("stock");

    return (
        <Card className="relative overflow-hidden border-pink-100 shadow-xl shadow-pink-100/20 rounded-3xl">
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold text-[#003366] flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        {initialData ? "Edit Pack ✨" : "Create New Pack"}
                    </CardTitle>
                    <CardDescription>
                        Bundle multiple products together. Pricing, stock, and images are calculated automatically.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-10">
                    <div className="grid grid-cols-1 gap-10">
                        {/* Main Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#003366] font-bold">
                                    Pack Name
                                </Label>
                                <Input
                                    id="name"
                                    {...form.register("name")}
                                    placeholder="e.g. Summer Essentials Bundle"
                                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[#003366] font-bold">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    {...form.register("description")}
                                    rows={3}
                                    placeholder="Describe what makes this pack special..."
                                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white resize-none"
                                />
                            </div>

                            {/* Auto-calculated Pricing & Stock Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Market Value</p>
                                        <Badge variant="outline" className="text-[9px] bg-white text-gray-400 border-gray-100">ORIGINAL</Badge>
                                    </div>
                                    <div className="relative">
                                        <p className="text-xl font-bold text-gray-400 line-through">
                                            {marketValue.toFixed(3)}
                                            <span className="text-xs ml-1">DT</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-blue-600 uppercase">Shop Value</p>
                                        <Badge variant="outline" className="text-[9px] bg-white text-blue-500 border-blue-100">AUTO-SUM</Badge>
                                    </div>
                                    <div className="relative">
                                        <p className="text-2xl font-bold text-[#003366]">
                                            {Number(form.watch("originalPrice") || 0).toFixed(3)}
                                            <span className="text-sm text-blue-400 font-bold ml-1">DT</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-green-50 border border-green-100 ring-2 ring-green-500/20 flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-green-600 uppercase">Pack Price</p>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleMagicCalculate}
                                            className="h-6 px-2 text-[10px] bg-white hover:bg-green-100 text-green-600 font-bold border border-green-100"
                                        >
                                            <Wand2 className="w-3 h-3 mr-1" /> Magic
                                        </Button>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.001"
                                            {...form.register("discountedPrice")}
                                            onChange={(e) => {
                                                setIsManualPricing(true);
                                                form.setValue("discountedPrice", Number(e.target.value));
                                            }}
                                            className="text-2xl font-bold text-[#003366] bg-transparent border-none p-0 focus-visible:ring-0 h-auto"
                                        />
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-green-400 font-bold">DT</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col justify-between">
                                    <p className="text-xs font-bold text-amber-600 uppercase mb-1">Dynamic Stock</p>
                                    <p className="text-2xl font-bold text-[#003366] flex items-center gap-2">
                                        {typeof currentStock === 'number' ? currentStock : 0}
                                        <Badge variant="outline" className="text-[10px] bg-white text-amber-500 border-amber-100">AUTO</Badge>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/30 border border-pink-100/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-[#003366]">Featured</Label>
                                        <p className="text-[10px] text-gray-500">Home page visibility</p>
                                    </div>
                                    <Switch
                                        checked={form.watch("isFeatured")}
                                        onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                                        className="data-[state=checked]:bg-[#FF8BBA]"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/30 border border-pink-100/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-[#003366]">Live</Label>
                                        <p className="text-[10px] text-gray-500">Website visibility</p>
                                    </div>
                                    <Switch
                                        checked={form.watch("isLive")}
                                        onCheckedChange={(checked) => form.setValue("isLive", checked)}
                                        className="data-[state=checked]:bg-[#A78BFA]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pack Items Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <Label className="text-[#003366] font-bold text-lg">
                                    📦 Pack Contents & Gallery
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                    The pack image will be composed of one image from each selected product.
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={handleAddProduct}
                                variant="outline"
                                size="sm"
                                className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Product
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => {
                                const selectedItemId = form.watch(`packItems.${index}.itemId`);
                                const product = getProductById(selectedItemId);
                                const currentThumbnail = watchedItemImages[index.toString()] || product?.images[0]?.url;

                                return (
                                    <div key={field.id} className="relative p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Product Selection & Quantity */}
                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr] gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-[#003366] uppercase tracking-wider">Product</Label>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                form.setValue(`packItems.${index}.itemId`, value);
                                                                const product = getProductById(value);
                                                                const currentQty = Number(form.getValues(`packItems.${index}.quantity`));
                                                                if (product && currentQty > product.stock) {
                                                                    form.setValue(`packItems.${index}.quantity`, product.stock);
                                                                }
                                                            }}
                                                            value={selectedItemId}
                                                        >
                                                            <SelectTrigger className="w-full rounded-xl border-pink-100 bg-pink-50/30">
                                                                <SelectValue placeholder="Search product..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {availableProducts.map((p) => (
                                                                    <SelectItem key={p.id} value={p.id}>
                                                                        {p.name} ({Number(p.discountedPrice).toFixed(3)} DT)
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold text-[#003366] uppercase tracking-wider">Qty</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={product?.stock || 1}
                                                            {...form.register(`packItems.${index}.quantity`, {
                                                                onChange: (e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    const max = product?.stock || 1;
                                                                    if (val > max) {
                                                                        form.setValue(`packItems.${index}.quantity`, max);
                                                                    } else if (val < 1) {
                                                                        form.setValue(`packItems.${index}.quantity`, 1);
                                                                    }
                                                                }
                                                            })}
                                                            className="rounded-xl border-pink-100"
                                                        />
                                                    </div>
                                                </div>

                                                {product && (
                                                    <div className="flex items-center justify-between text-xs px-2 py-1 bg-gray-50 rounded-lg">
                                                        <span className="text-gray-500">Unit Price: <span className="font-bold text-[#003366]">{Number(product.discountedPrice).toFixed(3)} DT</span></span>
                                                        <span className="text-gray-500">Available: <span className="font-bold text-[#003366]">{product.stock}</span></span>
                                                    </div>
                                                )}
                                            </div>

                                            {product && (
                                                <div className="md:w-64 space-y-2">
                                                    <Label className="text-xs font-bold text-[#003366] uppercase tracking-wider">Select Pack Image</Label>
                                                    <div className="flex flex-wrap gap-2 p-2 bg-pink-50/20 rounded-2xl border border-pink-50">
                                                        {product.images.map((img: { url: string }) => (
                                                            <button
                                                                key={img.url}
                                                                type="button"
                                                                onClick={() => handleImageSelectForItem(index, img.url)}
                                                                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentThumbnail === img.url ? "border-pink-500 ring-2 ring-pink-200" : "border-transparent"
                                                                    }`}
                                                            >
                                                                <Image src={img.url} alt="Product" fill className="object-cover" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {fields.length === 0 && (
                                <div className="text-center py-12 border-2 border-dashed border-pink-100 rounded-3xl bg-pink-50/10">
                                    <Package className="w-10 h-10 mx-auto text-pink-200 mb-3" />
                                    <p className="text-sm text-[#003366] font-medium">Add products to build this pack</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-8 border-t border-pink-50 flex justify-between items-center">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onCancel ? onCancel() : router.push("/admin/inventory")}
                        className="rounded-full text-gray-400 hover:text-[#003366]"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button
                        disabled={isPending || fields.length === 0}
                        type="submit"
                        className="bg-[#FF8BBA] hover:bg-[#FF75AA] text-white px-10 py-6 rounded-full font-bold shadow-xl shadow-pink-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : initialData ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {isPending ? "Saving Pack..." : initialData ? "Update Pack" : "Publish Pack"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
