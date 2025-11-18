"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassBooksPriceTableProps {
  booksPriceByClass: Record<string, number>;
  classOrder: string[];
  studentsWithBooksByClass: Record<string, number>;
}

export default function ClassBooksPriceTable({ 
  booksPriceByClass, 
  classOrder,
  studentsWithBooksByClass
}: ClassBooksPriceTableProps) {
  // Create sorted data based on classOrder
  const sortedData = classOrder
    .filter(className => booksPriceByClass[className] > 0)
    .map(className => ({
      class: className,
      price: booksPriceByClass[className],
      studentsWithBooks: studentsWithBooksByClass[className] || 0,
    }));

  // Calculate totals
  const totalClasses = sortedData.length;
  const totalBookFees = sortedData.reduce((sum, item) => sum + item.price, 0);
  const averageBookFee = totalClasses > 0 ? totalBookFees / totalClasses : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Books Fee (GH₵)</TableHead>
              <TableHead className="text-right">Students with Books</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.class}>
                <TableCell className="font-medium">{item.class}</TableCell>
                <TableCell className="text-right">{item.price.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {item.studentsWithBooks > 0 ? item.studentsWithBooks.toLocaleString() : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}