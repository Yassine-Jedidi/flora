import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from "@/lib/hooks/use-favorites";

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
        <FavoritesProvider>{children}</FavoritesProvider>
      </body>
    </html>
  );
}
