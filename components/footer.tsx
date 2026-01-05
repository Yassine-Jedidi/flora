"use client";

import { Instagram, Facebook, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-pink-50/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Left Section - Company Information */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/flora sparkle.png"
                alt="Flora Logo"
                width={120}
                height={40}
                className="h-24 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Elevating everyday moments with exquisite adornments.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://www.instagram.com/flora_.access/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-500 hover:text-purple-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@floraaccess"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-500 hover:text-purple-600 transition-colors"
                aria-label="TikTok"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/people/Flora-Accessories/61586066246480/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-500 hover:text-purple-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
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
