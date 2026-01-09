import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/lib/hooks/use-favorites";
import { CartProvider } from "@/lib/hooks/use-cart";

import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flora | Explore Unique Treasures",
  description:
    "Discover beautiful jewelry and accessories to brighten your day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <CartProvider>
          <FavoritesProvider>
            {children}
            <Toaster />
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
