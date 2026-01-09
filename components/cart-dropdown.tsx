"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingBag, X, Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cart, totalItems, totalPrice, updateQuantity, removeItem } = useCart();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.info("Removed from cart", {
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
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative rounded-full p-2 transition-all duration-300 ${
          isOpen ? "bg-pink-100/50 text-[#FF8BBA]" : "hover:bg-pink-50 text-[#3E343C]"
        }`}
      >
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-[#FF8BBA] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {totalItems}
          </span>
        )}
      </button>

      {/* Dropdown Menu - Controlled by isOpen State */}
      <div className={`absolute right-0 top-full pt-4 transition-all duration-300 z-50 ${
        isOpen 
          ? "opacity-100 scale-100 pointer-events-auto" 
          : "opacity-0 scale-95 pointer-events-none"
      }`}>
        <div className="w-80 bg-white rounded-3xl shadow-2xl border border-pink-50 overflow-hidden">
          <div className="p-6 bg-pink-50/30 border-b border-pink-100 flex items-center justify-between">
            <h3 className="font-black text-[#003366] text-xl flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#FF8BBA]" />
              My Treasures
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white rounded-full transition-colors text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-4 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-pink-200" />
                </div>
                <p className="text-gray-400 font-bold">Your box is empty!</p>
                <p className="text-xs text-gray-400 mt-1">Start adding some sparkles.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-2 rounded-2xl hover:bg-gray-50 transition-colors group/item">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
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
                      <h4 className="text-sm font-black text-[#003366] truncate">{item.name}</h4>
                      <p className="text-xs font-bold text-[#FF8BBA] mt-1">
                        {(item.price || 0).toFixed(2)} DT
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white rounded-full border border-gray-100 p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-5 h-5 rounded-full hover:bg-pink-50 flex items-center justify-center text-gray-400"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-[#003366] w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 rounded-full hover:bg-pink-50 flex items-center justify-center text-gray-400"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleRemove(item.id, item.name)}
                          className="opacity-0 group-hover/item:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all"
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
                <span className="text-gray-400 font-bold">Total</span>
                <span className="text-xl font-black text-[#003366]">{totalPrice.toFixed(2)} DT</span>
              </div>
              
              <Link 
                href="/checkout" 
                className="block w-full"
                onClick={() => setIsOpen(false)}
              >
                <Button className="w-full bg-[#A78BFA] hover:bg-[#8B5CF6] text-white rounded-full font-black py-6 shadow-lg shadow-purple-100 transition-all hover:scale-[1.02]">
                  Check Out Now
                </Button>
              </Link>
              
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                Safe & Secure Checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
