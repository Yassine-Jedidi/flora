"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, Star, ChevronLeft, ChevronRight, User, MapPin, Phone, Loader2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TUNISIA_GOVERNORATES, TUNISIA_LOCATIONS } from "@/lib/constants/tunisia";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSchema, type OrderFormValues } from "@/lib/validations/order";
import { createOrder } from "@/app/actions/order";

interface Product {
    id: string;
    name: string;
    description: string;
    originalPrice: number;
    discountedPrice?: number;
    stock: number;
    category: { name: string };
    images: { url: string }[];
}

export function ProductDetails({ product }: { product: Product }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);

    const form = useForm<OrderFormValues>({
        resolver: zodResolver(OrderSchema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            governorate: "",
            city: "",
            detailedAddress: "",
            quantity: 1,
        },
    });

    const selectedGov = form.watch("governorate");
    const selectedCity = form.watch("city");
    const quantity = form.watch("quantity");
    const availableCities = selectedGov ? TUNISIA_LOCATIONS[selectedGov] || [] : [];

    const onSubmit = async (values: OrderFormValues) => {
        setIsPending(true);
        try {
            console.log("Submitting order...", values);
            const result = await createOrder(product.id, values);
            console.log("Order result:", result);

            if (result.success) {
                setSuccess(true);
                form.reset();
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                console.error("Order failed:", result.error);
                alert(result.error || "An error occurred.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("An error occurred during submission.");
        } finally {
            setIsPending(false);
        }
    };

    const nextImage = useCallback(() => {
        if (product.images.length > 0) {
            setSelectedImage((prev) => (prev + 1) % product.images.length);
        }
    }, [product.images.length]);

    const prevImage = useCallback(() => {
        if (product.images.length > 0) {
            setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    }, [product.images.length]);

    useEffect(() => {
        if (product.images.length <= 1) return;
        const interval = setInterval(nextImage, 5000);
        return () => clearInterval(interval);
    }, [nextImage, product.images.length]);

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center text-[#FF8BBA]">
                    <ShoppingBag className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-[#3E343C]">Order Placed! ✨</h2>
                    <p className="text-[#8B7E84] max-w-md">
                        Thank you for your order, {product.name} will be with you soon. We will contact you by phone to confirm the details.
                    </p>
                </div>
                <Button
                    onClick={() => setSuccess(false)}
                    className="rounded-full px-8 bg-[#FF8BBA] hover:bg-pink-600 shadow-xl shadow-pink-100"
                >
                    Order another item
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div className="relative space-y-8">
                {/* Background Glow */}
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-pink-100/50 rounded-full blur-[100px] -z-10" />
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-50/50 rounded-full blur-[100px] -z-10" />

                <div className="relative mx-auto max-w-[550px] aspect-square overflow-hidden rounded-[3rem] bg-[#F9FAFB] border border-pink-50 shadow-sm group">
                    <div className="relative w-full h-full">
                        {product.images.map((img, idx) => (
                            <div
                                key={img.url}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${selectedImage === idx ? "opacity-100 z-0" : "opacity-0 -z-10"
                                    }`}
                            >
                                <Image
                                    src={img.url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority={idx === 0}
                                />
                            </div>
                        ))}

                        {!product.images[0] && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <ShoppingBag className="w-20 h-20 text-gray-200" />
                            </div>
                        )}
                    </div>

                    {/* Navigation Arrows */}
                    {product.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.preventDefault(); prevImage(); }}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 text-[#FF8BBA] hover:scale-110 active:scale-95"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); nextImage(); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 text-[#FF8BBA] hover:scale-110 active:scale-95"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Share/Favorite on image */}
                    <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 text-[#FF8BBA]">
                        <Heart className="w-6 h-6" />
                    </button>

                    {/* Pulse pagination dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {product.images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 rounded-full transition-all duration-500 ${selectedImage === idx ? "w-8 bg-[#FF8BBA]" : "w-2 bg-pink-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                    <div className="flex justify-center gap-4 overflow-x-auto pb-2 scrollbar-none">
                        {product.images.map((img, index) => (
                            <button
                                key={img.url}
                                onClick={() => setSelectedImage(index)}
                                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${selectedImage === index ? "border-[#FF8BBA] shadow-md scale-95" : "border-transparent hover:border-pink-200"
                                    }`}
                            >
                                <Image src={img.url} alt="" fill className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#FF8BBA] bg-pink-50 px-3 py-1 rounded-full uppercase tracking-widest border border-pink-100">
                            {product.category.name}
                        </span>
                        <div className="flex items-center gap-1 ml-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-[10px] font-bold text-gray-400 ml-1">(4.9)</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-[#3E343C] leading-tight tracking-tight">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            {product.discountedPrice && product.discountedPrice < product.originalPrice && (
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold text-gray-400 line-through">
                                        {product.originalPrice.toFixed(2)} DT
                                    </span>
                                    <span className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-md">
                                        -{Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)}%
                                    </span>
                                </div>
                            )}
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-[#FF8BBA]">
                                    {(product.discountedPrice || product.originalPrice).toFixed(2)}
                                </span>
                                <span className="text-xl font-bold text-[#FF8BBA]">DT</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-pink-100 via-pink-50 to-transparent" />

                <div className="space-y-4">
                    <p className="text-[#8B7E84] leading-relaxed text-lg">
                        {product.description}
                    </p>
                </div>

                {/* Quick Order Form */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6 border-t border-dotted border-pink-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-black text-[#3E343C] uppercase tracking-wider">Quick Order Details</span>
                        <div className="h-px flex-1 bg-pink-50" />
                    </div>

                    <div className="space-y-4">
                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-[#8B7E84] uppercase tracking-[0.2em] ml-4">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF8BBA]/40 group-focus-within:text-[#FF8BBA] transition-colors" />
                                    <Input
                                        {...form.register("fullName")}
                                        placeholder="e.g. Sarra Ben Ali"
                                        className={`h-12 rounded-full pl-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#FF8BBA] focus:ring-4 focus:ring-pink-50 transition-all text-sm font-medium ${form.formState.errors.fullName ? "border-red-300" : ""}`}
                                    />
                                </div>
                                {form.formState.errors.fullName && (
                                    <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-tighter">
                                        {form.formState.errors.fullName.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-[#8B7E84] uppercase tracking-[0.2em] ml-4">Phone Number</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF8BBA]/40 group-focus-within:text-[#FF8BBA] transition-colors" />
                                    <Input
                                        {...form.register("phoneNumber")}
                                        placeholder="20 000 000"
                                        maxLength={8}
                                        className={`h-12 rounded-full pl-12 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#FF8BBA] focus:ring-4 focus:ring-pink-50 transition-all text-sm font-medium ${form.formState.errors.phoneNumber ? "border-red-300" : ""}`}
                                    />
                                </div>
                                {form.formState.errors.phoneNumber && (
                                    <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-tighter">
                                        {form.formState.errors.phoneNumber.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Location Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-[#8B7E84] uppercase tracking-[0.2em] ml-4">Governorate</Label>
                                <Select
                                    value={selectedGov}
                                    onValueChange={(val) => {
                                        form.setValue("governorate", val, { shouldValidate: true });
                                        form.setValue("city", "");
                                    }}
                                >
                                    <SelectTrigger className={`!h-12 rounded-full px-6 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#FF8BBA] focus:ring-4 focus:ring-pink-50 transition-all text-sm font-medium w-full ${form.formState.errors.governorate ? "border-red-300" : ""}`}>
                                        <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="rounded-2xl border-pink-50 shadow-xl max-h-48 bg-white">
                                        {TUNISIA_GOVERNORATES.map((gov) => (
                                            <SelectItem key={gov} value={gov} className="rounded-xl focus:bg-pink-50 focus:text-[#FF8BBA]">
                                                {gov}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.governorate && (
                                    <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-tighter">
                                        {form.formState.errors.governorate.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-[#8B7E84] uppercase tracking-[0.2em] ml-4">City / Delegation</Label>
                                <Select
                                    value={selectedCity}
                                    onValueChange={(val) => form.setValue("city", val, { shouldValidate: true })}
                                    disabled={!selectedGov}
                                >
                                    <SelectTrigger className={`!h-12 rounded-full px-6 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#FF8BBA] focus:ring-4 focus:ring-pink-50 transition-all text-sm font-medium w-full disabled:opacity-50 ${form.formState.errors.city ? "border-red-300" : ""}`}>
                                        <SelectValue placeholder={selectedGov ? "Select city" : "Choose state first"} />
                                    </SelectTrigger>
                                    <SelectContent position="popper" className="rounded-2xl border-pink-50 shadow-xl max-h-48 bg-white">
                                        {availableCities.map((city) => (
                                            <SelectItem key={city} value={city} className="rounded-xl focus:bg-pink-50 focus:text-[#FF8BBA]">
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.city && (
                                    <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-tighter">
                                        {form.formState.errors.city.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Detailed Address */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-[#8B7E84] uppercase tracking-[0.2em] ml-4">Detailed Address</Label>
                            <Textarea
                                {...form.register("detailedAddress")}
                                placeholder="Street name, house number, floor..."
                                className={`min-h-20 rounded-[1.5rem] p-4 bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#FF8BBA] focus:ring-4 focus:ring-pink-50 transition-all text-sm font-medium ${form.formState.errors.detailedAddress ? "border-red-300" : ""}`}
                            />
                            {form.formState.errors.detailedAddress && (
                                <p className="text-[10px] text-red-500 font-bold ml-4 uppercase tracking-tighter">
                                    {form.formState.errors.detailedAddress.message}
                                </p>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-gray-50/50 border border-gray-100">
                            <Label className="text-[10px] font-black text-[#8B7E84] uppercase tracking-[0.2em]">Quantity</Label>
                            <div className="flex items-center gap-4 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = form.getValues("quantity");
                                        if (current > 1) form.setValue("quantity", current - 1);
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-[#FF8BBA] transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-black text-[#3E343C]">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const current = form.getValues("quantity");
                                        if (current < product.stock) {
                                            form.setValue("quantity", current + 1);
                                        }
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-[#FF8BBA] transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 mt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 h-16 rounded-full bg-[#E54884] hover:bg-[#D43478] text-white text-xl font-black shadow-xl shadow-pink-100 transition-all hover:scale-[1.02] active:scale-95 gap-3 uppercase tracking-tight disabled:opacity-70"
                            >
                                {isPending ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingBag className="w-6 h-6" />
                                        Place Order ✨
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-dotted border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-[#3E343C]">Premium Quality</span>
                            <span className="text-[10px] text-gray-400 font-medium">Certified Jewelry</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-[#3E343C]">Fast Delivery</span>
                            <span className="text-[10px] text-gray-400 font-medium">Standard & Express</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <RefreshCw className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-[#3E343C]">Easy Returns</span>
                            <span className="text-[10px] text-gray-400 font-medium">30 Days Return</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
