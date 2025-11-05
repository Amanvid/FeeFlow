import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function CheckFeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}
