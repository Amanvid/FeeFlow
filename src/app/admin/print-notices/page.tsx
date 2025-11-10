
"use client";

import { useState, useEffect } from "react";
import { getAllStudents, getSchoolConfig } from "@/lib/data";
import type { Student, SchoolConfig } from "@/lib/definitions";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";

type FeeNoticeProps = {
  student: Student;
  config: SchoolConfig;
  noticeNumber: string;
};

function FeeNoticeSlip({ student, config, noticeNumber }: FeeNoticeProps) {
    const arrears = student.arrears > 0 ? student.arrears : 0;
    const booksFee = student.books > 0 ? student.books : 0;
    const totalBalance = student.balance;

    const currentTermFeeOutstanding = totalBalance > (arrears + booksFee) ? totalBalance - arrears - booksFee : 0;
    
    const hasArrears = arrears > 0;
    const hasCurrentTermFee = currentTermFeeOutstanding > 0;
    const hasBooksFee = booksFee > 0;
    
    // This is a simplification; a more complex app might have term-specific fee items.
    const currentTermName = "Current Term";

    return (
        <div className="fee-notice-slip relative w-full border-2 border-dashed border-gray-400 p-4 rounded-lg break-inside-avoid-page overflow-hidden flex flex-col h-full">
            {config.logoUrl && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <Image
                        src={config.logoUrl}
                        alt="School Watermark"
                        width={200}
                        height={200}
                        className="opacity-5"
                    />
                </div>
            )}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center">
                    {config.logoUrl && <Image src={config.logoUrl} alt="School Logo" width={50} height={50} />}
                    <div className="text-center">
                        <h1 className="text-xl font-bold font-headline text-black">{config.schoolName}</h1>
                        <p className="text-md font-semibold border-2 border-black px-2 inline-block mt-1">FEES NOTICE</p>
                    </div>
                    {config.logoUrl && <Image src={config.logoUrl} alt="School Logo" width={50} height={50} />}
                </div>

                {/* Body */}
                <div className="mt-4 text-sm flex-grow">
                    <p>This Slip is to remind you of the remaining balance of <span className="font-bold">{student.studentName} ({student.class})</span>.</p>
                    <div className="flex justify-between items-start mt-1">
                        <p>Remaining balance:</p>
                        <p className="text-right font-semibold">No. {noticeNumber}</p>
                    </div>
                    
                    <div className="ml-4 my-16 font-bold">
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 text-sm">
                            {hasArrears && (
                                <>
                                    <span>Last Term Arrears</span>
                                    <span className="text-center">-</span>
                                    <span className="text-right">GHS {arrears.toFixed(2)}</span>
                                </>
                            )}
                            {hasCurrentTermFee && (
                               <>
                                    <span>{currentTermName} fees</span>
                                    <span className="text-center">-</span>
                                    <span className="text-right">GHS {currentTermFeeOutstanding.toFixed(2)}</span>
                               </>
                            )}
                             {hasBooksFee && (
                               <>
                                    <span>Books</span>
                                    <span className="text-center">-</span>
                                    <span className="text-right">GHS {booksFee.toFixed(2)}</span>
                               </>
                            )}
                        </div>
                        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 pt-1 mt-1 border-t border-black text-lg">
                            <span className="font-extrabold">Total fees</span>
                            <span className="text-center font-extrabold">=</span>
                            <span className="text-right font-extrabold">GHS {totalBalance.toFixed(2)}</span>
                        </div>
                    </div>

                    <p>Please we edge you to pay us the balance of the school fees.</p>
                    <p className="mt-1">Counting on your usual cooperation.</p>
                    <p className="mt-2">Thank you.</p>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 flex justify-between items-end">
                    <div className="text-[10px] leading-tight">
                        <p className="font-bold">MOTTO:QUALITY EDUCATION</p>
                        <p className="font-bold">THROUGH THE KNOWLEDGE</p>
                        <p className="font-bold">OF GOD</p>
                        <p className="mt-1">Tel: {config.momoNumber}</p>
                    </div>
                    <div className="text-center text-xs">
                        <p className="border-t-2 border-dotted border-gray-500 px-4 pt-1">David Amankwaah</p>
                        <p className="text-[10px]">(Campus Manager)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function PrintNoticesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [config, setConfig] = useState<SchoolConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [fetchedStudents, fetchedConfig] = await Promise.all([
        getAllStudents(),
        getSchoolConfig(),
      ]);
      setStudents(fetchedStudents);
      setConfig(fetchedConfig);
      setLoading(false);
    }
    fetchData();
  }, []);


  const owingStudents = students.filter(s => s.balance > 0);

  // Function to pad number for notice ID
  const pad = (num: number, size: number) => ('0000' + num).slice(size * -1);

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 sm:p-8">
       <div className="max-w-4xl mx-auto mb-8 no-print">
            <h1 className="text-3xl font-bold">Print Fee Notices</h1>
            <p className="text-muted-foreground mt-1">Showing notices for {owingStudents.length} students with outstanding balances. Use your browser's print function (Ctrl+P or Cmd+P) to print this page.</p>
            <Button onClick={() => window.print()} className="mt-4">
                <Printer className="mr-2" /> Print Notices
            </Button>
        </div>
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 print-container">
         <div className="print-grid">
            {owingStudents.length > 0 ? (
            owingStudents.map((student, index) => (
                <FeeNoticeSlip key={student.id} student={student} config={config} noticeNumber={pad(index + 1, 4)} />
            ))
            ) : (
            <div className="text-center py-16 col-span-1 no-print">
                <h2 className="text-2xl font-semibold">No Outstanding Balances</h2>
                <p className="text-muted-foreground mt-2">All students have cleared their fees. Great job!</p>
            </div>
            )}
         </div>
      </div>

       <style jsx global>{`
            @media screen {
                .print-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem;
                }
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .no-print {
                    display: none;
                }
                .print-container {
                    padding: 0 !important;
                    margin: 0 !important;
                    max-width: 100% !important;
                    background: none !important;
                }
                .print-grid {
                    display: grid;
                    grid-template-columns: 1fr; /* Single column layout for printing */
                    gap: 1.5cm 0;
                }
                .fee-notice-slip {
                    page-break-inside: avoid;
                    border: 2px solid #ccc !important;
                    height: 9cm; /* Approx 1/3 of A4 height, leaving margin */
                    overflow: hidden;
                }
            }
             @page {
                size: A4;
                margin: 1cm;
            }
      `}</style>
    </div>
  );
}
