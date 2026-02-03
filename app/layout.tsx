import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Nunito } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/lib/hooks/use-favorites";
import { CartProvider } from "@/lib/hooks/use-cart";
import { ScrollToTop } from "@/components/scroll-to-top";
import { MobileDebug } from "@/components/mobile-debug";
import { IOSCompatibilityChecker } from "@/components/ios-compatibility-checker";

import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("Metadata.root");

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-icon.png",
    },
    appleWebApp: {
      title: "FloraAccess",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://utfs.io" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link rel="preconnect" href="https://img.utfs.io" />
        <link rel="dns-prefetch" href="https://img.utfs.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${nunito.variable} font-sans antialiased text-flora-dark`}>
        <MobileDebug />
        <IOSCompatibilityChecker />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <CartProvider>
            <FavoritesProvider>
              <ScrollToTop />
              {children}
              <Toaster />
            </FavoritesProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
