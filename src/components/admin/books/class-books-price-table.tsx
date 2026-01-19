"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassBookConfig } from "@/lib/definitions";

interface ClassBooksPriceTableProps {
  booksConfig: ClassBookConfig[];
}

export default function ClassBooksPriceTable({
  booksConfig
}: ClassBooksPriceTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Group</TableHead>
              <TableHead className="text-right">Books Fees</TableHead>
              <TableHead className="text-right">Text Books Quantity</TableHead>
              <TableHead className="text-right">Exercise Books Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {booksConfig.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.className}</TableCell>
                <TableCell className="text-right">{item.booksFee.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.textBooksQty}</TableCell>
                <TableCell className="text-right">{item.exerciseBooksQty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}