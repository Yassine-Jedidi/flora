"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductSchema,
  type ProductFormValues,
} from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/app/actions/product";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { Loader2, Plus, X, Save, RotateCcw, Sparkles } from "lucide-react";
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

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: (ProductFormValues & { id: string }) | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ProductForm({
  categories,
  initialData,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations("Admin.productForm");
  const [isPending, setIsPending] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: (initialData
      ? {
        ...initialData,
        // If discountedPrice exists in DB, then:
        // UI Sale Price = DB discountedPrice
        // UI Original Price = DB originalPrice
        // If it doesn't exist:
        // UI Sale Price = DB originalPrice
        // UI Original Price = undefined
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
      }) as ProductFormValues,
  });

  const images = form.watch("images") || [];
  const [discountPercent, setDiscountPercent] = useState<number | undefined>(
    undefined
  );

  // Watch prices to calculate discount percentage
  const originalPrice = form.watch("originalPrice");
  const discountedPrice = form.watch("discountedPrice");

  // Update discount percentage when prices change
  useEffect(() => {
    const orig = Number(originalPrice);
    const sale = Number(discountedPrice);
    if (orig && sale && orig > sale) {
      const calculated = Math.round(((orig - sale) / orig) * 100);
      setDiscountPercent(calculated);
    } else {
      setDiscountPercent(undefined);
    }
  }, [originalPrice, discountedPrice]);

  // Handle discount percentage input
  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = Number(e.target.value);
    setDiscountPercent(percent);

    const currentSalePrice = Number(form.getValues("discountedPrice"));
    const currentOrigPrice = Number(form.getValues("originalPrice"));

    if (percent > 0 && percent < 100) {
      if (currentOrigPrice) {
        // If we have an original price, update the sale price
        const salePrice = currentOrigPrice * (1 - percent / 100);
        form.setValue("discountedPrice", Number(salePrice.toFixed(3)), {
          shouldValidate: true,
        });
      } else if (currentSalePrice) {
        // If we only have sale price, calculate what the original price should be
        const origPrice = currentSalePrice / (1 - percent / 100);
        form.setValue("originalPrice", Number(origPrice.toFixed(3)), {
          shouldValidate: true,
        });
      }
    }
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

  const onSubmit = async (values: ProductFormValues) => {
    setIsPending(true);
    setSuccess(null);
    try {
      if (isUploading) {
        toast.error(t("toasts.waitUpload"));
        return;
      }
      if (isDeleting) {
        toast.error(t("toasts.waitDelete"));
        return;
      }

      console.log("Form Values:", values);
      const result = initialData
        ? await updateProduct(initialData.id, values)
        : await createProduct(values);

      if (result.success) {
        // Since result.success usually contains a string from server action, 
        // we might want to override it with our translation if it's dynamic
        toast.success(initialData ? t("toasts.successUpdate") : t("toasts.successCreate"));
        // Immediate redirection to inventory for a smooth, fast experience
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

  const removeImage = async (urlToRemove: string) => {
    setIsDeleting(true);
    // Optimistically update UI
    const updatedImages = images.filter((url) => url !== urlToRemove);
    form.setValue("images", updatedImages, { shouldValidate: true });

    // Delete from storage in background
    try {
      // Import this from actions if not already imported
      const { deleteProductImage } = await import("@/app/actions/product");
      await deleteProductImage(urlToRemove);
      toast.success(t("toasts.imageDeleted"));
    } catch {
      toast.error(t("toasts.imageDeleteFail"));
    } finally {
      setIsDeleting(false);
    }
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
          <CardTitle className="text-2xl font-bold text-flora-dark">
            {initialData ? t("title.edit") : t("title.new")}
          </CardTitle>
          <CardDescription>
            {initialData ? t("desc.edit") : t("desc.new")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column: Details */}
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
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="description"
                    className="text-flora-dark font-bold"
                  >
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
                    {isEnhancing ? t("buttons.enhancing") : t("buttons.magicMarkdown")}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  rows={4}
                  placeholder={t("placeholders.description")}
                  className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-xs">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              {/* Pricing Section with Discount */}
              <div className="space-y-4 p-4 rounded-2xl bg-gradient-to-br from-pink-50/50 to-purple-50/30 border border-pink-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-flora-dark">
                    {t("sections.pricing")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="discountedPrice"
                      className="text-flora-dark font-bold"
                    >
                      {t("labels.salePrice")}{" "}
                      {discountPercent && discountPercent > 0 && (
                        <span className="text-red-500 text-xs ml-2">
                          {t("saleTag", { percent: discountPercent })}
                        </span>
                      )}
                    </Label>
                    <Input
                      id="discountedPrice"
                      {...form.register("discountedPrice")}
                      type="number"
                      step="0.001"
                      placeholder={t("placeholders.salePrice")}
                      className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white font-bold"
                    />
                    {form.formState.errors.discountedPrice && (
                      <p className="text-red-500 text-xs">
                        {form.formState.errors.discountedPrice.message}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400">
                      {t("help.salePrice")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="discountPercent"
                      className="text-flora-dark font-bold"
                    >
                      {t("labels.discountPercent")}
                    </Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      min="0"
                      max="99"
                      value={discountPercent ?? ""}
                      onChange={handleDiscountChange}
                      placeholder="0"
                      className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                    />
                    <p className="text-[10px] text-gray-400">
                      {t("help.discountPercent")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="originalPrice"
                    className="text-flora-dark font-bold"
                  >
                    {t("labels.originalPrice")}
                  </Label>
                  <Input
                    id="originalPrice"
                    {...form.register("originalPrice")}
                    type="number"
                    step="0.001"
                    placeholder={t("placeholders.originalPrice")}
                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                  />
                  {form.formState.errors.originalPrice && (
                    <p className="text-red-500 text-xs">
                      {form.formState.errors.originalPrice.message}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400">
                    {t("help.originalPrice")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-flora-dark font-bold">
                    {t("labels.stock")}
                  </Label>
                  <Input
                    id="stock"
                    {...form.register("stock")}
                    type="number"
                    className="rounded-xl border-pink-100 focus-visible:ring-pink-300 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-flora-dark font-bold">{t("labels.category")}</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("categoryId", value, { shouldValidate: true })
                    }
                    value={form.watch("categoryId")}
                  >
                    <SelectTrigger className="w-full rounded-xl border-pink-100 focus:ring-pink-300 bg-white text-left">
                      <SelectValue placeholder={t("placeholders.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-white border-pink-100 shadow-xl">
                      {categories.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.id}
                          className="focus:bg-pink-50 cursor-pointer"
                        >
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-red-500 text-xs">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-50/30 border border-pink-100/50 hover:bg-pink-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-flora-dark">
                      {t("sections.featured")}
                    </Label>
                    <p className="text-[10px] text-gray-500">
                      {t("help.featured")}
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("isFeatured")}
                    onCheckedChange={(checked) =>
                      form.setValue("isFeatured", checked)
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/30 border border-purple-100/50 hover:bg-purple-50/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-flora-purple">
                      {t("sections.live")}
                    </Label>
                    <p className="text-[10px] text-gray-500">
                      {t("help.live")}
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("isLive")}
                    onCheckedChange={(checked) =>
                      form.setValue("isLive", checked)
                    }
                    className="data-[state=checked]:bg-flora-purple"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-gray-700">
                      {t("sections.archived")}
                    </Label>
                    <p className="text-[10px] text-gray-500">
                      {t("help.archived")}
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("isArchived")}
                    onCheckedChange={(checked) =>
                      form.setValue("isArchived", checked)
                    }
                    className="data-[state=checked]:bg-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Images */}
            <div className="space-y-6">
              <Label className="text-flora-dark font-bold">
                {t("labels.photography")}
              </Label>

              <div className="grid grid-cols-2 gap-4">
                {images.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-pink-100 group shadow-sm"
                  >
                    <Image
                      src={url}
                      alt="Product"
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
                        {isUploading ? t("buttons.uploading") : t("buttons.addPhoto")}
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
        </CardContent>

        <CardFooter className="pt-8 border-t border-pink-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">
            {t("help.safeVault")}
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onCancel ? onCancel() : router.push("/admin/inventory")}
              className="rounded-full border-pink-100 text-gray-500 hover:bg-pink-50 px-6 font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {initialData ? t("buttons.back") : t("buttons.cancel")}
            </Button>
            <Button
              disabled={isPending || isUploading || isDeleting}
              type="submit"
              className="bg-primary hover:bg-[#FF75AA] text-white px-8 py-2 rounded-full font-bold shadow-lg shadow-pink-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 h-auto text-sm"
            >
              {(isUploading || isDeleting) ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : initialData ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isUploading ? t("buttons.uploadingImages") : isDeleting ? t("buttons.deletingImage") : isPending ? t("buttons.saving") : initialData ? t("buttons.save") : t("buttons.list")}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card >
  );
}
