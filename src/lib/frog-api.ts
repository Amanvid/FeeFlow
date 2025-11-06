
"use server";

import { v4 as uuid } from 'uuid';

const FROG_API_BASE_URL = "https://frogapi.wigal.com.gh/api/v3";
const SENDER_ID = "FeeFlow";
const API_KEY = process.env.FROG_API_KEY || "$2y$10$6oYYcjc6Ge3/W.P.1Yqk6eHBs0ERVFR6IaBQ2qpYGBnMYp28B3uPe";
const USERNAME = process.env.FROG_USERNAME || "amanvid";

export async function generateOtp(phone: string): Promise<{ success: boolean; message: string }> {
  console.log(`Generating OTP for ${phone}`);

  try {
    const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify({
        number: phone,
        expiry: 5,
        length: 6,
        messagetemplate: `Your ${SENDER_ID} verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
        type: "NUMERIC",
        senderid: SENDER_ID,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === "SUCCESS") {
      console.log(`Successfully sent OTP to ${phone}`);
      return { success: true, message: data.message || "An OTP has been sent to your phone." };
    } else {
      console.error("Failed to send OTP:", data);
      return { success: false, message: data.message || "Failed to send OTP. Please try again." };
    }
  } catch (error) {
    console.error("Error in generateOtp:", error);
    return { success: false, message: "An unexpected error occurred while sending OTP." };
  }
}

export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
  console.log(`Verifying OTP ${otp} for ${phone}`);

  try {
    const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "API-KEY": API_KEY,
            "USERNAME": USERNAME,
        },
        body: JSON.stringify({
            otpcode: otp,
            number: phone,
        }),
    });

    const data = await response.json();

    if (response.ok && data.status === "SUCCESS") {
        console.log(`Successfully verified OTP for ${phone}`);
        return { success: true, message: data.message };
    } else {
        console.warn(`OTP verification failed for ${phone}:`, data.message);
        return { success: false, message: data.message || "OTP verification failed." };
    }
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return { success: false, message: "An unexpected error occurred during OTP verification." };
  }
}

export async function generateActivationCode(phone: string): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "API-KEY": API_KEY,
          "USERNAME": USERNAME,
        },
        body: JSON.stringify({
          number: phone,
          expiry: 20, // Longer expiry for activation
          length: 8, // 8-digit code for higher security
          messagetemplate: `Your ${SENDER_ID} activation code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
          type: 'ALPHANUMERIC',
          senderid: SENDER_ID,
        }),
      });
      return await response.json();
    } catch (error) {
        console.error('Error generating activation code:', error);
        return { status: 'FAILED', message: 'An unexpected error occurred.' };
    }
}


interface AdminActivationCodeParams {
  adminPhone: string;
  guardianPhone: string;
  studentName: string;
  className: string;
  totalAmount: number;
}

export async function generateAdminActivationCode({ adminPhone, guardianPhone, studentName, className, totalAmount }: AdminActivationCodeParams): Promise<{ success: boolean; message: string }> {
  console.log(`Generating 8-digit activation code for admin ${adminPhone}`);
   
  const messageTemplate = `${guardianPhone} Your confirmation code for FeeFlow is: %OTPCODE%. It expires in %EXPIRY% minutes. reff. ${studentName} - ${className} (GHS ${totalAmount.toFixed(2)})`;

  try {
    const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify({
        number: adminPhone,
        expiry: 15,
        length: 8,
        messagetemplate: messageTemplate,
        type: 'ALPHANUMERIC',
        senderid: SENDER_ID,
      }),
    });

    const data = await response.json();

    if (response.ok && data.status === "SUCCESS") {
      console.log(`Successfully sent detailed 8-digit code to ${adminPhone}`);
      return { success: true, message: data.message || "An activation code has been sent to the admin." };
    } else {
      console.error("Failed to send detailed activation code:", data);
      return { success: false, message: data.message || "Failed to send detailed activation code." };
    }
  } catch (error) {
    console.error("Error in generateAdminActivationCode:", error);
    return { success: false, message: "An unexpected error occurred while sending the detailed activation code." };
  }
}

export async function sendFeeReminderSms(student: any): Promise<{ success: boolean; message: string }> {
  if (!student.guardianPhone) {
    return { success: false, message: "Guardian phone number is missing." };
  }
  if (student.balance <= 0) {
    return { success: false, message: "Student has no outstanding balance." };
  }

  try {
    const guardianName = student.guardianName || 'Guardian';
    const schoolName = 'FeeFlow School'; // You can make this configurable
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(); // 7 days from now
     
    const message = `Dear ${guardianName}, a friendly reminder from ${schoolName} that the outstanding fee balance for ${student.studentName} is GHS ${student.balance.toFixed(2)}. Payment is due by ${dueDate}. Thank you.`;

    // Import the centralized sendSms function
    const { sendSms } = await import('./actions');
    
    const result = await sendSms(
      [{
        destination: student.guardianPhone,
        message: message,
        msgid: `reminder-${student.id}-${Date.now()}`,
      }],
      SENDER_ID
    );

    if (result.success) {
      return { success: true, message: `Reminder sent to ${student.guardianName} (${student.guardianPhone}).` };
    } else {
      return { success: false, message: result.error || "Failed to send reminder SMS." };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error in sendFeeReminderSms:", error);
    return { success: false, message: errorMessage };
  }
}
