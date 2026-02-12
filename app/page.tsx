import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SparkleBanner } from "@/components/home/sparkle-banner";
import { CuratedStyles } from "@/components/home/curated-styles";
import { FeaturedSection } from "@/components/home/featured-section";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://www.floraaccess.tn",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.floraaccess.tn/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <Navbar />
      <main className="flex-1 pt-36 bg-[#FFF8FA]">
        <SparkleBanner />
        <Suspense fallback={<div className="h-96" />}>
          <FeaturedSection />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <CuratedStyles />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
