"use client";

import { Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100]">
      <div className="bg-white/80 backdrop-blur-md rounded-full border border-pink-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/flora sparkle.png"
              alt="Flora Logo"
              width={180}
              height={80}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search Bar - Slightly narrower for the pill look */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pink-300" />
              <input
                type="text"
                placeholder="Find treasures..."
                className="w-full rounded-full bg-pink-50/50 py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 border border-pink-100/50"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 shrink-0">
            <Link
              href="/rings"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/rings" ? "text-[#FF8BBA]" : "text-[#3E343C] hover:text-[#FF8BBA]"
                }`}
            >
              Rings
            </Link>
            <Link
              href="/bracelets"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/bracelets" ? "text-[#FF8BBA]" : "text-[#3E343C] hover:text-[#FF8BBA]"
                }`}
            >
              Bracelets
            </Link>
            <Link
              href="/necklaces"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/necklaces" ? "text-[#FF8BBA]" : "text-[#3E343C] hover:text-[#FF8BBA]"
                }`}
            >
              Necklaces
            </Link>
            <Link
              href="/earrings"
              className={`text-xs font-bold transition-colors uppercase tracking-widest ${pathname === "/earrings" ? "text-[#FF8BBA]" : "text-[#3E343C] hover:text-[#FF8BBA]"
                }`}
            >
              Earrings
            </Link>

          </div>

          {/* User Icons */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="relative rounded-full hover:bg-pink-50 p-2 text-[#3E343C] transition-all duration-300">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FF8BBA] border-2 border-white shadow-sm" />
            </button>
            <button className="rounded-full bg-[#3E343C] p-2 text-white hover:bg-[#FF8BBA] transition-all duration-300 shadow-md">
              <User className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
