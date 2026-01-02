"use client";

import { Camera, Mail, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-pink-50/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left Section - Company Information */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              {/* Logo Icon - Pink ribbon/banner */}
              <div className="relative h-8 w-10">
                <svg
                  className="h-8 w-10"
                  viewBox="0 0 40 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6 Q0 0 6 0 L34 0 Q40 0 40 6 L40 26 Q40 32 34 32 L6 32 Q0 32 0 26 Z"
                    className="fill-pink-500"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">
                Flora Accessories
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Elevating everyday moments with exquisite adornments.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button
                className="text-purple-500 hover:text-purple-600 transition-colors"
                aria-label="Instagram"
              >
                <Camera className="h-5 w-5" />
              </button>
              <button
                className="text-purple-500 hover:text-purple-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </button>
              <button
                className="text-purple-500 hover:text-purple-600 transition-colors"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Right Section - Navigation Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            {/* Shop Column */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-foreground">Shop</h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link
                    href="/rings"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Rings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bracelets"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Bracelets
                  </Link>
                </li>
                <li>
                  <Link
                    href="/necklaces"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Necklaces
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sale"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sale
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help Column */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-foreground">Help</h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <Link
                    href="/shipping"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Returns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-pink-200 pt-6">
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <span>© {currentYear} Flora Accessories. Designed with</span>
            <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
