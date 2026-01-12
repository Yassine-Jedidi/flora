"use client";

import { useState } from "react";
import { useCart } from "@/lib/hooks/use-cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSchema, type OrderFormValues } from "@/lib/validations/order";
import { createOrder } from "@/app/actions/order";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TUNISIA_GOVERNORATES,
  TUNISIA_LOCATIONS,
} from "@/lib/constants/tunisia";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Truck,
  CreditCard,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Price } from "@/components/shop/price";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart, updateQuantity, removeItem } = useCart();
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const shippingCost = cart.length > 0 ? 7.0 : 0;
  const finalTotal = totalPrice + shippingCost;

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      governorate: "",
      city: "",
      detailedAddress: "",
    },
  });

  const selectedGov = form.watch("governorate");
  const availableCities = selectedGov
    ? TUNISIA_LOCATIONS[selectedGov] || []
    : [];

  const onSubmit = async (values: OrderFormValues) => {
    if (cart.length === 0) return;

    setIsPending(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const result = await createOrder({
        ...values,
        items: orderItems,
        totalPrice: finalTotal,
      });

      if (result.success) {
        setSuccess(true);
        clearCart();
        toast.success("Order placed successfully! ✨");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(result.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to place order.");
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 pt-32">
          <div className="max-w-md w-full bg-pink-50/50 rounded-[40px] p-12 text-center border-2 border-dashed border-pink-100 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-[#FF8BBA] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-200">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-[#003366] mb-4">
              Order Completed!
            </h1>
            <p className="text-gray-500 font-bold mb-8">
              Your order has been placed successfully. We&apos;ll contact you soon
              for confirmation.
            </p>
            <Link href="/">
              <Button className="bg-[#A78BFA] hover:bg-[#8B5CF6] text-white rounded-full px-10 py-6 font-black text-lg transition-all shadow-lg shadow-purple-100">
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs / Back */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-[#FF8BBA] font-bold mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to accessories
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Left Side: Form */}
            <div className="lg:col-span-7">
              <div className="mb-10">
                <h1 className="text-4xl font-black text-[#003366] tracking-tight mb-2">
                  Checkout
                </h1>
                <p className="text-gray-400 font-bold">
                  Complete your purchase by providing your shipping details.
                </p>
              </div>

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="p-8 rounded-4xl bg-white border border-pink-50 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-[#FF8BBA]" />
                    </div>
                    <h2 className="text-xl font-black text-[#003366]">
                      Guest Information
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullName"
                        className="text-[#003366] font-bold ml-1"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        {...form.register("fullName")}
                        placeholder="Enter your full name"
                        className="rounded-2xl border-pink-100 focus:ring-pink-300 py-6 text-[#003366] font-medium"
                      />
                      {form.formState.errors.fullName && (
                        <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                          {form.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="text-[#003366] font-bold ml-1"
                      >
                        Phone Number (8 digits)
                      </Label>
                      <Input
                        id="phoneNumber"
                        {...form.register("phoneNumber")}
                        placeholder="Example: 20123456"
                        className="rounded-2xl border-pink-100 focus:ring-pink-300 py-6 text-[#003366] font-medium"
                      />
                      {form.formState.errors.phoneNumber && (
                        <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                          {form.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[#003366] font-bold ml-1">
                        Governorate
                      </Label>
                      <Select
                        onValueChange={(v) =>
                          form.setValue("governorate", v, {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger className="w-full rounded-2xl border-pink-100 focus:ring-pink-300 h-13 text-[#003366] font-medium">
                          <SelectValue placeholder="Select governorate" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-pink-100">
                          {TUNISIA_GOVERNORATES.map((gov) => (
                            <SelectItem key={gov} value={gov}>
                              {gov}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.governorate && (
                        <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                          {form.formState.errors.governorate.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#003366] font-bold ml-1">
                        City / Delegation
                      </Label>
                      <Select
                        disabled={!selectedGov}
                        onValueChange={(v) =>
                          form.setValue("city", v, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger className="w-full rounded-2xl border-pink-100 focus:ring-pink-300 h-13 text-[#003366] font-medium">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-pink-100">
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.city && (
                        <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                          {form.formState.errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="detailedAddress"
                      className="text-[#003366] font-bold ml-1"
                    >
                      Detailed Address
                    </Label>
                    <Input
                      id="detailedAddress"
                      {...form.register("detailedAddress")}
                      placeholder="Street, Building, Apartment..."
                      className="rounded-2xl border-pink-100 focus:ring-pink-300 py-6 text-[#003366] font-medium"
                    />
                    {form.formState.errors.detailedAddress && (
                      <p className="text-red-500 text-xs font-bold mt-1 ml-1">
                        {form.formState.errors.detailedAddress.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-4xl bg-purple-50/50 border border-purple-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#003366]">
                        Cash on Delivery
                      </h4>
                      <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                        Pay when you receive your treasure
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending || cart.length === 0}
                    className="w-full bg-[#FF8BBA] hover:bg-[#FF75AA] text-white rounded-full py-8 font-black text-xl shadow-xl shadow-pink-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      "Complete Purchase"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Right Side: Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-40 space-y-6">
                <div className="bg-[#A78BFA] rounded-[40px] p-8 text-white shadow-2xl shadow-purple-200/50 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                  <h3 className="text-2xl font-black mb-8">Order Summary</h3>

                  <div className="max-h-75 overflow-y-auto pr-2 custom-scrollbar mb-8 space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/5">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-black text-white truncate">
                              {item.name}
                            </p>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-white/40 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 bg-white/10 rounded-full p-1 border border-white/10">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-white w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.stock}
                                className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex flex-col items-end flex-1">
                              <Price
                                price={item.price * item.quantity}
                                originalPrice={item.originalPrice ? item.originalPrice * item.quantity : undefined}
                                size="sm"
                                color="text-white"
                                className="justify-end"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center text-purple-50 font-bold">
                      <span>Subtotal</span>
                      <Price price={totalPrice} size="sm" color="text-white" />
                    </div>
                    <div className="flex justify-between items-center text-purple-50 font-bold">
                      <span>Shipping</span>
                      <Price price={7.00} size="sm" color="text-white" />
                    </div>
                    <div className="h-px bg-white/20 my-4" />
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-purple-50 text-[10px] font-black uppercase tracking-widest">
                          Total to pay
                        </p>
                        <Price price={finalTotal} size="xl" color="text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-gray-50 flex flex-col items-center text-center gap-2 border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-[#FF8BBA]" />
                    <p className="text-[10px] font-black text-[#003366] uppercase tracking-wider text-center">
                      Quality Guaranteed
                    </p>
                  </div>
                  <div className="p-4 rounded-3xl bg-gray-50 flex flex-col items-center text-center gap-2 border border-gray-100">
                    <Truck className="w-5 h-5 text-[#A78BFA]" />
                    <p className="text-[10px] font-black text-[#003366] uppercase tracking-wider text-center">
                      Fast Delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
