
"use client";

import { useRef } from "react";
import type { Student, SchoolConfig, PhoneClaim } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Printer } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

type InvoiceCardProps = {
  claim: PhoneClaim;
  student: Student;
  config: SchoolConfig;
};

export default function InvoiceCard({ claim, student, config }: InvoiceCardProps) {
  const printableRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printableRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${claim.invoiceNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=PT+Sans:wght@400;700&display=swap');
              body { 
                font-family: 'PT Sans', sans-serif;
                margin: 0;
              }
              .invoice-container { 
                padding: 2rem; 
                max-width: 800px;
                margin: auto;
              }
              .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: -1;
                opacity: 0.05;
                pointer-events: none;
              }
              .no-print { display: none; }
            </style>
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: {
                      body: ['"PT Sans"', 'sans-serif'],
                      headline: ['Poppins', 'sans-serif'],
                    },
                    colors: {
                      primary: '#4f46e5',
                      'muted-foreground': '#6b7280',
                      foreground: '#111827',
                    }
                  }
                }
              }
            </script>
          </head>
          <body>
            <div class="invoice-container">
              ${printContent.innerHTML}
            </div>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-sm text-foreground">{value}</p>
    </div>
  );
  
  const subTotal = student.fees + student.arrears + student.books;
  const issueDate = new Date(claim.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bg-gray-100 p-4 sm:p-8">
        <div id="printable-area" ref={printableRef} className="bg-white max-w-4xl mx-auto relative">
            <Card className="shadow-lg relative overflow-hidden border-gray-200">
            <CardHeader className="p-8 sm:p-12">
                <div className="flex justify-between items-start pb-8 border-b-2 border-black">
                <div className="flex items-center gap-4">
                    {config.logoUrl && <Image src={config.logoUrl} alt="School Logo" width={80} height={80} className="rounded-full" />}
                    <div>
                    <h1 className="text-2xl font-bold font-headline text-gray-800">{config.schoolName}</h1>
                    <p className="text-sm text-muted-foreground">{config.address}</p>
                    <p className="text-sm text-muted-foreground">{config.momoNumber}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-bold font-headline text-primary tracking-widest">INVOICE</h2>
                    <p className="text-sm text-muted-foreground mt-1">Invoice #: {claim.invoiceNumber}</p>
                </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 sm:p-12 pt-0 relative z-10">
                {config.logoUrl && (
                <div className="watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-5 pointer-events-none">
                    <Image src={config.logoUrl} alt="School Logo Watermark" width={400} height={400} />
                </div>
                )}
                
                <section className="grid grid-cols-2 gap-8 mt-8">
                <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bill To</p>
                    <p className="font-bold text-lg text-foreground mt-2">{claim.guardianName} ({claim.relationship})</p>
                    <p className="text-muted-foreground">{claim.studentName}</p>
                    <p className="text-muted-foreground">{claim.class}</p>
                </div>
                <div className="text-right">
                    <div className="flex justify-end gap-6">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Issue Date</p>
                        <p className="text-sm text-foreground">{issueDate}</p>
                    </div>
                    <div className="flex justify-end gap-6 mt-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Due Date</p>
                        <p className="text-sm text-foreground">{claim.dueDate}</p>
                    </div>
                </div>
                </section>
                
                <section className="mt-10">
                <div className="rounded-lg bg-gray-50/50 p-6 border">
                    <div className="flex justify-between font-semibold text-muted-foreground text-sm border-b pb-2">
                    <p>Description</p>
                    <p>Amount (GHS)</p>
                    </div>
                    <div className="space-y-2 mt-4">
                        <DetailRow label="School Fees" value={student.fees.toFixed(2)} />
                        <DetailRow label="Arrears" value={student.arrears.toFixed(2)} />
                        <DetailRow label="Book Fees" value={student.books.toFixed(2)} />
                    </div>
                </div>
                </section>

                <section className="mt-8 flex justify-end">
                <div className="w-full max-w-sm space-y-3 text-sm">
                    <div className="flex justify-between">
                    <p className="text-muted-foreground">Sub Total</p>
                    <p className="font-medium text-foreground">GH₵ {subTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-medium text-green-600">(GH₵ {student.amountPaid.toFixed(2)})</p>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">Balance Due</p>
                    <p className="text-2xl font-bold text-red-600">GH₵ {claim.totalFeesBalance.toFixed(2)}</p>
                    </div>
                </div>
                </section>

                <Separator className="my-8" />
                
                <footer className="grid grid-cols-2 gap-8 text-xs text-muted-foreground">
                    <div>
                        <h4 className="font-semibold text-foreground uppercase tracking-wider mb-2">Payment Terms</h4>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Payment is due by {config.dueDate}.</li>
                            <li>Late fee of 2% per month may apply after the due date.</li>
                            <li>Please quote the invoice number when making payments.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground uppercase tracking-wider mb-2">Payment Methods</h4>
                        <p>Mobile Money</p>
                        <p>Dial {config.momoNumber}.</p>
                        <p>Use "{claim.invoiceNumber}" as reference.</p>
                    </div>
                </footer>
            </CardContent>
            </Card>
        </div>
      <CardFooter className="p-4 bg-white/50 backdrop-blur-sm mt-4 border-t sticky bottom-0">
        <div className="w-full flex justify-end">
            <Button onClick={handlePrint} className="w-full sm:w-auto">
                <Printer className="mr-2 h-4 w-4" /> Print / Download
            </Button>
        </div>
      </CardFooter>
    </div>
  );
}

    