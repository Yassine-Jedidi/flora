"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    PackSchema,
    type PackFormValues,
} from "@/lib/validations/pack";
import { createPack, updatePack } from "@/app/actions/pack";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { Loader2, Plus, X, Save, RotateCcw, Package, Wand2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { enhanceDescription } from "@/app/actions/ai";
import { useTranslations } from "next-intl";

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
    discountedPrice: number | null;
    originalPrice: number;
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
}: PackFormProps) {
    const router = useRouter();
    const t = useTranslations("Admin.packForm");
    const [isPending, setIsPending] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [isManualPricing, setIsManualPricing] = useState(!!initialData);
    const [marketValue, setMarketValue] = useState(0);
    const [shopValue, setShopValue] = useState(0);

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
    const rawWatchedItems = useWatch({
        control: form.control,
        name: "packItems"
    });
    const watchedItems = useMemo(() => rawWatchedItems || [], [rawWatchedItems]);

    const images = form.watch("images") || [];

    const { startUpload, isUploading } = useUploadThing("productImage", {
        onClientUploadComplete: (res: { url: string }[]) => {
            const urls = res.map((f) => f.url);
            const updatedImages = [...images, ...urls];
            form.setValue("images", updatedImages, { shouldValidate: true });
        },
        onUploadError: () => {
            toast.error(t("toasts.errorGeneric"));
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
            return;
        }

        let totalShopValueSum = 0;
        let totalMarketValueSum = 0;
        let minStock = Infinity;

        watchedItems.forEach((item: { itemId: string; quantity: unknown }) => {
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

            }
        });

        const finalMarketValue = Number(totalMarketValueSum.toFixed(3));
        const finalShopValue = Number(totalShopValueSum.toFixed(3));
        const finalPackPrice = Number((finalShopValue * 0.95).toFixed(3));
        const finalStock = minStock === Infinity ? 0 : minStock;

        setMarketValue(finalMarketValue);
        setShopValue(finalShopValue);

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


        const packCategory = categories.find(c => c.slug === "packs");
        if (packCategory && current.categoryId !== packCategory.id) {
            form.setValue("categoryId", packCategory.id, { shouldDirty: false });
        }
    }, [watchedItems, categories, form, getProductById, isManualPricing]);

    const handleMagicCalculate = () => {
        let totalShopVal = 0;
        let totalMarketVal = 0;
        watchedItems.forEach((item: { itemId: string; quantity: unknown }) => {
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
        toast.success(t("toasts.autoPricing"));
    };

    const handleAIByDescription = async () => {
        const currentDesc = form.getValues("description");
        if (!currentDesc || currentDesc.length < 10) {
            toast.error(t("toasts.descShort"));
            return;
        }

        setIsEnhancing(true);
        try {
            const result = await enhanceDescription(currentDesc);
            if (result.text) {
                form.setValue("description", result.text);
                toast.success(t("toasts.descEnhanced"));
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch {
            toast.error(t("toasts.descFail"));
        } finally {
            setIsEnhancing(false);
        }
    };

    const onSubmit = async (values: PackFormValues) => {
        setIsPending(true);
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
                // For packs, we might want a specific success toast too
                toast.success(initialData ? t("toasts.successUpdate") : t("toasts.successCreate"));
                router.push("/admin/inventory");
            } else {
                toast.error(result.error || t("toasts.errorSave"));
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(t("toasts.errorGeneric"));
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


    const currentStock = form.watch("stock");

    return (
        <Card className="relative overflow-hidden border-pink-100 shadow-xl shadow-pink-100/20 rounded-3xl">
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
                <CardHeader className="pb-8">
                    <CardTitle className="text-2xl font-bold text-flora-dark flex items-center gap-2">
                        <Package className="w-6 h-6 text-pink-500" />
                        {initialData ? t("title.edit") : t("title.new")}
                    </CardTitle>
                    <CardDescription>
                        {t("desc")}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Main Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-flora-dark font-bold">
                                    {t("labels.name")}
                                </Label>
                                <Input
                                    id="name"
                                    {...form.register("name")}
                                    placeholder={t("placeholders.name")}
                                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="description" className="text-flora-dark font-bold">
                                        {t("labels.description")}
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleAIByDescription}
                                        disabled={isEnhancing}
                                        className="h-8 text-[10px] font-black uppercase tracking-tighter text-flora-purple hover:text-[#8B5CF6] hover:bg-purple-50 transition-all gap-1.5"
                                    >
                                        {isEnhancing ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-3 h-3" />
                                        )}
                                        {isEnhancing ? t("buttons.magic") : t("buttons.magic")}
                                    </Button>
                                </div>
                                <Textarea
                                    id="description"
                                    {...form.register("description")}
                                    rows={3}
                                    placeholder={t("placeholders.description")}
                                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white resize-none"
                                />
                            </div>

                        </div>

                        {/* Right Column: Images */}
                        <div className="space-y-6">
                            <Label className="text-flora-dark font-bold">
                                {t("labels.photography")}
                            </Label>

                            <div className="grid grid-cols-2 gap-4">
                                {images.map((url: string) => (
                                    <div
                                        key={url}
                                        className="relative aspect-square rounded-2xl overflow-hidden border border-pink-100 group shadow-sm"
                                    >
                                        <Image
                                            src={url}
                                            alt="Pack"
                                            fill
                                            className="object-cover transition-transform group-hover:scale-110"
                                        />
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
                                                ${isUploading
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                                }
                                            `}
                                        >
                                            <div className="bg-pink-100 p-3 rounded-full mb-3 text-primary group-hover:scale-110 transition-transform">
                                                {isUploading ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <Plus className="w-6 h-6" />
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-flora-dark">
                                                {isUploading ? t("buttons.uploading") : t("placeholders.addPhoto")}
                                            </p>
                                            <p className="text-[10px] text-pink-400 mt-1">
                                                {t("help.photoLimit")}
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>
                            {form.formState.errors.images && (
                                <p className="text-red-500 text-xs text-center">
                                    {form.formState.errors.images.message}
                                </p>
                            )}
                            <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-semibold">
                                {t("help.photoSpecs")}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/30 border border-pink-100/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-flora-dark">{t("labels.featured")}</Label>
                                    <p className="text-[10px] text-gray-500">{t("help.featured")}</p>
                                </div>
                                <Switch
                                    checked={form.watch("isFeatured")}
                                    onCheckedChange={(checked) => form.setValue("isFeatured", checked)}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/30 border border-pink-100/50">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-flora-dark">{t("labels.live")}</Label>
                                    <p className="text-[10px] text-gray-500">{t("help.live")}</p>
                                </div>
                                <Switch
                                    checked={form.watch("isLive")}
                                    onCheckedChange={(checked) => form.setValue("isLive", checked)}
                                    className="data-[state=checked]:bg-flora-purple"
                                />
                            </div>
                        </div>

                        {/* Auto-calculated Pricing & Stock Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{t("labels.marketValue")}</p>
                                    <Badge variant="outline" className="text-[9px] bg-white text-gray-400 border-gray-100">{t("badges.original")}</Badge>
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
                                    <p className="text-xs font-bold text-blue-600 uppercase">{t("labels.shopValue")}</p>
                                    <Badge variant="outline" className="text-[9px] bg-white text-blue-500 border-blue-100">{t("badges.autoSum")}</Badge>
                                </div>
                                <div className="relative">
                                    <p className="text-2xl font-bold text-flora-dark">
                                        {shopValue.toFixed(3)}
                                        <span className="text-sm text-blue-400 font-bold ml-1">DT</span>
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-green-50 border border-green-100 ring-2 ring-green-500/20 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-green-600 uppercase">{t("labels.packPrice")}</p>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMagicCalculate}
                                        className="h-6 px-2 text-[10px] bg-white hover:bg-green-100 text-green-600 font-bold border border-green-100"
                                    >
                                        <Wand2 className="w-3 h-3 mr-1" /> {t("buttons.magic")}
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
                                        className="text-2xl font-bold text-flora-dark bg-transparent border-none p-0 focus-visible:ring-0 h-auto"
                                    />
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-green-400 font-bold">DT</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col justify-between">
                                <p className="text-xs font-bold text-amber-600 uppercase mb-1">{t("labels.dynamicStock")}</p>
                                <p className="text-2xl font-bold text-flora-dark flex items-center gap-2">
                                    {typeof currentStock === 'number' ? currentStock : 0}
                                    <Badge variant="outline" className="text-[10px] bg-white text-amber-500 border-amber-100">{t("badges.auto")}</Badge>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pack Items Section */}
                    <div className="pt-10 border-t border-pink-50 space-y-6">
                        <div className="flex items-center justify-between border-b pb-4">
                            <div>
                                <Label className="text-flora-dark font-bold text-lg">
                                    {t("labels.contents")}
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t("help.contents")}
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
                                {t("buttons.addProduct")}
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => {
                                const selectedItemId = form.watch(`packItems.${index}.itemId`);
                                const product = getProductById(selectedItemId);

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
                                                        <Label className="text-xs font-bold text-flora-dark uppercase tracking-wider">{t("labels.product")}</Label>
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
                                                                <SelectValue placeholder={t("placeholders.search")} />
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
                                                        <Label className="text-xs font-bold text-flora-dark uppercase tracking-wider">{t("labels.qty")}</Label>
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
                                                        <span className="text-gray-500">{t("labels.unitPrice")}: <span className="font-bold text-flora-dark">{Number(product.discountedPrice).toFixed(3)} DT</span></span>
                                                        <span className="text-gray-500">{t("labels.available")}: <span className="font-bold text-flora-dark">{product.stock}</span></span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Images Preview */}
                                            {product && product.images && product.images.length > 0 && (
                                                <div className="flex-none w-full md:w-48 space-y-2">
                                                    <Label className="text-[10px] font-bold text-flora-dark uppercase tracking-wider">{t("labels.visuals")}</Label>
                                                    <div className="flex md:grid md:grid-cols-2 gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                                                        {product.images.map((img: { url: string }, i: number) => (
                                                            <div key={i} className="relative w-16 h-16 md:w-full md:aspect-square rounded-xl overflow-hidden border border-pink-100 flex-none bg-[#FDF2F8]">
                                                                <Image
                                                                    src={img.url}
                                                                    alt={`${product.name} ${i + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
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
                                    <p className="text-sm text-flora-dark font-medium">{t("help.noProducts")}</p>
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
                        className="rounded-full text-gray-400 hover:text-flora-dark"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> {t("buttons.cancel")}
                    </Button>
                    <Button
                        disabled={isPending || fields.length === 0}
                        type="submit"
                        className="bg-primary hover:bg-[#FF75AA] text-white px-10 py-6 rounded-full font-bold shadow-xl shadow-pink-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : initialData ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {isPending ? t("buttons.saving") : initialData ? t("buttons.update") : t("buttons.publish")}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
