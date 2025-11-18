
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
        <div className="fee-notice-slip relative w-full border-2 border-dashed border-gray-400 p-3 rounded-lg break-inside-avoid-page overflow-hidden flex flex-col h-full print:rounded-none print:border-0">
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
                <div className="flex justify-between items-center print:block print:text-center print:mb-2 print:text-center">
                    {config.logoUrl && <Image src={config.logoUrl} alt="School Logo" width={50} height={50} className="print:w-8 print:h-8 print:inline-block print:align-middle print:mr-1" />}
                    <div className="text-center flex-1 mx-2 print:inline-block print:align-middle print:text-center">
                        <h1 className="text-xl font-bold font-headline text-black print:text-base print:leading-tight print:inline">{config.schoolName}</h1>
                        <p className="text-md font-semibold border-2 border-black px-2 inline-block mt-1 print:text-sm print:px-1 print:py-0 print:leading-tight print:mt-0.5 print:block">FEES NOTICE</p>
                    </div>
                    {config.logoUrl && <Image src={config.logoUrl} alt="School Logo" width={50} height={50} className="print:w-8 print:h-8 print:inline-block print:align-middle print:ml-1" />}
                </div>

                {/* Body */}
                <div className="mt-3 text-sm flex-grow print:mt-2 print:block print:text-center">
                        <p className="print:text-xs print:leading-tight print:block print:text-center">This Slip is to remind you of the remaining balance of <span className="font-bold">{student.studentName} ({student.class})</span>.</p>
                        <div className="flex justify-between items-start mt-1 print:mt-1 print:block print:text-center">
                            <p className="print:text-xs print:leading-tight print:inline-block print:text-center">Remaining balance:</p>
                            <p className="text-right font-semibold print:text-xs print:leading-tight print:inline-block print:text-center">No. {noticeNumber}</p>
                        </div>
                        
                        <div className="ml-4 my-2 font-bold print:my-2 print:ml-2 print:block print:text-center">
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 text-sm print:text-xs print:grid-cols-3 print:gap-1 print:text-center">
                                {hasArrears && (
                                    <>
                                        <span className="print:leading-tight print:text-center">Last Term Arrears</span>
                                        <span className="text-center print:leading-tight print:text-center">-</span>
                                        <span className="text-right print:leading-tight print:text-center">GHS {arrears.toFixed(2)}</span>
                                    </>
                                )}
                                {hasCurrentTermFee && (
                                   <>
                                        <span className="print:leading-tight print:text-center">{currentTermName} fees</span>
                                        <span className="text-center print:leading-tight print:text-center">-</span>
                                        <span className="text-right print:leading-tight print:text-center">GHS {currentTermFeeOutstanding.toFixed(2)}</span>
                                   </>
                                )}
                                 {hasBooksFee && (
                                   <>
                                        <span className="print:leading-tight print:text-center">Books</span>
                                        <span className="text-center print:leading-tight print:text-center">-</span>
                                        <span className="text-right print:leading-tight print:text-center">GHS {booksFee.toFixed(2)}</span>
                                   </>
                                )}
                            </div>
                            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 pt-1 mt-1 border-t border-black text-lg print:text-sm print:mt-1 print:pt-1 print:grid-cols-3 print:gap-1 print:text-center">
                                <span className="font-extrabold print:leading-tight print:text-center">Total fees</span>
                                <span className="text-center font-extrabold print:leading-tight print:text-center">=</span>
                                <span className="text-right font-extrabold print:leading-tight print:text-center">GHS {totalBalance.toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="print:text-xs print:leading-tight print:block print:text-center">Please we edge you to pay us the balance of the school fees.</p>
                        <p className="mt-1 print:text-xs print:mt-1 print:leading-tight print:block print:text-center">Counting on your usual cooperation.</p>
                        <p className="mt-2 print:text-xs print:mt-1 print:leading-tight print:block print:text-center">Thank you.</p>
                    </div>

                {/* Footer */}
                <div className="mt-auto pt-3 flex justify-between items-end print:pt-2 print:block print:text-center print:relative print:bottom-0 print:left-0 print:right-0 print:text-center">
                    <div className="text-[10px] leading-tight print:text-[8px] print:inline-block print:text-center print:align-top print:w-1/2 print:px-1">
                        <p className="font-bold print:leading-tight print:text-center">MOTTO:QUALITY EDUCATION</p>
                        <p className="font-bold print:leading-tight print:text-center">THROUGH THE KNOWLEDGE</p>
                        <p className="font-bold print:leading-tight print:text-center">OF GOD</p>
                        <p className="mt-1 print:mt-0 print:leading-tight print:text-center">Tel: {config.momoNumber}</p>
                    </div>
                    <div className="text-center text-xs print:text-[8px] print:inline-block print:text-center print:align-top print:w-1/2 print:px-1">
                        <p className="border-t-2 border-dotted border-gray-500 px-4 pt-1 print:px-2 print:pt-0.5 print:leading-tight print:text-center">David Amankwaah</p>
                        <p className="text-[10px] print:text-[7px] print:leading-tight print:text-center">(Campus Manager)</p>
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
                html, body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    color: black !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow: visible !important;
                    float: none !important;
                    position: static !important;
                }
                .no-print {
                    display: none !important;
                }
                .print-container {
                    padding: 0 !important;
                    margin: 0 !important;
                    max-width: 100% !important;
                    background: none !important;
                    box-shadow: none !important;
                    border: none !important;
                    width: 100% !important;
                    height: auto !important;
                    display: block !important;
                    position: static !important;
                    float: none !important;
                    overflow: visible !important;
                }
                .print-grid {
                    display: block !important;
                    width: 100% !important;
                    height: auto !important;
                    background: white !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: static !important;
                    float: none !important;
                    overflow: visible !important;
                }
                /* Main container styles */
                .bg-gray-100 {
                    background: white !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }
                .fee-notice-slip {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    border: 1px solid #ccc !important;
                    border-bottom: none !important;
                    height: 9.8cm !important; /* Slightly less than 1/3 of A4 height */
                    max-height: 9.8cm !important;
                    overflow: visible !important;
                    margin: 0 !important;
                    padding: 0.4cm !important;
                    border-radius: 0 !important;
                    background: white !important;
                    box-shadow: none !important;
                    display: block !important;
                    position: relative !important;
                    float: none !important;
                    clear: both !important;
                }
                .fee-notice-slip:last-child {
                    border-bottom: 1px solid #ccc !important;
                }
                /* Ensure exactly 3 per page */
                .fee-notice-slip:nth-child(3n) {
                    page-break-after: always !important;
                    break-after: page !important;
                }
                .fee-notice-slip:nth-child(3n+1):not(:first-child) {
                    page-break-before: always !important;
                    break-before: page !important;
                }
                /* Force content visibility */
                .fee-notice-slip * {
                    visibility: visible !important;
                    display: block !important;
                    opacity: 1 !important;
                    color: black !important;
                    background: transparent !important;
                    position: static !important;
                    float: none !important;
                    clear: none !important;
                    transform: none !important;
                    filter: none !important;
                }
                /* Ensure all text elements are visible */
                .fee-notice-slip p, .fee-notice-slip span, .fee-notice-slip div, 
                .fee-notice-slip h1, .fee-notice-slip h2, .fee-notice-slip h3,
                .fee-notice-slip table, .fee-notice-slip tr, .fee-notice-slip td, .fee-notice-slip th {
                    display: block !important;
                    visibility: visible !important;
                    color: black !important;
                    background: transparent !important;
                }
                /* Ensure images are visible */
                .fee-notice-slip img {
                    display: inline-block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                }
                /* Header alignment for print */
                .fee-notice-slip .print\:block {
                    display: block !important;
                    text-align: center !important;
                    margin-bottom: 0.5rem !important;
                }
                .fee-notice-slip .print\:inline-block {
                    display: inline-block !important;
                    vertical-align: middle !important;
                    margin: 0 0.25rem !important;
                }
                .fee-notice-slip .print\:align-middle {
                    vertical-align: middle !important;
                }
                .fee-notice-slip .print\:text-center {
                    text-align: center !important;
                }
                .fee-notice-slip .print\:text-left {
                    text-align: left !important;
                }
                .fee-notice-slip .print\:w-1\/2 {
                    width: 50% !important;
                    display: inline-block !important;
                    vertical-align: top !important;
                    box-sizing: border-box !important;
                }
                /* Adjust font sizes for better fit */
                .fee-notice-slip h1 {
                    font-size: 1rem !important;
                    line-height: 1.2 !important;
                    margin: 0.125rem 0 !important;
                }
                .fee-notice-slip .text-xl {
                    font-size: 1rem !important;
                    line-height: 1.2 !important;
                }
                .fee-notice-slip .text-md {
                    font-size: 0.875rem !important;
                    line-height: 1.2 !important;
                }
                .fee-notice-slip .text-sm {
                    font-size: 0.75rem !important;
                    line-height: 1.3 !important;
                }
                .fee-notice-slip .text-xs {
                    font-size: 0.625rem !important;
                    line-height: 1.3 !important;
                }
                .fee-notice-slip .text-\[10px\] {
                    font-size: 0.5rem !important;
                    line-height: 1.2 !important;
                }
                .fee-notice-slip .print\:text-\[8px\] {
                    font-size: 0.5rem !important;
                    line-height: 1.2 !important;
                }
                .fee-notice-slip .print\:text-\[7px\] {
                    font-size: 0.4375rem !important;
                    line-height: 1.2 !important;
                }
                /* Adjust image sizes */
                .fee-notice-slip img {
                    max-width: 40px !important;
                    max-height: 40px !important;
                    display: inline-block !important;
                    vertical-align: middle !important;
                }
                /* Reduce padding and margins */
                .fee-notice-slip > div {
                    padding: 0 !important;
                }
                .fee-notice-slip .mt-4 {
                    margin-top: 0.25rem !important;
                }
                .fee-notice-slip .mt-2 {
                    margin-top: 0.125rem !important;
                }
                .fee-notice-slip .my-2 {
                    margin-top: 0.125rem !important;
                    margin-bottom: 0.125rem !important;
                }
                .fee-notice-slip .ml-4 {
                    margin-left: 0.5rem !important;
                }
                .fee-notice-slip .pt-4 {
                    padding-top: 0.25rem !important;
                }
                /* Fix grid layout for print */
                .fee-notice-slip .print\:grid-cols-3 {
                    display: grid !important;
                    grid-template-columns: auto 1fr auto !important;
                    gap: 0.25rem !important;
                }
                .fee-notice-slip .print\:gap-1 {
                    gap: 0.25rem !important;
                }
                /* Fix leading/line-height */
                .fee-notice-slip .print\:leading-tight {
                    line-height: 1.2 !important;
                }
            }
             @page {
                size: A4;
                margin: 0;
            }
      `}</style>
    </div>
  );
}
