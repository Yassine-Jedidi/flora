import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SparkleBanner } from "@/components/home/sparkle-banner";
import { CuratedStyles } from "@/components/home/curated-styles";
import { FeaturedSection } from "@/components/home/featured-section";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-36 bg-[#FFF8FA]">
        <SparkleBanner />
        <FeaturedSection />
        <CuratedStyles />
      </main>
      <Footer />
    </div>
  );
}
