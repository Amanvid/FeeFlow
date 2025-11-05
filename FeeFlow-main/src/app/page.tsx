
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { BookOpenCheck } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image-1');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="container mx-auto px-4 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full text-sm">
                <BookOpenCheck className="w-4 h-4" />
                <span>FeeFlow Navigator</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-gray-900 font-headline">
                Instant Fee Status at Your Fingertips
              </h1>
              <p className="max-w-xl mx-auto lg:mx-0 text-lg text-gray-600">
                Quickly and securely check your child's school fee balance. Our streamlined process makes it simple to stay informed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-primary/40 transition-shadow">
                  <Link href="/check-fees">Get Started</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              {heroImage && (
                <Card className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-md transform hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-0">
                    <Image
                      src={heroImage.imageUrl}
                      alt={heroImage.description}
                      data-ai-hint={heroImage.imageHint}
                      width={600}
                      height={600}
                      className="object-cover aspect-square"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
