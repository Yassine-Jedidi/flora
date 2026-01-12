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
    Search,
    Eye,
    Settings
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Frequently Asked Questions | Flora Accessories",
    description: "Find answers to common questions about ordering, delivery, and products at Flora Accessories Tunisia.",
};

const faqCategories = [
    {
        icon: <ShoppingBag className="w-5 h-5" />,
        name: "Orders & Products",
        questions: [
            {
                q: "How do I place an order?",
                a: "Simply browse our collection, add your favorite treasures to the cart, and proceed to checkout. You don't need an account to shop with us!"
            },
            {
                q: "Are the accessories durable?",
                a: "Yes! We carefully select our materials to ensure they sparkle for a long time. However, like all jewelry, we recommend keeping them away from water and perfume to maintain their shine."
            },
            {
                q: "What if an item I want is out of stock?",
                a: "Our treasures go fast! You can follow us on Instagram @flora_.access for restock announcements or contact us to inquire about a specific item."
            }
        ]
    },
    {
        icon: <Truck className="w-5 h-5" />,
        name: "Shipping & Delivery",
        questions: [
            {
                q: "How much does shipping cost?",
                a: "We offer a flat rate of 7.00 DT for deliveries all across Tunisia."
            },
            {
                q: "How long will it take to get my order?",
                a: "For Greater Tunis, it usually takes 24-48 hours. For other regions, expect your delivery within 2-4 business days."
            },
            {
                q: "Can I open the package before paying?",
                a: "Absolutely! We want you to be 100% happy with your purchase. You can inspect your items in front of the courier before finalizing the Cash on Delivery payment."
            }
        ]
    },
    {
        icon: <CreditCard className="w-5 h-5" />,
        name: "Payments",
        questions: [
            {
                q: "How can I pay?",
                a: "Currently, we offer 'Cash on Delivery' (Paiement à la livraison). You pay the courier in cash when your package arrives at your doorstep."
            },
            {
                q: "Do you accept bank transfers?",
                a: "At the moment, we prioritize cash on delivery for its simplicity and security for our customers. Contact us if you have special requirements."
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 text-[#003366]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6">

                    {/* Header */}
                    <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center justify-center p-3 bg-purple-50 rounded-2xl mb-6">
                            <HelpCircle className="w-6 h-6 text-[#A78BFA]" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            How can we <span className="text-[#FF8BBA]">help you?</span>
                        </h1>
                        <p className="text-gray-500 font-bold max-w-lg mx-auto leading-relaxed">
                            Find answers to the most common questions about the Flora experience.
                        </p>
                    </div>

                    {/* FAQ Sections */}
                    <div className="space-y-16">
                        {faqCategories.map((category, idx) => (
                            <section key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                <div className="flex items-center gap-3 mb-8 border-b border-pink-50 pb-4">
                                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-[#FF8BBA]">
                                        {category.icon}
                                    </div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight antialiased">
                                        {category.name}
                                    </h2>
                                </div>

                                <div className="grid gap-6">
                                    {category.questions.map((item, qIdx) => (
                                        <div
                                            key={qIdx}
                                            className="group bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:border-pink-200 hover:shadow-md"
                                        >
                                            <h3 className="text-lg font-black mb-3 pr-8 relative transition-colors group-hover:text-[#FF8BBA]">
                                                {item.q}
                                            </h3>
                                            <p className="text-gray-500 font-medium leading-relaxed">
                                                {item.a}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Need More Assistance? */}
                    <div className="mt-24 p-12 rounded-[50px] bg-slate-50 border border-slate-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full -mr-16 -mt-16 blur-3xl" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
                                <MessageSquare className="w-8 h-8 text-[#A78BFA]" />
                            </div>
                            <h2 className="text-3xl font-black mb-4">Still have questions?</h2>
                            <p className="text-gray-500 font-bold mb-8 max-w-md mx-auto">
                                Can&apos;t find what you&apos;re looking for? Our team is always ready to help you find your perfect match.
                            </p>
                            <div className="flex items-center justify-center">
                                <a
                                    href="https://www.instagram.com/flora_.access/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#A78BFA] text-white px-10 py-4 rounded-full font-black text-sm shadow-lg shadow-purple-100 hover:bg-[#8B5CF6] transition-all hover:scale-105"
                                >
                                    Message us on Instagram
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-24 flex flex-wrap items-center justify-center gap-12 grayscale opacity-50">
                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                            <ShieldCheck className="w-4 h-4" /> Quality Assured
                        </div>
                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                            <Truck className="w-4 h-4" /> Nationwide Delivery
                        </div>
                        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-400">
                            <Heart className="w-4 h-4" /> Made with Love
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
