"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
    HelpCircle,
    ShoppingBag,
    Truck,
    CreditCard,
    ShieldCheck,
    Heart,
    MessageSquare,
    Instagram,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SHIPPING_COST } from "@/lib/constants/shipping";

export function FAQClient() {
    const t = useTranslations("FAQ");

    const faqCategories = [
        {
            icon: <ShoppingBag className="w-5 h-5" />,
            name: t("categories.orders"),
            questions: [
                {
                    q: t("questions.orderPlacementQ"),
                    a: t("questions.orderPlacementA")
                },
                {
                    q: t("questions.durabilityQ"),
                    a: t("questions.durabilityA")
                },
                {
                    q: t("questions.stockQ"),
                    a: t("questions.stockA")
                }
            ]
        },
        {
            icon: <Truck className="w-5 h-5" />,
            name: t("categories.shipping"),
            questions: [
                {
                    q: t("questions.shippingCostQ"),
                    a: t("questions.shippingCostA", { cost: SHIPPING_COST.toFixed(2) })
                },
                {
                    q: t("questions.deliveryTimeQ"),
                    a: t("questions.deliveryTimeA")
                },
                {
                    q: t("questions.openPackageQ"),
                    a: t("questions.openPackageA")
                }
            ]
        },
        {
            icon: <CreditCard className="w-5 h-5" />,
            name: t("categories.payments"),
            questions: [
                {
                    q: t("questions.paymentMethodsQ"),
                    a: t("questions.paymentMethodsA")
                },
                {
                    q: t("questions.bankTransferQ"),
                    a: t("questions.bankTransferA")
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-28 md:pt-32 pb-12 md:pb-20 text-flora-dark">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">

                    {/* Header */}
                    <div className="text-center mb-12 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center p-2.5 md:p-3 bg-purple-50 rounded-2xl mb-4 md:mb-6">
                            <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-flora-purple" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-3 md:mb-4 px-2">
                            {t.rich("title", {
                                span: (chunks) => <span className="text-primary">{chunks}</span>
                            })}
                        </h1>
                        <p className="text-sm md:text-lg text-gray-500 font-bold max-w-lg mx-auto leading-relaxed px-4">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* FAQ Sections */}
                    <div className="space-y-12 md:space-y-16">
                        {faqCategories.map((category, idx) => (
                            <section key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                <div className="flex items-center gap-3 mb-6 md:mb-8 border-b border-pink-50 pb-4">
                                    <div className="w-9 h-9 md:w-10 md:h-10 bg-pink-50 rounded-xl flex items-center justify-center text-primary shrink-0">
                                        <div className="scale-90 md:scale-100">
                                            {category.icon}
                                        </div>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight antialiased">
                                        {category.name}
                                    </h2>
                                </div>

                                <div className="grid gap-4 md:gap-6">
                                    {category.questions.map((item, qIdx) => (
                                        <div
                                            key={qIdx}
                                            className="group bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm transition-all hover:border-pink-200 hover:shadow-md"
                                        >
                                            <h3 className="text-base md:text-lg font-black mb-2 md:mb-3 pr-4 md:pr-8 relative transition-colors group-hover:text-primary leading-tight">
                                                {item.q}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
                                                {item.a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Need More Assistance? */}
                    <div className="mt-16 md:mt-24 p-8 md:p-12 rounded-[2.5rem] md:rounded-[50px] bg-slate-50 border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />

                        <div className="relative z-10 px-4">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 md:mb-6">
                                <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-flora-purple" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 tracking-tight">
                                {t("footerTitle")}
                            </h2>
                            <p className="text-sm md:text-gray-500 font-bold mb-6 md:mb-8 max-w-sm mx-auto">
                                {t("footerSubtitle")}
                            </p>
                            <div className="flex items-center justify-center">
                                <a
                                    href="https://www.instagram.com/flora_.access/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto bg-flora-purple text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-black text-xs md:text-sm shadow-lg shadow-purple-100 hover:bg-[#8B5CF6] transition-all hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                                    {t("footerButton")}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-16 md:mt-24 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 grayscale opacity-50">
                        <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-flora-dark">
                            <ShieldCheck className="w-4 h-4" /> {t("trustQuality")}
                        </div>
                        <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-flora-dark">
                            <Truck className="w-4 h-4" /> {t("trustDelivery")}
                        </div>
                        <div className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-flora-dark">
                            <Heart className="w-4 h-4" /> {t("trustLove")}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
