"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BooksStatsCardProps {
  title: string;
  value: string | number;
  description: string;
  className?: string;
  icon?: React.ElementType;
}

export default function BooksStatsCard({ 
  title, 
  value, 
  description, 
  className, 
  icon: Icon 
}: BooksStatsCardProps) {
  return (
    <Card className={cn("text-white", className)}>
      <CardHeader className="pb-2">
        <CardDescription className="text-white/80">{title}</CardDescription>
        <CardTitle className="text-4xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-white/80">
          {description}
        </div>
      </CardContent>
    </Card>
  );
}