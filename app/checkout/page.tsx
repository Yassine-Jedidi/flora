"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/hooks/use-cart";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema, type AddressValues } from "@/lib/validations/order";
import { createOrder } from "@/app/actions/order";
import { getAddresses } from "@/app/actions/address";
import { useSession } from "@/lib/auth-client";
import { Bow } from "@/components/icons/bow";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  ShoppingCart,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Price } from "@/components/shop/price";
import { SHIPPING_COST } from "@/lib/constants/shipping";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart, updateQuantity, removeItem } = useCart();
  const { data: session } = useSession();
  const t = useTranslations("Checkout");

  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{ id: string, name: string } | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const form = useForm<AddressValues>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      governorate: "",
      city: "",
      detailedAddress: "",
      saveAddress: true,
    },
  });

  // Load addresses if logged in
  useEffect(() => {
    const fetchAddresses = async () => {
      if (session) {
        setIsLoadingAddresses(true);
        const result = await getAddresses();
        if (result.success && result.data) {
          setSavedAddresses(result.data);
          // Auto-select default address
          const defaultAddr = result.data.find((a: any) => a.isDefault) || result.data[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            // Pre-fill form with selected address
            form.reset({
              fullName: defaultAddr.fullName || session.user.name || "",
              phoneNumber: defaultAddr.phoneNumber,
              governorate: defaultAddr.governorate,
              city: defaultAddr.city,
              detailedAddress: defaultAddr.detailedAddress,
              saveAddress: false,
            });
          } else {
            setIsAddingNewAddress(true);
            form.setValue("fullName", session.user.name || "");
          }
        } else {
          setIsAddingNewAddress(true);
          form.setValue("fullName", session.user.name || "");
        }
        setIsLoadingAddresses(false);
      } else {
        setIsLoadingAddresses(false);
        setIsAddingNewAddress(true);
      }
    };
    fetchAddresses();
  }, [session, form]);

  const handleRemove = (id: string, name: string) => {
    setItemToRemove({ id, name });
  };

  const confirmRemove = () => {
    if (itemToRemove) {
      removeItem(itemToRemove.id);
      toast.info(t("removedFromCart"), {
        description: itemToRemove.name,
      });
      setItemToRemove(null);
    }
  };

  const shippingCost = cart.length > 0 ? SHIPPING_COST : 0;
  const finalTotal = totalPrice + shippingCost;

  const selectedGov = form.watch("governorate");
  const availableCities = selectedGov
    ? TUNISIA_LOCATIONS[selectedGov] || []
    : [];

  const onSubmit = async (values: AddressValues) => {
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
        toast.success(t("orderSuccessToast"));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(result.error || t("genericError"));
      }
    } catch (error) {
      console.error(error);
      toast.error(t("orderError"));
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 pt-28 md:pt-32">
          <div className="max-w-md w-full bg-pink-50/50 rounded-3xl md:rounded-[40px] p-8 md:p-12 text-center border-2 border-dashed border-pink-100 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-pink-200">
              <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-flora-dark mb-4">
              {t("orderCompleted")}
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-bold mb-8">
              {t("orderSuccessMessage")}
            </p>
            <Link href="/">
              <Button className="bg-flora-purple hover:bg-[#8B5CF6] text-white rounded-full px-8 py-4 md:px-10 md:py-6 font-black text-base md:text-lg transition-all shadow-lg shadow-purple-100">
                {t("backToShop")}
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

      <main className="flex-1 pt-28 md:pt-32 pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-primary font-bold mb-6 md:mb-8 transition-colors group text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            {t("backToAccessories")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="mb-8 md:mb-10 px-1">
                <h1 className="text-2xl md:text-4xl font-black text-flora-dark tracking-tight mb-2">
                  {t("checkoutTitle")}
                </h1>
                <p className="text-sm md:text-base text-gray-400 font-bold">
                  {t("checkoutSubtitle")}
                </p>
              </div>

              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) => {
                  console.error("Form Validation Errors:", errors);
                  // Find the first error to show in toast
                  const errorMessages = Object.values(errors);
                  if (errorMessages.length > 0) {
                    toast.error(t("validationErrorTitle"), {
                      description: (errorMessages[0]?.message as string) || t("validationErrorDescription"),
                    });
                  }
                })}
                className="space-y-8"
              >
                <div className="p-8 rounded-4xl bg-white border border-pink-50 shadow-sm space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-flora-dark">
                      {t("shipping")}
                    </h2>
                  </div>

                  {session && savedAddresses.length > 0 && !isAddingNewAddress && (
                    <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        {t("selectSavedAddress")}
                      </p>
                      <div className="grid grid-cols-1 gap-4">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              form.reset({
                                fullName: addr.fullName,
                                phoneNumber: addr.phoneNumber,
                                governorate: addr.governorate,
                                city: addr.city,
                                detailedAddress: addr.detailedAddress,
                                saveAddress: false,
                              });
                            }}
                            className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-3xl border-2 text-left transition-all duration-300 relative group overflow-hidden ${selectedAddressId === addr.id
                              ? "border-primary bg-pink-50/30 shadow-md shadow-pink-100/50"
                              : "border-gray-100 hover:border-pink-100 bg-white"
                              }`}
                          >
                            {selectedAddressId === addr.id && (
                              <div className="absolute top-0 right-0 p-2">
                                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary animate-in zoom-in-50 duration-300" />
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {addr.name}
                              </span>
                              <p className="text-sm md:text-base font-black text-flora-dark">{addr.fullName}</p>
                              <p className="text-xs md:text-sm text-gray-400 font-bold">{addr.phoneNumber}</p>
                              <p className="text-xs md:text-sm text-gray-400 font-bold mt-1 md:mt-2">
                                {addr.detailedAddress}, {addr.city}, {addr.governorate}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsAddingNewAddress(true);
                          setSelectedAddressId(null);
                          form.reset({
                            fullName: session?.user?.name || "",
                            phoneNumber: "",
                            governorate: "",
                            city: "",
                            detailedAddress: "",
                            saveAddress: true,
                          });
                        }}
                        className="w-full rounded-2xl border-2 border-dashed border-pink-100 text-primary hover:bg-pink-50/50 font-bold py-6 md:py-8 transition-all text-xs md:text-sm"
                      >
                        {t("shipToNewAddress")}
                      </Button>
                    </div>
                  )}

                  {(isAddingNewAddress || !session || savedAddresses.length === 0) && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                      {session && savedAddresses.length > 0 && (
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                            {t("newShippingDetails")}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewAddress(false);
                              const defaultAddr = savedAddresses.find((a: any) => a.isDefault) || savedAddresses[0];
                              setSelectedAddressId(defaultAddr.id);
                              form.reset({
                                fullName: defaultAddr.fullName || session?.user?.name || "",
                                phoneNumber: defaultAddr.phoneNumber,
                                governorate: defaultAddr.governorate,
                                city: defaultAddr.city,
                                detailedAddress: defaultAddr.detailedAddress,
                                saveAddress: false,
                              });
                            }}
                            className="text-primary text-xs font-black hover:underline"
                          >
                            {t("backToSavedAddresses")}
                          </button>
                        </div>
                      )}

                      <div className={`grid grid-cols-1 ${!session ? "md:grid-cols-2" : ""} gap-6`}>
                        {!session && (
                          <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-flora-dark font-bold ml-1">{t("fullName")}</Label>
                            <Input
                              id="fullName"
                              {...form.register("fullName")}
                              placeholder={t("fullNamePlaceholder")}
                              className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-300 py-5 md:py-6 text-flora-dark font-medium text-sm md:text-base"
                            />
                            {form.formState.errors.fullName && (
                              <p className="text-red-500 text-xs font-bold mt-1 ml-1">{form.formState.errors.fullName.message}</p>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-flora-dark font-bold ml-1">{t("phoneNumber")}</Label>
                          <Input
                            id="phoneNumber"
                            {...form.register("phoneNumber")}
                            placeholder={t("phoneNumberPlaceholder")}
                            className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-300 py-5 md:py-6 text-flora-dark font-medium text-sm md:text-base"
                          />
                          {form.formState.errors.phoneNumber && (
                            <p className="text-red-500 text-xs font-bold mt-1 ml-1">{form.formState.errors.phoneNumber.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-flora-dark font-bold ml-1">{t("governorate")}</Label>
                          <Select
                            value={form.watch("governorate")}
                            onValueChange={(v) => form.setValue("governorate", v, { shouldValidate: true })}
                          >
                            <SelectTrigger className="w-full rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-300 h-11 md:h-13 text-flora-dark font-medium text-sm md:text-base">
                              <SelectValue placeholder={t("selectGovernorate")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl md:rounded-2xl border-pink-100">
                              {TUNISIA_GOVERNORATES.map((gov) => (
                                <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.governorate && (
                            <p className="text-red-500 text-xs font-bold mt-1 ml-1">{form.formState.errors.governorate.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-flora-dark font-bold ml-1">{t("city")}</Label>
                          <Select
                            disabled={!selectedGov}
                            value={form.watch("city")}
                            onValueChange={(v) => form.setValue("city", v, { shouldValidate: true })}
                          >
                            <SelectTrigger className="w-full rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-300 h-11 md:h-13 text-flora-dark font-medium text-sm md:text-base">
                              <SelectValue placeholder={t("selectCity")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl md:rounded-2xl border-pink-100">
                              {availableCities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.city && (
                            <p className="text-red-500 text-xs font-bold mt-1 ml-1">{form.formState.errors.city.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="detailedAddress" className="text-flora-dark font-bold ml-1">{t("detailedAddress")}</Label>
                        <Input
                          id="detailedAddress"
                          {...form.register("detailedAddress")}
                          placeholder={t("detailedAddressPlaceholder")}
                          className="rounded-xl md:rounded-2xl border-pink-100 focus:ring-pink-300 py-5 md:py-6 text-flora-dark font-medium text-sm md:text-base"
                        />
                        {form.formState.errors.detailedAddress && (
                          <p className="text-red-500 text-xs font-bold mt-1 ml-1">{form.formState.errors.detailedAddress.message}</p>
                        )}
                      </div>

                      {session && (
                        <div className="flex items-center space-x-3 pt-2">
                          <Checkbox
                            id="saveAddress"
                            checked={form.watch("saveAddress")}
                            onCheckedChange={(checked) => form.setValue("saveAddress", checked === true)}
                            className="w-5 h-5 border-pink-200 data-[state=checked]:bg-primary data-[state=checked]:border-primary text-white rounded-lg transition-all duration-300"
                          />
                          <Label htmlFor="saveAddress" className="text-sm font-bold text-gray-500 cursor-pointer select-none flex items-center gap-1.5">
                            {t("saveAddress")}
                            <Bow className="w-4 h-4 text-primary" />
                          </Label>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-[2rem] bg-purple-50/50 border border-purple-100">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-flora-dark">{t("cashOnDelivery")}</h4>
                      <p className="text-[10px] md:text-xs text-purple-400 font-bold uppercase tracking-wider">{t("payOnReceive")}</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending || cart.length === 0}
                    className="w-full bg-primary hover:bg-[#FF75AA] text-white rounded-full py-6 md:py-8 font-black text-lg md:text-xl shadow-xl shadow-pink-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : t("completePurchase")}
                  </Button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="lg:sticky lg:top-40 space-y-4 md:space-y-6">
                <div className="bg-flora-purple rounded-3xl md:rounded-[40px] p-6 md:p-8 text-white shadow-2xl shadow-purple-200/50 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                  <h3 className="flex items-center gap-3 text-xl md:text-2xl font-black mb-6 md:mb-8">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                    {t("summary")}
                  </h3>

                  <div className="max-h-75 overflow-y-auto pr-2 custom-scrollbar mb-6 md:mb-8 space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3 md:gap-4">
                        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/5">
                          {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs md:text-sm font-black text-white truncate">{item.name}</p>
                            <button onClick={() => handleRemove(item.id, item.name)} className="text-white/40 hover:text-white transition-colors shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                            <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 rounded-full p-0.5 md:p-1 border border-white/10">
                              <button
                                type="button"
                                onClick={() => item.quantity === 1 ? handleRemove(item.id, item.name) : updateQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[10px] md:text-xs font-black text-white w-3 md:w-4 text-center">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                                size="xs"
                                color="text-white"
                                className="justify-end scale-90 md:scale-100 origin-right"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 md:space-y-4 pt-5 md:pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center text-purple-50 font-bold text-xs md:text-sm">
                      <span>{t("subtotal")}</span>
                      <Price price={totalPrice} size="xs" color="text-white" />
                    </div>
                    <div className="flex justify-between items-center text-purple-50 font-bold text-xs md:text-sm">
                      <span>{t("shippingCost")}</span>
                      <Price price={7.00} size="xs" color="text-white" />
                    </div>
                    <div className="h-px bg-white/20 my-3 md:my-4" />
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-purple-50 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{t("totalToPay")}</p>
                        <Price price={finalTotal} size="lg" color="text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-gray-50 flex flex-col items-center text-center gap-2 border border-gray-100">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <p className="text-[10px] font-black text-flora-dark uppercase tracking-wider">{t("qualityGuaranteed")}</p>
                  </div>
                  <div className="p-4 rounded-3xl bg-gray-50 flex flex-col items-center text-center gap-2 border border-gray-100">
                    <Truck className="w-5 h-5 text-flora-purple" />
                    <p className="text-[10px] font-black text-flora-dark uppercase tracking-wider">{t("fastDelivery")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AlertDialog open={!!itemToRemove} onOpenChange={(open) => !open && setItemToRemove(null)}>
        <AlertDialogContent className="rounded-3xl border-pink-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-flora-dark font-black text-xl">{t("removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium">
              {t.rich("removeDescription", {
                name: itemToRemove?.name || "",
                bold: (chunks) => <span className="text-primary font-bold">{chunks}</span>
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-full border-pink-100 text-gray-400 hover:bg-pink-50 font-bold px-6">{t("keepIt")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold px-6">{t("remove")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
