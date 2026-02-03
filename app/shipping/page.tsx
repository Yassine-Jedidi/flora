import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
    Truck,
    Package,
    Clock,
    ShieldCheck,
    MapPin,
    CreditCard,
    CheckCircle2,
    Calendar,
    MessageSquare,
    HelpCircle,
    Eye,
    Instagram
} from "lucide-react";
import { Metadata } from "next";
import { Price } from "@/components/shop/price";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
    const t = await getTranslations("Metadata.shipping");
    return {
        title: t("title"),
        description: t("description")
    };
}

export default function ShippingPage() {
    const t = useTranslations("Shipping");

    const deliveryFeatures = [
        {
            icon: <Truck className="w-8 h-8 text-primary" />,
            title: t("flatRateTitle"),
            description: (
                <div className="flex flex-col gap-1">
                    <span>{t("flatRateDesc")}</span>
                    <Price price={7.00} size="sm" className="mt-1" />
                </div>
            ),
            bg: "bg-pink-50"
        },
        {
            icon: <Clock className="w-8 h-8 text-flora-purple" />,
            title: t("fastDeliveryTitle"),
            description: t("fastDeliveryDesc"),
            bg: "bg-purple-50"
        },
        {
            icon: <CreditCard className="w-8 h-8 text-blue-400" />,
            title: t("codTitle"),
            description: t("codDesc"),
            bg: "bg-blue-50"
        },
        {
            icon: <MapPin className="w-8 h-8 text-green-400" />,
            title: t("coverageTitle"),
            description: t("coverageDesc"),
            bg: "bg-green-50"
        }
    ];

    const steps = [
        {
            title: t("step1Title"),
            description: t("step1Desc"),
            icon: <CheckCircle2 className="w-5 h-5" />
        },
        {
            title: t("step2Title"),
            description: t("step2Desc"),
            icon: <Package className="w-5 h-5" />
        },
        {
            title: t("step3Title"),
            description: t("step3Desc"),
            icon: <Truck className="w-5 h-5" />
        },
        {
            title: t("step4Title"),
            description: t("step4Desc"),
            icon: <MapPin className="w-5 h-5" />
        }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-28 md:pt-32 pb-12 md:pb-20 text-flora-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-10 md:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center p-2.5 md:p-3 bg-pink-100/50 rounded-2xl mb-4 md:mb-6">
                            <Truck className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-6xl font-black tracking-tight mb-4 md:mb-6">
                            {t.rich("title", {
                                span: (chunks) => <span className="text-primary">{chunks}</span>
                            })}
                        </h1>
                        <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed px-4">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Key Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-24">
                        {deliveryFeatures.map((feature, idx) => (
                            <div
                                key={idx}
                                className={`${feature.bg} p-6 md:p-8 rounded-3xl md:rounded-[40px] border border-white/50 shadow-sm transition-all hover:scale-[1.02] duration-300`}
                            >
                                <div className="bg-white w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-sm mb-4 md:mb-6">
                                    <div className="scale-75 md:scale-100">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg md:text-xl font-black mb-2 md:mb-3">{feature.title}</h3>
                                <div className="text-gray-500 font-bold text-xs md:text-sm leading-relaxed">
                                    {feature.description}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* Delivery Timeline / Process */}
                        <div className="space-y-8 md:space-y-10">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4 flex items-center gap-2 md:gap-3">
                                    <Calendar className="w-6 h-6 md:w-8 md:h-8 text-flora-purple" />
                                    {t("processTitle")}
                                </h2>
                                <p className="text-gray-500 font-bold text-sm md:text-base">
                                    {t("processDesc")}
                                </p>
                            </div>

                            <div className="space-y-6 md:space-y-8 relative before:absolute before:left-[19px] md:before:left-[27px] before:top-6 md:before:top-7 before:bottom-6 md:before:bottom-7 before:w-0.5 before:bg-pink-100">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 md:gap-6 relative">
                                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border-4 border-pink-100 flex items-center justify-center shrink-0 z-10 shadow-sm text-primary">
                                            <div className="scale-75 md:scale-100">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <div className="pt-1 md:pt-2">
                                            <h4 className="text-base md:text-lg font-black mb-1">{step.title}</h4>
                                            <p className="text-gray-500 font-medium text-xs md:text-sm leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQs & Support */}
                        <div className="bg-gray-50/50 rounded-3xl md:rounded-[40px] p-6 md:p-10 border border-gray-100 space-y-6 md:space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                    <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                                    {t("commonQuestions")}
                                </h2>

                                <div className="space-y-4 md:space-y-6">
                                    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-pink-50">
                                        <h4 className="font-black mb-2 text-sm md:text-base flex items-center gap-2">
                                            <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                            {t("q1")}
                                        </h4>
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">
                                            {t("a1")}
                                        </p>
                                    </div>


                                    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-pink-50">
                                        <h4 className="font-black mb-2 text-sm md:text-base flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                            {t("q2")}
                                        </h4>
                                        <p className="text-xs md:text-sm text-gray-500 font-medium">
                                            {t("a2")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 md:pt-6 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-primary p-5 md:p-6 rounded-2xl md:rounded-3xl text-white shadow-lg shadow-pink-200/50 transform transition-transform hover:scale-[1.01]">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-2.5 md:p-3 rounded-2xl">
                                            <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm md:text-base">{t("needMoreHelp")}</h4>
                                            <p className="text-[11px] md:text-sm text-white/80 font-bold tracking-tight">{t("supportWhatsApp")}</p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://www.instagram.com/flora_.access/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="sm:ml-auto w-full sm:w-auto text-center justify-center bg-white text-primary px-5 md:px-6 py-2 rounded-full font-black text-xs hover:bg-pink-50 transition-colors flex items-center gap-2"
                                    >
                                        <Instagram className="w-4 h-4" />
                                        {t("contact")}
                                    </a>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Trust Seal */}
                    <div className="mt-16 md:mt-32 p-8 md:p-12 rounded-[2.5rem] md:rounded-[50px] bg-flora-purple text-white text-center relative overflow-hidden shadow-2xl shadow-purple-200/50">
                        <div className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-full -ml-24 -mt-24 md:-ml-32 md:-mt-32 blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-pink-400/20 rounded-full -mr-24 -mb-24 md:-mr-32 md:-mb-32 blur-3xl" />

                        <div className="relative z-10 px-2 md:px-0">
                            <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-white mx-auto mb-4 md:mb-6" />
                            <h2 className="text-2xl md:text-3xl font-black mb-3 md:mb-4">{t("trustTitle")}</h2>
                            <p className="text-purple-50 max-w-2xl mx-auto text-xs md:text-base font-medium leading-relaxed">
                                {t("trustDesc")}
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
