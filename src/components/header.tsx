
import { BookOpenCheck, UserCog } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold font-headline text-primary">
          <BookOpenCheck className="w-6 h-6" />
          <span>FeeFlow</span>
        </Link>
        <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/check-fees">Check Fees</Link>
            </Button>
            <Button asChild variant="outline" size="icon">
                <Link href="/login" aria-label="Admin Login">
                    <UserCog className="h-5 w-5" />
                </Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
