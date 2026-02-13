"use client";

import { useRef, useEffect } from "react";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Price } from "@/components/shop/price";
import { useTranslations } from "next-intl";

export function CartDropdown() {
  const t = useTranslations("Cart");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cart, totalItems, totalPrice, updateQuantity, removeItem, isOpen, setIsOpen } = useCart();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info(t("removed"), {
      description: name,
    });
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-full p-2 transition-all duration-300 ${isOpen ? "bg-pink-100/50 text-primary" : "hover:bg-pink-50 text-flora-dark"
          }`}
        aria-label={t("openCart")}
      >
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {totalItems}
          </span>
        )}
      </button>

      {/* Dropdown Menu - Controlled by isOpen State */}
      <div className={`transition-all duration-300 z-50 
        fixed top-[72px] left-4 right-4 md:absolute md:top-full md:left-auto md:right-0 md:w-auto md:pt-4
        ${isOpen
          ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
          : "opacity-0 scale-95 pointer-events-none -translate-y-2"
        }`}>
        <div className="w-full md:w-80 bg-white rounded-3xl shadow-2xl border border-pink-50 overflow-hidden">
          <div className="p-6 bg-pink-50/30 border-b border-pink-100 flex items-center justify-between">
            <h3 className="font-black text-flora-dark text-xl flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {t("title")}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-gray-400"
              aria-label={t("closeCart")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className={cart.length > 0 ? "max-h-[320px] md:max-h-[300px] overflow-y-auto p-4 custom-scrollbar" : ""}>
            {cart.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-pink-200" />
                </div>
                <p className="text-gray-400 font-bold">{t("empty")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("emptySubtitle")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-2 rounded-2xl hover:bg-gray-50 transition-colors group/item">
                    <div
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 isolate"
                      style={{
                        WebkitBackfaceVisibility: 'hidden',
                        WebkitTransform: 'translateZ(0)',
                        transform: 'translateZ(0)',
                      }}
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={`${item.name} - FloraAccess`}
                          fill
                          sizes="64px"
                          quality={50}
                          className="object-cover"
                          style={{ borderRadius: 'inherit' }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-flora-dark truncate">{item.name}</h4>
                      <div className="mt-1">
                        <Price
                          price={item.price}
                          originalPrice={item.originalPrice}
                          size="xs"
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white rounded-full border border-gray-100 p-1">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                handleRemove(item.id, item.name);
                              }
                            }}
                            className="w-5 h-5 rounded-full hover:bg-pink-50 flex items-center justify-center text-gray-400"
                            aria-label={t("decreaseQuantity")}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-flora-dark w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-5 h-5 rounded-full hover:bg-pink-50 flex items-center justify-center text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={t("increaseQuantity")}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="opacity-0 group-hover/item:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all"
                          aria-label={t("removeItem")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-pink-50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold">{t("total")}</span>
                <Price price={totalPrice} size="lg" />
              </div>

              <Link
                href="/checkout"
                className="block w-full"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full bg-flora-purple hover:bg-[#8B5CF6] text-white rounded-full font-black py-6 shadow-lg shadow-purple-100 transition-all hover:scale-[1.02]">
                  {t("checkout")}
                </Button>
              </Link>

              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                {t("secure")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
