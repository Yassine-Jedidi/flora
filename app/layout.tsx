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
import { Analytics } from "@vercel/analytics/next";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

import { getTranslations } from "next-intl/server";
import { BASE_URL } from "@/lib/constants/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.root");

  return {
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: BASE_URL,
      languages: {
        "fr-TN": BASE_URL,
        "en-TN": BASE_URL,
        "x-default": BASE_URL,
      },
    },
    title: {
      default: t("title"),
      template: `%s | FloraAccess`,
    },
    description: t("description"),
    keywords: ["jewelry", "accessories", "rings", "necklaces", "bracelets", "earrings", "Tunisia", "FloraAccess"],
    authors: [{ name: "FloraAccess" }],
    creator: "FloraAccess",
    publisher: "FloraAccess",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: BASE_URL,
      siteName: "FloraAccess",
      images: [
        {
          url: "/logo.png",
          width: 587,
          height: 581,
          alt: "FloraAccess - Bijoux et Accessoires de Luxe en Tunisie",
        },
      ],
      locale: (await getLocale()).replace("-", "_"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/logo.png"],
      creator: "@floraaccess",
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-icon.png",
    },
    appleWebApp: {
      title: "FloraAccess",
      statusBarStyle: "default",
      capable: true,
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
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "FloraAccess",
                    "url": BASE_URL,
                    "logo": `${BASE_URL}/logo.png`,
                    "sameAs": [
                      "https://www.instagram.com/flora_.access/"
                    ]
                  })
                }}
              />
              <Toaster />
            </FavoritesProvider>
          </CartProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
