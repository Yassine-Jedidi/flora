import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { getCategoryImages } from "@/app/actions/get-products";

export async function CuratedStyles() {
    const categoryImages = await getCategoryImages();

    const categories = [
        {
            name: "Rings",
            slug: "rings",
            href: "/shop/rings",
        },
        {
            name: "Bracelets",
            slug: "bracelets",
            href: "/shop/bracelets",
        },
        {
            name: "Necklaces",
            slug: "necklaces",
            href: "/shop/necklaces",
        },
        {
            name: "Earrings",
            slug: "earrings",
            href: "/shop/earrings",
        },
    ];

    return (
        <section className="py-16 px-4 md:px-16">
            <div className="flex justify-between items-end mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                    Shop Curated Styles
                </h2>
                <Link
                    href="/shop"
                    className="flex items-center text-pink-500 font-semibold hover:text-pink-600 transition-colors"
                >
                    View All <ChevronRight className="w-4 h-4 ms-1" />
                </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
                {categories.map((category) => {
                    const imageUrl = categoryImages[category.slug];

                    return (
                        <Link
                            key={category.name}
                            href={category.href}
                            className="group flex flex-col items-center text-center cursor-pointer w-32 sm:w-40 md:w-48"
                        >
                            <div className="relative w-full aspect-square mb-4 rounded-full overflow-hidden border-4 border-pink-50 transition-transform duration-300 group-hover:scale-105 group-hover:border-pink-100 shadow-sm bg-pink-50/30 flex items-center justify-center">
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={category.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <ShoppingBag className="w-10 h-10 text-pink-200" />
                                )}
                            </div>
                            <span className="text-lg font-medium text-slate-700 group-hover:text-pink-500 transition-colors">
                                {category.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
