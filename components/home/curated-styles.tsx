import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Gem } from "lucide-react";
import { getCategoryImages } from "@/app/actions/get-products";

export async function CuratedStyles() {
    const categoryImages = await getCategoryImages();

    const categories = [
        {
            name: "Rings",
            slug: "rings",
            href: "/rings",
        },
        {
            name: "Bracelets",
            slug: "bracelets",
            href: "/bracelets",
        },
        {
            name: "Necklaces",
            slug: "necklaces",
            href: "/necklaces",
        },
        {
            name: "Earrings",
            slug: "earrings",
            href: "/earrings",
        },
    ];

    return (
        <section className="py-24 w-[95%] max-w-7xl mx-auto">
            <div className="flex flex-col mb-16 gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                    <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter flex items-center gap-3">
                        Explore Styles <Gem className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                    </h2>
                    <Link
                        href="/shop"
                        className="group flex items-center gap-2 px-6 py-3 md:py-4 rounded-full bg-flora-purple text-white font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-[#8B5CF6] transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-flora-purple/20 shrink-0"
                    >
                        Explore All Collections <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="text-center md:text-left">
                    <p className="text-[#B08B9B] font-medium text-base max-w-2xl leading-relaxed">
                        Find your next signature piece among our most-loved categories.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 h-full">
                {categories.map((category, index) => {
                    const imageUrl = categoryImages[category.slug];
                    const isEven = index % 2 === 0;

                    return (
                        <Link
                            key={category.name}
                            href={category.href}
                            className={`group relative overflow-hidden rounded-[3rem] aspect-[4/5] sm:aspect-[3/4] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,139,186,0.3)] border border-pink-100/50 ${isEven ? 'lg:translate-y-4' : ''
                                }`}
                        >
                            {/* Image with Zoom effect */}
                            <div className="absolute inset-0 z-0">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={category.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-pink-50 flex items-center justify-center">
                                        <ShoppingBag className="w-12 h-12 text-pink-200" />
                                    </div>
                                )}
                            </div>

                            {/* Subtly Light Gradient Overlay */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary/30 via-transparent to-transparent group-hover:from-primary/40 transition-all duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                                <div className="overflow-hidden">
                                    <p className="text-[#FFF5F9] text-xs font-black uppercase tracking-[0.3em] mb-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        Collection
                                    </p>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-md">
                                    {category.name}
                                </h3>
                                <div className="w-12 h-1 bg-white mt-4 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
