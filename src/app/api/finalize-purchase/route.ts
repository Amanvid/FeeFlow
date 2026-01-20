
import { NextResponse } from 'next/server';
import type { Invoice } from '@/types';
import { verifyOtp } from '@/lib/actions';
import { getSchoolConfig, getStudentById, getAllClaims, getAllStudents } from '@/lib/data';
import type { PhoneClaim, Student } from '@/lib/definitions';
import { sendSms } from '@/lib/actions';
import { googleSheetsService } from '@/lib/google-sheets';

// Google Sheets service for invoice operations
const googleSheets = googleSheetsService;

// Helper function to get invoices from Google Sheets
async function getInvoicesFromSheet(): Promise<Invoice[]> {
  try {
    const result = await googleSheets.getInvoices();
    if (!result.success) {
      console.error('Failed to get invoices from sheet:', result.message);
      return [];
    }

    // Return the already properly mapped invoices from getInvoices()
    return result.data;
  } catch (error) {
    console.error('Error getting invoices from sheet:', error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const {
      phone, // Guardian's phone for SMS
      otp,
      invoiceId,
      purchaseType,
      bundleName,
      bundlePrice,
      bundleCredits,
      studentName, // Directly passed for non-admin flow
      metadataSheet,
    } = await req.json();

    if (!phone || !otp || !invoiceId || !purchaseType || !bundlePrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminPhoneNumber = '0536282694';
    const otpResult = await verifyOtp(adminPhoneNumber, otp);
    if (!otpResult.success) {
      return NextResponse.json({ error: 'Invalid activation code.' }, { status: 401 });
    }

    // Get invoice from Google Sheets
    const invoices = await getInvoicesFromSheet();
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);

    if (invoiceIndex === -1) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const currentInvoice = invoices[invoiceIndex];
    if (currentInvoice.status === 'PAID') {
      return NextResponse.json({ success: true, message: 'Payment was already confirmed.' });
    }
    currentInvoice.status = 'PAID';
    currentInvoice.updatedAt = new Date().toISOString();

    // Update invoice in Google Sheets
    const updateResult = await googleSheets.updateInvoice(invoiceId, currentInvoice);
    if (!updateResult.success) {
      return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 });
    }

    // Get all data needed for Google Sheets update and SMS
    const allClaims = await getAllClaims();
    // Determine target metadata sheet
    const originalClaim = allClaims.find(c => (purchaseType === 'fee' ? c.invoiceNumber === bundleCredits : c.studentName === studentName));
    const targetMetadataSheet = metadataSheet || (originalClaim as any)?.metadataSource || 'Cop-Metadata';

    const allStudents = await getAllStudents(targetMetadataSheet);
    const schoolConfig = await getSchoolConfig();

    // Update invoice payment status in Google Sheets
    try {
      let invoiceNumber = currentInvoice.id; // Fallback to invoice ID

      if (purchaseType === 'fee') {
        // Non-admin flow: bundleCredits should be the invoice number
        const originalClaim = allClaims.find(c => c.invoiceNumber === bundleCredits);
        if (originalClaim) {
          invoiceNumber = originalClaim.invoiceNumber;
        }
      } else {
        // Admin flow: bundleCredits is the studentId, find recent claim
        const student = allStudents.find(s => s.id === bundleCredits);
        if (student) {
          const recentClaim = allClaims.find(c => c.studentName === student.studentName);
          if (recentClaim) {
            invoiceNumber = recentClaim.invoiceNumber;
          }
        }
      }

      const gsResult = await googleSheetsService.updateInvoicePaymentStatus(invoiceNumber, {
        paid: true,
        paymentDate: new Date().toISOString(),
        paymentReference: currentInvoice.id,
      });

      if (!gsResult.success) {
        console.error('Failed to update invoice status in Google Sheets:', gsResult.message);
        // Don't fail the entire operation if Google Sheets update fails
      } else {
        console.log(`Invoice ${invoiceNumber} payment status updated in Google Sheets`);
      }
    } catch (gsError) {
      console.error('Error updating Google Sheets invoice status:', gsError);
      // Don't fail the entire operation if Google Sheets update fails
    }

    // --- Start of SMS Confirmation Logic ---
    let student: Student | undefined;
    let guardianName = "Guardian"; // Default name
    let guardianPhone = phone; // Phone is now passed directly

    if (purchaseType === 'fee') {
      // Non-admin flow: we get studentName and guardianPhone directly.
      student = allStudents.find(s => s.studentName === studentName);

      if (originalClaim) {
        guardianName = (originalClaim as any).guardianName;
      }

    } else {
      // Admin flow: bundleCredits is the studentId.
      student = allStudents.find(s => s.id === bundleCredits);
      if (student) {
        const recentClaimForStudent = allClaims.find(c => c.studentName === student!.studentName);
        if (recentClaimForStudent) {
          guardianName = recentClaimForStudent.guardianName;
          guardianPhone = recentClaimForStudent.guardianPhone;
        }
      }
    }

    if (student) {
      const amountPaid = parseFloat(bundlePrice);
      const newBalance = student.balance - amountPaid;

      const personalizedMessage = `Dear ${guardianName}, we have received a payment of GHS ${amountPaid.toFixed(2)} for ${student.studentName}. The new balance is GHS ${newBalance.toFixed(2)}. Thank you.`;

      await sendSms(
        [{
          destination: guardianPhone,
          message: personalizedMessage,
          msgid: `conf-${currentInvoice.id.slice(0, 8)}`
        }],
        schoolConfig.senderId
      );
    }
    // --- End of SMS Confirmation Logic ---

    return NextResponse.json({ success: true, message: 'Purchase finalized successfully' });

  } catch (error) {
    console.error('Failed to finalize purchase:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to finalize purchase', details: errorMessage }, { status: 500 });
  }
}
