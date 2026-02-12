import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SparkleBanner } from "@/components/home/sparkle-banner";
import { CuratedStyles } from "@/components/home/curated-styles";
import { FeaturedSection } from "@/components/home/featured-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { BASE_URL } from "@/lib/constants/site";

function HomeSkeleton() {
  return (
    <div className="py-20 w-[95%] max-w-7xl mx-auto space-y-20">
      <div className="space-y-10">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-10 w-48 rounded-full" />
          <Skeleton className="h-16 w-96 rounded-2xl" />
          <Skeleton className="h-6 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-[2.5rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": BASE_URL,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${BASE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
      <Navbar />
      <main className="flex-1 pt-36 bg-[#FFF8FA]">
        <SparkleBanner />
        <Suspense fallback={<HomeSkeleton />}>
          <FeaturedSection />
        </Suspense>
        <Suspense fallback={<HomeSkeleton />}>
          <CuratedStyles />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
