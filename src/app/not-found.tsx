"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
      <div className="space-y-4">
        <div className="inline-flex rounded-full bg-destructive/10 p-4">
          <div className="rounded-full bg-destructive/20 p-4">
            <Frown className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tighter sm:text-7xl">
          404 - Page Not Found
        </h1>
        <p className="max-w-md text-muted-foreground">
          Sorry, the page you are looking for does not exist or has been moved.
          Let's get you back on track.
        </p>
      </div>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/check-fees">Check Fees</Link>
        </Button>
      </div>
    </div>
  );
}
