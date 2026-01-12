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
    Eye
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { Price } from "@/components/shop/price";

export const metadata: Metadata = {
    title: "Shipping & Delivery | Flora Accessories",
    description: "Learn about our shipping policy, delivery times, and costs for orders across Tunisia.",
};

export default function ShippingPage() {
    const deliveryFeatures = [
        {
            icon: <Truck className="w-8 h-8 text-[#FF8BBA]" />,
            title: "Flat Rate Shipping",
            description: (
                <div className="flex flex-col gap-1">
                    <span>We offer a flat shipping rate for all orders.</span>
                    <Price price={7.00} size="sm" className="mt-1" />
                </div>
            ),
            bg: "bg-pink-50"
        },
        {
            icon: <Clock className="w-8 h-8 text-[#A78BFA]" />,
            title: "Fast Delivery",
            description: "Greater Tunis: 24-48h. Other regions (Sousse, Sfax, Gabes, etc.): 2-4 business days.",
            bg: "bg-purple-50"
        },
        {
            icon: <CreditCard className="w-8 h-8 text-blue-400" />,
            title: "Cash on Delivery",
            description: "Paiement à la livraison. Pay conveniently in cash when your package arrives door-to-door.",
            bg: "bg-blue-50"
        },
        {
            icon: <MapPin className="w-8 h-8 text-green-400" />,
            title: "Nationwide Coverage",
            description: "We deliver to all 24 governorates of Tunisia, from Bizerte to Tataouine.",
            bg: "bg-green-50"
        }
    ];

    const steps = [
        {
            title: "Order Confirmation",
            description: "Once you place your order, we'll send you a confirmation message. Our team might call you to verify the delivery address.",
            icon: <CheckCircle2 className="w-5 h-5" />
        },
        {
            title: "Processing & Packaging",
            description: "Our team carefully picks and packs your accessories in our signature protective packaging within 1 business day.",
            icon: <Package className="w-5 h-5" />
        },
        {
            title: "Handover to Carrier",
            description: "Your package is handed over to our trusted delivery partners for the journey.",
            icon: <Truck className="w-5 h-5" />
        },
        {
            title: "Delivery to Your Door",
            description: "The courier will contact you via phone before arrival to ensure you're available to receive your Flora treasure.",
            icon: <MapPin className="w-5 h-5" />
        }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 text-[#003366]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center p-3 bg-pink-100/50 rounded-2xl mb-6">
                            <Truck className="w-6 h-6 text-[#FF8BBA]" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                            Shipping & <span className="text-[#FF8BBA]">Delivery</span>
                        </h1>
                        <p className="text-lg text-gray-500 font-medium leading-relaxed">
                            We strive to deliver your Flora treasures as quickly and safely as possible.
                            Here is everything you need to know about our shipping process in Tunisia.
                        </p>
                    </div>

                    {/* Key Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                        {deliveryFeatures.map((feature, idx) => (
                            <div
                                key={idx}
                                className={`${feature.bg} p-8 rounded-[40px] border border-white/50 shadow-sm transition-all hover:scale-[1.02] duration-300`}
                            >
                                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                                <div className="text-gray-500 font-bold text-sm leading-relaxed">
                                    {feature.description}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                        {/* Delivery Timeline / Process */}
                        <div className="space-y-10">
                            <div>
                                <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                                    <Calendar className="w-8 h-8 text-[#A78BFA]" />
                                    Delivery Process
                                </h2>
                                <p className="text-gray-500 font-bold">
                                    We follow a streamlined process to ensure your order reach you in perfect condition.
                                </p>
                            </div>

                            <div className="space-y-8 relative before:absolute before:left-[27px] before:top-7 before:bottom-7 before:w-0.5 before:bg-pink-100">
                                {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-6 relative">
                                        <div className="w-14 h-14 rounded-full bg-white border-4 border-pink-100 flex items-center justify-center shrink-0 z-10 shadow-sm text-[#FF8BBA]">
                                            {step.icon}
                                        </div>
                                        <div className="pt-2">
                                            <h4 className="text-lg font-black mb-1">{step.title}</h4>
                                            <p className="text-gray-500 font-medium text-sm leading-relaxed">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQs & Support */}
                        <div className="bg-gray-50/50 rounded-[40px] p-10 border border-gray-100 space-y-8">
                            <div>
                                <h2 className="text-3xl font-black mb-6 flex items-center gap-3">
                                    <HelpCircle className="w-8 h-8 text-[#FF8BBA]" />
                                    Common Questions
                                </h2>

                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50">
                                        <h4 className="font-black mb-2 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-[#FF8BBA]" />
                                            Can I open the package before paying?
                                        </h4>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Of course! At Flora, we want you to be 100% happy. You can check your items in front of the courier before finalizing the payment.
                                        </p>
                                    </div>


                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-50">
                                        <h4 className="font-black mb-2 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#FF8BBA]" />
                                            Do you ship to remote areas?
                                        </h4>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Yes, we reach everywhere in Tunisia! Whether you&apos;re in Djerba, Nefta, or Tabarka, we&apos;ll get your treasure to you.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4 bg-[#FF8BBA] p-6 rounded-3xl text-white shadow-lg shadow-pink-200/50 transform transition-transform hover:scale-[1.01]">
                                    <div className="bg-white/20 p-3 rounded-2xl">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black">Need more help?</h4>
                                        <p className="text-sm text-white/80 font-bold tracking-tight">Support is available via WhatsApp</p>
                                    </div>
                                    <div
                                        className="ml-auto bg-white text-[#FF8BBA] px-6 py-2 rounded-full font-black text-xs cursor-default"
                                    >
                                        Contact
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Trust Seal */}
                    <div className="mt-32 p-12 rounded-[50px] bg-[#A78BFA] text-white text-center relative overflow-hidden shadow-2xl shadow-purple-200/50">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400/20 rounded-full -mr-32 -mb-32 blur-3xl" />

                        <div className="relative z-10">
                            <ShieldCheck className="w-12 h-12 text-white mx-auto mb-6" />
                            <h2 className="text-3xl font-black mb-4">Quality & Trust Guaranteed</h2>
                            <p className="text-purple-50 max-w-2xl mx-auto font-medium leading-relaxed">
                                Every shipment is handled with the utmost care. We use premium floral-inspired packaging
                                to ensure your accessories arrive in pristine condition, ready to sparkle.
                            </p>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
