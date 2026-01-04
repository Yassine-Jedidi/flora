"use client";

import { Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/flora sparkle.png"
            alt="Flora Logo"
            width={180}
            height={80}
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Explore unique treasures..."
              className="w-full rounded-full bg-pink-100 py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-200 border-0"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 shrink-0">
          <Link
            href="/rings"
            className="text-sm font-medium text-foreground hover:text-pink-500 transition-colors"
          >
            Rings
          </Link>
          <Link
            href="/bracelets"
            className="text-sm font-medium text-foreground hover:text-pink-500 transition-colors"
          >
            Bracelets
          </Link>
          <Link
            href="/necklaces"
            className="text-sm font-medium text-foreground hover:text-pink-500 transition-colors"
          >
            Necklaces
          </Link>
          <Link
            href="/new-arrivals"
            className="text-sm font-medium text-pink-500 hover:text-pink-600 transition-colors"
          >
            New Arrivals
          </Link>
        </div>

        {/* User Icons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="relative rounded-full bg-pink-100 p-2 text-foreground hover:bg-pink-200 transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-pink-500 border-2 border-background" />
          </button>
          <button className="rounded-full bg-pink-100 p-2 text-foreground hover:bg-pink-200 transition-colors">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
