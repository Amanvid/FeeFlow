
"use server";

import { v4 as uuid } from 'uuid';
import { getSchoolConfig } from './data';
import type { Student } from './definitions';

const FROG_API_BASE_URL = "https://frogapi.wigal.com.gh/api/v3";
const OTP_SENDER_ID = "FeeFlow";

// Get credentials from environment variables
const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;

// Validate credentials are set
if (!API_KEY || !USERNAME) {
  console.error("Frog API credentials not configured. Please set FROG_API_KEY and FROG_USERNAME environment variables.");
}

export async function generateOtp(phone: string): Promise<{ success: boolean; message: string }> {
  console.log(`Generating OTP for ${phone}`);
  console.log(`API_KEY available: ${!!API_KEY}, length: ${API_KEY?.length}`);
  console.log(`USERNAME available: ${!!USERNAME}`);

  // Check if credentials are available
  if (!API_KEY || !USERNAME) {
    console.error(`Missing credentials - API_KEY: ${!!API_KEY}, USERNAME: ${!!USERNAME}`);
    return { success: false, message: "SMS service not configured. Please contact support." };
  }

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
        messagetemplate: `Your ${OTP_SENDER_ID} verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
        type: "NUMERIC",
        senderid: OTP_SENDER_ID,
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

interface AdminActivationCodeParams {
  adminPhone: string;
  guardianPhone: string;
  studentName: string;
  className: string;
  totalAmount: number;
}

export async function generateAdminActivationCode({ adminPhone, guardianPhone, studentName, className, totalAmount }: AdminActivationCodeParams): Promise<{ success: boolean; message: string }> {
  console.log(`Generating 8-digit activation code for admin ${adminPhone}`);
  
  // Check if credentials are available
  if (!API_KEY || !USERNAME) {
    return { success: false, message: "SMS service not configured. Please contact support." };
  }
  
  // Get SMS templates from Google Sheets
  const { getSmsTemplatesFromSheet } = await import('./data');
  const templates = await getSmsTemplatesFromSheet();
  
  // Use template and replace placeholders
  const messageTemplate = templates.adminActivationTemplate
    .replace(/{guardianPhone}/g, guardianPhone)
    .replace(/{studentName}/g, studentName)
    .replace(/{className}/g, className)
    .replace(/{totalAmount}/g, totalAmount.toFixed(2))
    // For OTP API, we need to keep the %OTPCODE% and %EXPIRY% placeholders
    .replace(/{otpCode}/g, '%OTPCODE%')
    .replace(/{expiry}/g, '%EXPIRY%');

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
        senderid: OTP_SENDER_ID,
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


export async function verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }>  {
  console.log(`Verifying OTP ${otp} for ${phone}`);

  // Check if credentials are available
  if (!API_KEY || !USERNAME) {
    return { success: false, message: "SMS service not configured. Please contact support." };
  }

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


type Destination = {
  destination: string;
  message: string;
  msgid: string;
  smstype?: "text" | "flash";
}

export async function sendSms(destinations: Destination[], senderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if credentials are available
    if (!API_KEY || !USERNAME) {
      return { success: false, error: "SMS service not configured. Please contact support." };
    }

    const schoolConfig = await getSchoolConfig();
    
    // Check if SMS notifications are enabled
    if (!schoolConfig.notifications?.smsEnabled) {
      return { success: false, error: "SMS notifications are disabled." };
    }
    
    const response = await fetch(`https://frogapi.wigal.com.gh/api/v3/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-KEY": API_KEY,
        "USERNAME": USERNAME,
      },
      body: JSON.stringify({
        senderid: senderId,
        destinations: destinations.map(d => ({ 
          destination: d.destination,
          message: d.message,
          msgid: d.msgid,
          smstype: d.smstype || "text"
        })),
      }),
    });
    
    const data = await response.json();
    
    // Log the full response for debugging
    console.log("SMS API Response:", JSON.stringify(data, null, 2));
    
    if (data.status === 'ACCEPTD') {
      console.log("SMS accepted for processing:", data.message);
      return { success: true };
    } else {
      console.error("SMS API Error:", data);
      return { success: false, error: data.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function sendFeeReminderSms(student: Student): Promise<{ success: boolean; message: string }> {
  try {
    const schoolConfig = await getSchoolConfig();

    // Check if SMS notifications are enabled
    if (!schoolConfig.notifications?.smsEnabled) {
      return { success: false, message: "SMS notifications are disabled." };
    }

    // Check if fee reminders are enabled
    if (!schoolConfig.notifications?.feeRemindersEnabled) {
      return { success: false, message: "Fee reminders are disabled." };
    }

    if (!student.guardianPhone) {
      return { success: false, message: "Guardian phone number is missing." };
    }
    if (student.balance <= 0) {
      return { success: false, message: "Student has no outstanding balance." };
    }

    // Validate and format phone number
    let formattedPhone = student.guardianPhone.trim();
    
    // Remove any spaces or special characters
    formattedPhone = formattedPhone.replace(/[\s\-\(\)\.]/g, '');
    
    // Handle Ghana phone numbers
    if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
      // Convert 024XXXXXXX to 23324XXXXXXX format
      formattedPhone = '233' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('+233')) {
      // Remove + sign if present
      formattedPhone = formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('233') && formattedPhone.length === 12) {
      // Already in correct format
      // Do nothing
    } else if (formattedPhone.length === 10 && /^[0-9]{10}$/.test(formattedPhone)) {
      // Assume it's a Ghana number without leading 0
      formattedPhone = '233' + formattedPhone;
    } else {
      console.warn(`Invalid phone number format: ${student.guardianPhone}`);
      return { success: false, message: "Invalid phone number format. Please use format like 024XXXXXXX or +23324XXXXXXX." };
    }

    const guardianName = student.guardianName || 'Guardian';
    
    // Get SMS templates from Google Sheets
    const { getSmsTemplatesFromSheet } = await import('./data');
    const templates = await getSmsTemplatesFromSheet();
    
    // Use template and replace placeholders
    const message = templates.feeReminderTemplate
      .replace(/{guardianName}/g, guardianName)
      .replace(/{schoolName}/g, schoolConfig.schoolName)
      .replace(/{studentName}/g, student.studentName)
      .replace(/{balance}/g, student.balance.toFixed(2))
      .replace(/{dueDate}/g, schoolConfig.dueDate);

    const result = await sendSms(
      [{
        destination: formattedPhone,
        message,
        msgid: `reminder-${student.id}-${uuid().slice(0, 4)}`,
      }],
      schoolConfig.senderId
    );

    if (result.success) {
      return { success: true, message: `Reminder sent to ${student.guardianName} (${student.guardianPhone}). SMS delivered to ${formattedPhone}.` };
    } else {
      return { success: false, message: result.error || "Failed to send reminder SMS." };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Error in sendFeeReminderSms:", error);
    return { success: false, message: errorMessage };
  }
}
