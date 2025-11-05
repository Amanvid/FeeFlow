import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SchoolInfoProvider } from "@/context/school-info-context";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SchoolInfoProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
          {children}
        </main>
        <Footer />
      </div>
    </SchoolInfoProvider>
  );
}
