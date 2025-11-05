
"use client";

import { useEffect, useState, useRef } from "react";
import type { Student, SchoolConfig } from "@/lib/definitions";
import { getSchoolConfig, getClaimsForInvoiceGeneration, saveClaim } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, CreditCard, Loader2, FilePlus2 } from "lucide-react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";

type FeeResultProps = {
  student: Student;
  userInfo: { name: string; phone: string; relationship: string; };
};

// Function to pad the invoice number
const padInvoiceNumber = (num: number) => num.toString().padStart(4, '0');

export default function FeeResult({ student, userInfo }: FeeResultProps) {
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const printableRef = useRef<HTMLDivElement>(null);
  const hasSavedClaim = useRef(false);
  const [issueDate, setIssueDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchDataAndGenerateInvoice() {
      setIsLoading(true);
      const [fetchedConfig, claims] = await Promise.all([
          getSchoolConfig(),
          getClaimsForInvoiceGeneration()
      ]);
      setConfig(fetchedConfig);

      // Generate invoice number
      const prefix = fetchedConfig.invoicePrefix || 'CEC-INV';
      const invoiceNumbers = claims
        .map(c => c.invoiceNumber)
        .filter(inv => inv && inv.startsWith(prefix))
        .map(inv => parseInt(inv.replace(prefix, '').replace('-', ''), 10))
        .filter(num => !isNaN(num));

      const lastNumber = invoiceNumbers.length > 0 ? Math.max(...invoiceNumbers) : 0;
      const newInvoiceNumber = `${prefix}-${padInvoiceNumber(lastNumber + 1)}`;
      setInvoiceNumber(newInvoiceNumber);
      
      setIssueDate(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));

      setIsLoading(false);
    }
    fetchDataAndGenerateInvoice();
  }, []);

  // Effect to save the claim once the invoice number is generated
  useEffect(() => {
    if (invoiceNumber && config && !hasSavedClaim.current) {
        hasSavedClaim.current = true; // Set immediately to prevent double-sends
        saveClaim({
            guardianName: userInfo.name,
            guardianPhone: userInfo.phone,
            relationship: userInfo.relationship,
            studentName: student.studentName,
            class: student.class,
            totalFeesBalance: student.balance,
            dueDate: config.dueDate,
            invoiceNumber: invoiceNumber,
        }).then(result => {
            if (!result.success) {
                console.error("Failed to save claim:", result.message);
                // Optionally: handle UI feedback for failed save
            }
        });
    }
  }, [invoiceNumber, student, userInfo, config]);


  const handlePrint = () => {
    window.print();
  };

  const handleMakePayment = () => {
    const amountToPay = student.balance > 0 ? student.balance : '0';

    const params = new URLSearchParams({
        purchaseType: 'fee',
        bundle: `Fee for ${student.studentName}`,
        credits: invoiceNumber || student.id, 
        price: amountToPay.toString(),
        class: student.class || '',
        userPhone: userInfo.phone,
        studentName: student.studentName,
        studentId: student.id || '',
    });
    router.push(`/payment/purchase?${params.toString()}`);
  }

  const handleNewCheck = () => {
    // This reloads the page to start the flow from scratch
    window.location.href = '/check-fees';
  };

  const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
  
  const subTotal = student.fees + student.arrears + student.books;

  if (isLoading || !config || !invoiceNumber) {
    return (
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardContent className="space-y-4 p-8">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
          </div>
          <p className="text-center text-muted-foreground">Generating unique invoice, please wait...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div id="printable-area" ref={printableRef} className="bg-white">
        <Card className="shadow-2xl relative overflow-hidden border-2 border-gray-100">
          <CardContent className="p-8 sm:p-12 relative z-10">
            {config.logoUrl && (
              <div className="watermark">
                <Image src={config.logoUrl} alt="School Logo Watermark" width={300} height={300} />
              </div>
            )}
            
            {/* Header */}
            <header className="flex justify-between items-start pb-8 border-b-2 border-black">
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
                <p className="text-sm text-muted-foreground mt-1">Invoice #: {invoiceNumber}</p>
              </div>
            </header>

            {/* Bill To & Dates */}
            <section className="grid grid-cols-2 gap-8 mt-8">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bill To</p>
                <p className="font-bold text-lg text-foreground mt-2">{userInfo.name} ({userInfo.relationship})</p>
                <p className="text-muted-foreground">{student.studentName}</p>
                <p className="text-muted-foreground">{student.class}</p>
              </div>
              <div className="text-right">
                  <div className="flex justify-end gap-6">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Issue Date</p>
                      <p className="text-sm text-foreground">{issueDate}</p>
                  </div>
                  <div className="flex justify-end gap-6 mt-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Due Date</p>
                      <p className="text-sm text-foreground">{config.dueDate}</p>
                  </div>
              </div>
            </section>
            
            {/* Fee Details */}
            <section className="mt-10">
              <div className="rounded-lg bg-gray-50/50 p-6 border">
                <div className="flex justify-between font-semibold text-muted-foreground border-b pb-2">
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

            {/* Summary */}
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
                  <p className="text-2xl font-bold text-red-600">GH₵ {student.balance.toFixed(2)}</p>
                </div>
              </div>
            </section>

            <Separator className="my-8" />
            
            {/* Footer */}
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
                    <p>Use "{invoiceNumber}" as reference.</p>
                </div>
            </footer>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 no-print">
        <Card>
            <CardFooter className="p-4">
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Button onClick={handlePrint} className="w-full" variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Print / Download
                    </Button>
                    <Button onClick={handleNewCheck} className="w-full" variant="outline">
                        <FilePlus2 className="mr-2 h-4 w-4" /> Start New Check
                    </Button>
                    <Button onClick={handleMakePayment} className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" /> Make Payment
                    </Button>
                </div>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
