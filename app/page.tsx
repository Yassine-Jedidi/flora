import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SparkleBanner } from "@/components/home/sparkle-banner";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <SparkleBanner />
      </main>
      <Footer />
    </div>
  );
}
