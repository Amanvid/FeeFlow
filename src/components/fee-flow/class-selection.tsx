"use client";

import { useEffect, useState } from "react";
import { getClasses } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap } from "lucide-react";

type ClassSelectionProps = {
  onClassSelected: (className: string) => void;
};

export default function ClassSelection({ onClassSelected }: ClassSelectionProps) {
  const [classes, setClasses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      setIsLoading(true);
      const fetchedClasses = await getClasses();
      setClasses(fetchedClasses);
      setIsLoading(false);
    }
    fetchClasses();
  }, []);

  return (
    <section>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-center font-headline text-primary">Select a Class</h2>
        <p className="text-muted-foreground mt-2">Choose the class your child belongs to.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          : classes.map((className) => (
              <Card
                key={className}
                onClick={() => onClassSelected(className)}
                className="cursor-pointer hover:shadow-lg hover:border-primary transition-all duration-200 transform hover:-translate-y-1"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{className}</CardTitle>
                  <GraduationCap className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Click to see list of students</p>
                </CardContent>
              </Card>
            ))}
      </div>
    </section>
  );
}
