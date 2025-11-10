
"use server";

import { v4 as uuid } from 'uuid';

const FROG_API_BASE_URL = "https://frogapi.wigal.com.gh/api/v3";
const SENDER_ID = "FeeFlow";

// Debug: Check environment variables at module load time
console.log('=== Module Load Debug ===');
console.log('process.env.FROG_API_KEY:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
console.log('process.env.FROG_USERNAME:', process.env.FROG_USERNAME ? 'Set' : 'Not set');

// Remove fallback values - environment variables must be set
const API_KEY = process.env.FROG_API_KEY;
const USERNAME = process.env.FROG_USERNAME;

console.log('Final API_KEY length:', API_KEY?.length || 'Not set');
console.log('Final USERNAME:', USERNAME || 'Not set');

export async function generateOtp(phone: string): Promise<{ success: boolean; message: string }> {
  console.log(`Generating OTP for ${phone}`);
  
  // Force reload environment variables at runtime
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    console.log('dotenv config failed:', e);
  }
  
  // Use environment variables directly at runtime to avoid caching issues
  const rawApiKey = process.env.FROG_API_KEY;
  const username = process.env.FROG_USERNAME;
  
  // Clean the API key by removing quotes and backslashes
  const apiKey = rawApiKey?.replace(/^["']|["']$/g, '').replace(/\\/g, '');
  
  if (!apiKey || !username) {
    console.error('Missing API credentials in generateOtp');
    return { success: false, message: "API credentials not configured." };
  }
  
  console.log('=== generateOtp Debug ===');
  console.log('process.env.FROG_API_KEY:', process.env.FROG_API_KEY ? 'Set' : 'Not set');
  console.log('process.env.FROG_USERNAME:', process.env.FROG_USERNAME ? 'Set' : 'Not set');
  console.log('Using API_KEY length:', apiKey.length);
  console.log('Using API_KEY starts with:', apiKey.substring(0, 10));
  console.log('Using USERNAME:', username);
  console.log('Using SENDER_ID:', SENDER_ID);
  
  // Add request details for debugging
  const requestBody = {
    number: phone,
    expiry: 5,
    length: 6,
    messagetemplate: `Your ${SENDER_ID} verification code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
    type: "NUMERIC",
    senderid: SENDER_ID,
  };
  
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    console.log('Making API call to:', `${FROG_API_BASE_URL}/sms/otp/generate`);
    console.log('Headers:', { "API-KEY": apiKey?.substring(0, 10) + '...', "USERNAME": username });
    
    if (!apiKey || !username) {
      console.error('Missing API credentials');
      return { success: false, message: "API credentials not configured." };
    }
    
    // Use type assertion to ensure TypeScript knows these are strings
    const authHeaders = {
      "Content-Type": "application/json",
      "API-KEY": apiKey as string,
      "USERNAME": username as string,
    };
    
    const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/generate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);

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

  // Force reload environment variables at runtime
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    console.log('dotenv config failed:', e);
  }
  
  // Use environment variables directly at runtime
  const rawApiKey = process.env.FROG_API_KEY;
  const username = process.env.FROG_USERNAME;
  
  // Clean the API key by removing quotes and backslashes
  const apiKey = rawApiKey?.replace(/^["']|["']$/g, '').replace(/\\/g, '');
  
  if (!apiKey || !username) {
    console.error('Missing API credentials in verifyOtp');
    return { success: false, message: "API credentials not configured." };
  }

  try {
    if (!apiKey || !username) {
      console.error('Missing API credentials');
      return { success: false, message: "API credentials not configured." };
    }
    
    // Use type assertion to ensure TypeScript knows these are strings
    const authHeaders = {
      "Content-Type": "application/json",
      "API-KEY": apiKey as string,
      "USERNAME": username as string,
    };
    
    const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/verify`, {
        method: "POST",
        headers: authHeaders,
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
    // Force reload environment variables at runtime
    try {
      require('dotenv').config({ path: '.env.local' });
    } catch (e) {
      console.log('dotenv config failed:', e);
    }
    
    // Use environment variables directly at runtime
    const rawApiKey = process.env.FROG_API_KEY;
    const username = process.env.FROG_USERNAME;
    
    // Clean the API key by removing quotes and backslashes
    const apiKey = rawApiKey?.replace(/^["']|["']$/g, '').replace(/\\/g, '');
    
    if (!apiKey || !username) {
      console.error('Missing API credentials in generateActivationCode');
      return { status: 'FAILED', message: 'API credentials not configured.' };
    }

    try {
      if (!apiKey || !username) {
        console.error('Missing API credentials');
        return { status: 'FAILED', message: 'API credentials not configured.' };
      }
      
      // Use type assertion to ensure TypeScript knows these are strings
      const authHeaders = {
        'Content-Type': 'application/json',
        "API-KEY": apiKey as string,
        "USERNAME": username as string,
      };
      
      const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/generate`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          number: phone,
          expiry: 20, // Longer expiry for activation
          length: 8, // 8-digit code for higher security
          messagetemplate: `Your ${SENDER_ID} confirmation code is: %OTPCODE%. It expires in %EXPIRY% minutes.`,
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
   
  // Force reload environment variables at runtime
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (e) {
    console.log('dotenv config failed:', e);
  }
  
  // Use environment variables directly at runtime
  const apiKey = process.env.FROG_API_KEY;
  const username = process.env.FROG_USERNAME;
  
  if (!apiKey || !username) {
    console.error('Missing API credentials in generateAdminActivationCode');
    return { success: false, message: "API credentials not configured." };
  }
   
  const messageTemplate = `${guardianPhone} Your confirmation code for FeeFlow is: %OTPCODE%. It expires in %EXPIRY% minutes. reff. ${studentName} - ${className} (GHS ${totalAmount.toFixed(2)})`;

  try {
    if (!apiKey || !username) {
      console.error('Missing API credentials');
      return { success: false, message: "API credentials not configured." };
    }
    
    // Use type assertion to ensure TypeScript knows these are strings
    const authHeaders = {
      "Content-Type": "application/json",
      "API-KEY": apiKey as string,
      "USERNAME": username as string,
    };
    
    const response = await fetch(`${FROG_API_BASE_URL}/sms/otp/generate`, {
      method: "POST",
      headers: authHeaders,
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
      return { success: true, message: data.message || "An confirmation code has been sent to the admin." };
    } else {
      console.error("Failed to send detailed confirmation code:", data);
      return { success: false, message: data.message || "Failed to send detailed confirmation code." };
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
