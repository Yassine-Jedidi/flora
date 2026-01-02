import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      {/* Root Layout */}
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{/* Page content goes here */}</main>
        <Footer />
      </div>
    </>
  );
}
