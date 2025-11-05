"use client";

import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
      <div className="space-y-4">
        <div className="inline-flex rounded-full bg-destructive/10 p-4">
          <div className="rounded-full bg-destructive/20 p-4">
            <TriangleAlert className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tighter sm:text-5xl">
          Something Went Wrong
        </h1>
        <p className="max-w-xl text-muted-foreground">
          We've encountered an unexpected error. Please try again, or if the
          problem persists, return to the homepage.
        </p>
        {error?.digest && (
          <p className="text-xs text-muted-foreground">
            Error Digest: {error.digest}
          </p>
        )}
      </div>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()}>Try Again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
