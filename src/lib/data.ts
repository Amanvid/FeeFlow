

"use server";

import type { Student, SchoolConfig, PhoneClaim, InvoiceGenerationClaim, AdminUser, MobileUser, MobileUserLogin } from './definitions';
import fs from 'fs/promises';
import path from 'path';
import { PlaceHolderImages } from './placeholder-images.js';

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';
const CLAIMS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'claims.json');

// Enable verbose logging for Vercel deployment
const VERBOSE_LOGGING = process.env.VERCEL || process.env.NODE_ENV === 'development';

// Helper function to ensure the claims file exists and read its content
async function readClaimsFile(): Promise<PhoneClaim[]> {
  try {
    // Check if file exists, if not, create it with an empty array.
    await fs.access(CLAIMS_FILE_PATH);
  } catch (error) {
    await fs.writeFile(CLAIMS_FILE_PATH, JSON.stringify([], null, 2));
    return [];
  }

  const fileContent = await fs.readFile(CLAIMS_FILE_PATH, 'utf-8');
  if (fileContent) {
    try {
      return JSON.parse(fileContent);
    } catch (e) {
      console.error("Error parsing claims.json, returning empty array", e);
      return [];
    }
  }
  return [];
}


// Helper function to parse CSV text into an array of objects
function csvToObjects(csv: string): any[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const objects = [];

  for (let i = 1; i < lines.length; i++) {
    const obj: { [key: string]: string } = {};
    // Split by comma only if it's not enclosed in quotes
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j];
      let value = (currentline[j] || '').trim();
      // Remove quotes from start and end if they exist
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      obj[header] = value;
    }
    objects.push(obj);
  }
  return objects;
}


// SMS Template Cache
let smsTemplatesCache: { templates: any; timestamp: number } | null = null;
const SMS_TEMPLATES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface SmsTemplates {
  feeReminderTemplate: string;
  adminActivationTemplate: string;
  otpTemplate: string;
  activationTemplate: string;
  paymentNotificationTemplate: string;
  admissionNotificationTemplate: string;
}

async function getSenderIdFromTemplateSheet(): Promise<string> {
    const defaultSenderId = 'CHARIOT EDU';
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (VERBOSE_LOGGING) {
                console.log(`Fetching Sender ID from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            }
            
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Template`;
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, { 
                next: { revalidate: 60 },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (VERBOSE_LOGGING) {
                console.log(`Google Sheets response status: ${response.status}`);
            }
            
            if (!response.ok) {
                console.warn(`Could not fetch Template sheet, using default Sender ID. Status: ${response.statusText}`);
                return defaultSenderId;
            }
            const csvText = await response.text();
            const templateData = csvToObjects(csvText);

            if (VERBOSE_LOGGING) {
                console.log(`Template sheet data rows: ${templateData.length}`);
            }

            // Assuming the Sender ID is in the first row of the "Sender ID" column
            if (templateData.length > 0 && templateData[0]['Sender ID']) {
                const senderId = templateData[0]['Sender ID'];
                if (VERBOSE_LOGGING) {
                    console.log(`Found Sender ID: ${senderId}`);
                }
                return senderId;
            }
            
            console.warn("Sender ID not found in Template sheet, using default.");
            return defaultSenderId;
            
        } catch (error) {
            console.error(`Error fetching Sender ID from Template sheet (attempt ${attempt}/${maxRetries}):`, error);
            
            if (attempt === maxRetries) {
                console.error("Max retries reached, using default Sender ID");
                return defaultSenderId;
            }
            
            // Wait before retry (exponential backoff)
            const waitTime = attempt * 2000; // 2s, 4s, 6s
            console.log(`Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    return defaultSenderId;
}

export async function getSmsTemplatesFromSheet(): Promise<SmsTemplates> {
  const now = Date.now();
  
  // Check if we have valid cached templates
  if (smsTemplatesCache && (now - smsTemplatesCache.timestamp) < SMS_TEMPLATES_CACHE_DURATION) {
    if (VERBOSE_LOGGING) {
      console.log('Using cached SMS templates');
    }
    return smsTemplatesCache.templates;
  }
  
  const maxRetries = 3;
  const timeoutMs = 30000; // 30 seconds timeout
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (VERBOSE_LOGGING) {
        console.log(`Fetching SMS templates from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
      }
      
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Template`;
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, { 
        next: { revalidate: 60 },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (VERBOSE_LOGGING) {
        console.log(`Google Sheets response status: ${response.status}`);
      }
      
      if (!response.ok) {
        console.warn(`Could not fetch Template sheet for SMS templates. Status: ${response.statusText}`);
        return getDefaultSmsTemplates();
      }
      
      const csvText = await response.text();
      const templateData = csvToObjects(csvText);

      if (VERBOSE_LOGGING) {
        console.log(`Template sheet data rows: ${templateData.length}`);
      }

      // Parse templates from the first row
      if (templateData.length > 0) {
        const templates: SmsTemplates = {
          feeReminderTemplate: templateData[0]['Fee Reminder Template'] || getDefaultSmsTemplates().feeReminderTemplate,
          adminActivationTemplate: templateData[0]['Admin Activation Template'] || getDefaultSmsTemplates().adminActivationTemplate,
          otpTemplate: templateData[0]['OTP Template'] || getDefaultSmsTemplates().otpTemplate,
          activationTemplate: templateData[0]['Activation Template'] || getDefaultSmsTemplates().activationTemplate,
          paymentNotificationTemplate: templateData[0]['Payment Notification Template'] || getDefaultSmsTemplates().paymentNotificationTemplate,
          admissionNotificationTemplate: templateData[0]['Admission Notification Template'] || getDefaultSmsTemplates().admissionNotificationTemplate,
        };
        
        // Cache the templates
        smsTemplatesCache = {
          templates,
          timestamp: now
        };
        
        if (VERBOSE_LOGGING) {
          console.log('Successfully fetched and cached SMS templates');
        }
        
        return templates;
      }
      
      console.warn("No template data found in Template sheet, using defaults.");
      return getDefaultSmsTemplates();
      
    } catch (error) {
      console.error(`Error fetching SMS templates from Template sheet (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        console.error("Max retries reached, using default SMS templates");
        return getDefaultSmsTemplates();
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = attempt * 2000; // 2s, 4s, 6s
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return getDefaultSmsTemplates();
}

function getDefaultSmsTemplates(): SmsTemplates {
  return {
    feeReminderTemplate: "Dear {guardianName}, a friendly reminder from {schoolName} that the outstanding fee balance for {studentName} is GHS {balance}. Payment is due by {dueDate}. Thank you.",
    adminActivationTemplate: "{guardianPhone} Your confirmation code for FeeFlow is: {otpCode}. It expires in {expiry} minutes. reff. {studentName} - {className} (GHS {totalAmount})",
    otpTemplate: "Your {senderId} verification code is: {otpCode}. It expires in {expiry} minutes.",
    activationTemplate: "Your {senderId} activation code is: {otpCode}. It expires in {expiry} minutes.",
    paymentNotificationTemplate: "Dear {guardianName}, payment of GHS {amount} has been received for {studentName}. Outstanding balance: GHS {balance}. Thank you for choosing {schoolName}.",
    admissionNotificationTemplate: "Dear {guardianName}, {studentName} has been admitted to {schoolName} for {className}. Please complete registration by {dueDate}. Welcome to {schoolName}!"
  };
}

// Function to clear SMS templates cache (useful for testing or manual refresh)
// Made async to avoid Next.js Server Action conflicts
export async function clearSmsTemplatesCache(): Promise<void> {
  smsTemplatesCache = null;
  if (VERBOSE_LOGGING) {
    console.log('SMS templates cache cleared');
  }
}


export async function getSchoolConfig(): Promise<SchoolConfig> {
  const maxRetries = 3;
  const timeoutMs = 30000; // 30 seconds timeout
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (VERBOSE_LOGGING) {
        console.log(`Fetching school config from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
      }
      
      const configUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Config`;
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const [configResponse, senderId] = await Promise.all([
        fetch(configUrl, { 
          next: { revalidate: 60 },
          signal: controller.signal
        }),
        getSenderIdFromTemplateSheet()
      ]);
      
      clearTimeout(timeoutId);

      if (!configResponse.ok) {
        throw new Error(`Failed to fetch config sheet: ${configResponse.statusText}`);
      }
      const csvText = await configResponse.text();
      const configData = csvToObjects(csvText);
      
      if (configData.length === 0) {
        throw new Error("Config sheet is empty or has no data rows.");
      }
      
      const configRow = configData[0];
      if (!configRow) {
        throw new Error("Could not find a valid config row in the 'Config' sheet.");
      }
      
      const logo = PlaceHolderImages.find(img => img.id === 'school-logo');

      const config = {
          schoolName: configRow['School Name'] || 'Chariot Educational Complex',
          address: configRow['Address'] || 'P.O.Box TA Old-Tafo',
          momoNumber: configRow['Momo number'] || '',
          dueDate: configRow['Due Date'] || '',
          invoicePrefix: configRow['Invoice number'] || 'CEC-INV',
          senderId: senderId, // Use senderId from Template sheet
          logoUrl: logo?.imageUrl || '',
          notifications: {
            smsEnabled: configRow['SMS Enabled']?.toLowerCase() === 'true' || true,
            feeRemindersEnabled: configRow['Fee Reminders Enabled']?.toLowerCase() === 'true' || true,
            paymentNotificationsEnabled: configRow['Payment Notifications Enabled']?.toLowerCase() === 'true' || true,
            admissionNotificationsEnabled: configRow['Admission Notifications Enabled']?.toLowerCase() === 'true' || false,
          },
      };
      
      if (VERBOSE_LOGGING) {
        console.log(`Successfully fetched school config: ${config.schoolName}`);
      }
      
      return config;
      
    } catch (error) {
      console.error(`Error fetching school config from Google Sheet (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        console.error("Max retries reached, using default config");
        const logo = PlaceHolderImages.find(img => img.id === 'school-logo');
        // Return a default/error state
        return {
            schoolName: "Chariot Educational Complex",
            address: "P.O.Box TA Old-Tafo",
            momoNumber: "23356282694 - David Amankwaah",
            dueDate: "30/10/2025",
            invoicePrefix: "CEC-INV",
            senderId: "CHARIOT EDU", // Fallback senderId
            logoUrl: logo?.imageUrl || "",
            notifications: {
              smsEnabled: true,
              feeRemindersEnabled: true,
              paymentNotificationsEnabled: true,
              admissionNotificationsEnabled: false,
            },
        };
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = attempt * 2000; // 2s, 4s, 6s
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // Fallback config (should never reach here due to maxRetries logic above)
  const logo = PlaceHolderImages.find(img => img.id === 'school-logo');
  return {
      schoolName: "Chariot Educational Complex",
      address: "P.O.Box TA Old-Tafo",
      momoNumber: "23356282694 - David Amankwaah",
      dueDate: "30/10/2025",
      invoicePrefix: "CEC-INV",
      senderId: "CHARIOT EDU",
      logoUrl: logo?.imageUrl || "",
      notifications: {
        smsEnabled: true,
        feeRemindersEnabled: true,
        paymentNotificationsEnabled: true,
        admissionNotificationsEnabled: false,
      },
  };
}

// Helper function to safely parse a currency string to a float
const parseCurrency = (value: string | undefined): number => {
    if (!value) return 0;
    const cleanedValue = value.replace(/[^0-9.-]+/g, "");
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? 0 : number;
};


export async function getAllStudents(): Promise<Student[]> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (VERBOSE_LOGGING) {
                console.log(`Fetching students from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            }
            
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Metadata`;
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, { 
                next: { revalidate: 60 },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (VERBOSE_LOGGING) {
                console.log(`Students sheet response status: ${response.status}`);
            }
            
             if (!response.ok) {
                throw new Error(`Failed to fetch students sheet: ${response.statusText}`);
            }
            const csvText = await response.text();
            const studentData = csvToObjects(csvText);
            
            if (VERBOSE_LOGGING) {
                console.log(`Students sheet data rows: ${studentData.length}`);
            }

            if (studentData.length === 0) return [];
            
            const students = studentData.map((s, index) => {
                // Use 'Total Balance' from the sheet as the source of truth for the balance.
                const balance = parseCurrency(s['Total Balance']);
                
                // Fee components
                const arrears = parseCurrency(s['ARREAS']);
                const books = parseCurrency(s['BOOKS Fees']);
                const fees = parseCurrency(s['School Fees AMOUNT']);
                
                // Payment components
                const initialAmountPaid = parseCurrency(s['INTIAL AMOUNT PAID']);
                const payment = parseCurrency(s['PAYMENT']);
                const booksFeePayment = parseCurrency(s['BOOKS Fees Payment']);
                
                const schoolFeesPaid = initialAmountPaid + payment;
                const totalPaid = schoolFeesPaid + booksFeePayment;

                let gender: Student['gender'] = 'Other';
                const genderVal = s['GENDER']?.trim();
                if (genderVal === 'Male') {
                    gender = 'Male';
                } else if (genderVal === 'Female') {
                    gender = 'Female';
                }
                
                const student: Student = {
                    id: s['No.'] || `${index}`,
                    studentName: s['NAME'] || '',
                    class: s['GRADE'] || '',
                    studentType: s['Student Type'] || '',
                    balance: balance,
                    arrears: arrears,
                    books: books,
                    fees: fees,
                    amountPaid: totalPaid,
                    schoolFeesPaid: schoolFeesPaid,
                    booksFeePaid: booksFeePayment,
                    gender: gender,
                    guardianName: s['Parent Name'] || '',
                    guardianPhone: s['Contact'] || '',
                };
                return student;
            }).filter(s => s.studentName && s.class);

            return students;
            
        } catch(error) {
            console.error(`Error fetching students from Google Sheet (attempt ${attempt}/${maxRetries}):`, error);
            
            if (attempt === maxRetries) {
                console.error("Max retries reached, returning empty array");
                return [];
            }
            
            // Wait before retry (exponential backoff)
            const waitTime = attempt * 2000; // 2s, 4s, 6s
            console.log(`Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    return [];
}

export async function getMobileUsers(): Promise<MobileUser[]> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (VERBOSE_LOGGING) {
                console.log(`Fetching mobile users from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            }
            
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=MobileUsers`;
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, { 
                next: { revalidate: 60 },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.warn(`Could not fetch MobileUsers sheet. Status: ${response.statusText}`);
                return [];
            }
            const csvText = await response.text();
            const mobileUserData = csvToObjects(csvText);

            if (mobileUserData.length === 0) return [];
            
            const mobileUsers: MobileUser[] = mobileUserData.map(user => ({
                id: user['ID'] || '',
                name: user['Name'] || '',
                dateOfBirth: user['DateOfBirth'] || '',
                address: user['Address'] || '',
                residence: user['Residence'] || '',
                childName: user['ChildName'] || '',
                childClass: user['ChildClass'] || '',
                registrationDate: user['RegistrationDate'] || '',
                contact: user['Contact'] || '',
                email: user['Email'] || '',
                username: user['Username'] || '',
                password: user['Password'] || '',
                profilePicture: user['ProfilePicture'] || '',
                childPicture: user['ChildPicture'] || '',
                role: (user['Role'] as 'parent' | 'guardian') || 'parent',
                isActive: user['IsActive']?.toLowerCase() === 'true',
                createdAt: user['CreatedAt'] || '',
                updatedAt: user['UpdatedAt'] || '',
            })).filter(user => user.username);

            if (VERBOSE_LOGGING) {
                console.log(`Successfully fetched ${mobileUsers.length} mobile users`);
            }
            
            return mobileUsers;
            
        } catch(error) {
            console.error(`Error fetching mobile users from Google Sheet (attempt ${attempt}/${maxRetries}):`, error);
            
            if (attempt === maxRetries) {
                console.error("Max retries reached, returning empty mobile users array");
                return [];
            }
            
            // Wait before retry (exponential backoff)
            const waitTime = attempt * 2000; // 2s, 4s, 6s
            console.log(`Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    return [];
}

export async function validateMobileUserLogin(loginData: MobileUserLogin): Promise<MobileUser | null> {
    try {
        const mobileUsers = await getMobileUsers();
        
        // Find user by username, phone, or email
        const user = mobileUsers.find(u => 
            u.isActive && (
                u.username === loginData.username ||
                u.contact === loginData.username ||
                u.email === loginData.username
            ) && u.password === loginData.password
        );
        
        return user || null;
    } catch (error) {
        console.error('Error validating mobile user login:', error);
        return null;
    }
}

export async function registerMobileUser(userData: Omit<MobileUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; user?: MobileUser; error?: string }> {
    try {
        // Validate required fields
        if (!userData.name || !userData.contact || !userData.username || !userData.password) {
            return { success: false, error: 'Missing required fields' };
        }
        
        // Check if username already exists
        const existingUsers = await getMobileUsers();
        const usernameExists = existingUsers.some(u => u.username === userData.username);
        if (usernameExists) {
            return { success: false, error: 'Username already exists' };
        }
        
        // Check if contact already exists
        const contactExists = existingUsers.some(u => u.contact === userData.contact);
        if (contactExists) {
            return { success: false, error: 'Contact number already registered' };
        }
        
        // Generate unique ID
        const id = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        
        const newUser: MobileUser = {
            ...userData,
            id,
            createdAt: now,
            updatedAt: now,
            isActive: true
        };
        
        // Add user to Google Sheets via GoogleSheetsService
        const { GoogleSheetsService } = await import('./google-sheets');
        const googleSheetsService = new GoogleSheetsService();
        
        const rowData = [
            newUser.id,
            newUser.name,
            newUser.dateOfBirth,
            newUser.address,
            newUser.residence,
            newUser.childName,
            newUser.childClass,
            newUser.registrationDate,
            newUser.contact,
            newUser.email,
            newUser.username,
            newUser.password,
            newUser.profilePicture || '',
            newUser.childPicture || '',
            newUser.role,
            newUser.isActive.toString(),
            newUser.createdAt,
            newUser.updatedAt
        ];
        
        const result = await googleSheetsService.appendToSheet('MobileUsers', [rowData]);
        
        if (result.success) {
            console.log(`✅ Mobile user registered successfully: ${newUser.username}`);
            return { success: true, user: newUser };
        } else {
            console.error('❌ Failed to register mobile user in Google Sheets:', result.message);
            return { success: false, error: 'Failed to save user data' };
        }
        
    } catch (error) {
        console.error('❌ Error registering mobile user:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
}


export async function getClasses(): Promise<string[]> {
  const students = await getAllStudents();
  if (!students || students.length === 0) {
    console.log("No students found, returning empty class list.");
    return [];
  }
  const classes = [...new Set(students.map(s => s.class))];
  return classes.filter(c => c);
}

export async function getStudentsByClass(className: string): Promise<Student[]> {
  const allStudents = await getAllStudents();
  const filteredStudents = allStudents.filter(s => s.class === className);
  return filteredStudents;
}

export async function getStudentById(studentId: string): Promise<Student | undefined> {
  const allStudents = await getAllStudents();
  const student = allStudents.find(s => s.id === studentId);
  return student;
}

export async function saveClaim(data: Omit<PhoneClaim, 'timestamp'>): Promise<{ success: boolean; message?: string }> {
  const claim: PhoneClaim = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check if running on Vercel
    if (process.env.VERCEL) {
      // On Vercel, only save to Google Sheets (skip local file operations)
      const { GoogleSheetsService } = await import('./google-sheets');
      const googleSheetsService = new GoogleSheetsService();
      const sheetResult = await googleSheetsService.saveInvoiceToSheet(claim);
      
      if (!sheetResult.success) {
        console.error("Failed to save claim to Google Sheets:", sheetResult.message);
        return { success: false, message: `Failed to save claim to Google Sheets: ${sheetResult.message}` };
      } else {
        console.log("Successfully saved claim to Google Sheets:", claim);
        return { success: true };
      }
    } else {
      // Not on Vercel - save to local JSON file and Google Sheets
      const claims = await readClaimsFile();
      claims.push(claim);
      await fs.writeFile(CLAIMS_FILE_PATH, JSON.stringify(claims, null, 2));

      // Also save to Google Sheets (new functionality)
      const { GoogleSheetsService } = await import('./google-sheets');
      const googleSheetsService = new GoogleSheetsService();
      const sheetResult = await googleSheetsService.saveInvoiceToSheet(claim);
      
      if (!sheetResult.success) {
        console.error("Failed to save claim to Google Sheets:", sheetResult.message);
        // Don't fail the entire operation if Google Sheets fails, just log it
        // The local save is still successful
      } else {
        console.log("Successfully saved claim to Google Sheets:", claim);
      }

      console.log("Successfully saved claim to claims.json:", claim);
      return { success: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error saving claim:", errorMessage, error);
    return { success: false, message: `Could not save claim data. Reason: ${errorMessage}` };
  }
}

export async function deleteClaim(invoiceNumber: string): Promise<{ success: boolean; message?: string }> {
  // Check if running on Vercel - if so, skip local file operations
  if (process.env.VERCEL) {
    console.log(`Skipping local delete for invoice ${invoiceNumber} on Vercel platform - Google Sheets data should be managed directly`);
    return { 
      success: false, 
      message: "Delete operation not supported on Vercel platform. Please manage claims directly in Google Sheets." 
    };
  }

  try {
    const claims = await readClaimsFile();
    const updatedClaims = claims.filter(claim => claim.invoiceNumber !== invoiceNumber);

    if (claims.length === updatedClaims.length) {
      return { success: false, message: "Claim with that invoice number not found." };
    }

    await fs.writeFile(CLAIMS_FILE_PATH, JSON.stringify(updatedClaims, null, 2));
    
    console.log(`Successfully deleted claim with invoice number: ${invoiceNumber}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting claim from claims.json:", errorMessage, error);
    return { success: false, message: `Could not delete claim data. Reason: ${errorMessage}` };
  }
}

export async function deleteMultipleClaims(invoiceNumbers: string[]): Promise<{ success: boolean; message?: string }> {
  // Check if running on Vercel - if so, skip local file operations
  if (process.env.VERCEL) {
    console.log(`Skipping local multiple delete for ${invoiceNumbers.length} invoices on Vercel platform - Google Sheets data should be managed directly`);
    return { 
      success: false, 
      message: "Delete operation not supported on Vercel platform. Please manage claims directly in Google Sheets." 
    };
  }

  try {
    let claims = await readClaimsFile();
    const initialLength = claims.length;
    claims = claims.filter(claim => !invoiceNumbers.includes(claim.invoiceNumber));

    if (claims.length === initialLength) {
      return { success: false, message: "No matching claims found to delete." };
    }

    await fs.writeFile(CLAIMS_FILE_PATH, JSON.stringify(claims, null, 2));
    
    console.log(`Successfully deleted ${initialLength - claims.length} claims.`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting multiple claims from claims.json:", errorMessage, error);
    return { success: false, message: `Could not delete claims. Reason: ${errorMessage}` };
  }
}

export async function getClaimsForInvoiceGeneration(): Promise<InvoiceGenerationClaim[]> {
  try {
    const claims = await readClaimsFile();
    // Sort claims by timestamp to get the latest ones for invoice number generation
    const sortedClaims = claims.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return sortedClaims.map(c => ({ invoiceNumber: c.invoiceNumber })).filter(c => c.invoiceNumber);
  } catch (error) {
    console.error("Error fetching claims from claims.json:", error);
    return [];
  }
}

export async function getAllClaims(): Promise<PhoneClaim[]> {
    // Check if running on Vercel - if so, read from Google Sheets instead of claims.json
    if (process.env.VERCEL) {
        try {
            const { GoogleSheetsService } = await import('./google-sheets');
            const googleSheetsService = new GoogleSheetsService();
            const result = await googleSheetsService.getSheetData('Claims');
            
            if (!result.success || !result.data || result.data.length <= 1) {
                // No data or only header row
                return [];
            }

            // Convert Google Sheets data to PhoneClaim format
            // Assuming headers: Invoice Number, Guardian Name, Guardian Phone, Relationship, Student Name, Class, Total Fees Balance, Due Date, Timestamp, Paid, Payment Date, Payment Reference
            const rows = result.data;
            const claims: PhoneClaim[] = [];

            // Skip header row (index 0)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length < 9) continue; // Skip incomplete rows

                const claim: PhoneClaim = {
                    invoiceNumber: row[0] || '',
                    guardianName: row[1] || '',
                    guardianPhone: row[2] || '',
                    relationship: row[3] || '',
                    studentName: row[4] || '',
                    class: row[5] || '',
                    totalFeesBalance: parseFloat(row[6]) || 0,
                    dueDate: row[7] || '',
                    timestamp: row[8] || new Date().toISOString(),
                };

                // Only include claims with valid invoice numbers
                if (claim.invoiceNumber && claim.invoiceNumber !== 'Invoice Number') {
                    claims.push(claim);
                }
            }

            // Sort by timestamp descending so newest claims are first
            return claims.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
        } catch (error) {
            console.error("Error fetching claims from Google Sheets:", error);
            return [];
        }
    }

    // Not on Vercel - use local claims.json file
    try {
        const claims = await readClaimsFile();
        // Sort by timestamp descending so newest claims are first
        return claims.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        console.error("Error fetching all claims from claims.json:", error);
        return [];
    }
}

export async function syncClaimsData(): Promise<{ success: boolean; message: string; claimsCount: number }> {
  try {
    console.log('🔄 Syncing claims data between Google Sheets and claims.json...');
    
    // Read current Google Sheets data
    const { GoogleSheetsService } = await import('./google-sheets');
    const googleSheetsService = new GoogleSheetsService();
    const sheetResult = await googleSheetsService.getSheetData('Claims');
    
    if (!sheetResult.success) {
      return { success: false, message: `Failed to read Google Sheets: ${sheetResult.message}`, claimsCount: 0 };
    }
    
    const sheetData = sheetResult.data;
    const headers = sheetData[0];
    
    // Convert sheet data to claims (skip header row)
    const sheetClaims = sheetData.slice(1).map((row: string[]) => {
      const claim: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
        claim[header] = row[index] || '';
      });
      return claim;
    });
    
    // Normalize Google Sheets claims to match claims.json format
    const normalizedSheetClaims = sheetClaims.map((sheetClaim: Record<string, string>) => ({
      invoiceNumber: sheetClaim['Invoice Number'],
      guardianName: sheetClaim['Guardian Name'],
      guardianPhone: sheetClaim['Guardian Phone'],
      relationship: sheetClaim['Relationship'],
      studentName: sheetClaim['Student Name'],
      class: sheetClaim['Class'],
      totalFeesBalance: parseFloat(sheetClaim['Total Fees Balance']) || 0,
      dueDate: sheetClaim['Due Date'],
      timestamp: sheetClaim['Timestamp'],
      paid: sheetClaim['Paid'] === 'TRUE',
      paymentDate: sheetClaim['Payment Date'] || null,
      paymentReference: sheetClaim['Payment Reference'] || null
    }));
    
    // Remove duplicates based on invoiceNumber
    const uniqueSheetClaims = normalizedSheetClaims.filter((claim: any, index: number, self: any[]) =>
      index === self.findIndex((c) => c.invoiceNumber === claim.invoiceNumber)
    );
    
    // Read current claims.json data
    const claimsJson = await readClaimsFile();
    
    // Merge data - prioritize Google Sheets data but include any missing from claims.json
    const mergedClaims = [...uniqueSheetClaims];
    
    // Add any claims from claims.json that aren't in Google Sheets
    claimsJson.forEach(jsonClaim => {
      const existsInSheets = mergedClaims.some(sheetClaim => 
        sheetClaim.invoiceNumber === jsonClaim.invoiceNumber
      );
      
      if (!existsInSheets) {
        mergedClaims.push(jsonClaim);
      }
    });
    
    // Sort by timestamp (newest first)
    mergedClaims.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });
    
    // Update claims.json
    await fs.writeFile(CLAIMS_FILE_PATH, JSON.stringify(mergedClaims, null, 2));
    
    // Update Google Sheets if not on Vercel (to avoid circular operations)
    if (!process.env.VERCEL) {
      // Prepare data for Google Sheets (convert back to array format)
      const updatedSheetData = [headers]; // Keep headers
      
      mergedClaims.forEach(claim => {
        const row = [
          claim.invoiceNumber,
          claim.guardianName,
          claim.guardianPhone,
          claim.relationship,
          claim.studentName,
          claim.class,
          claim.totalFeesBalance.toString(),
          claim.dueDate,
          claim.timestamp,
          claim.paid ? 'TRUE' : 'FALSE',
          claim.paymentDate || '',
          claim.paymentReference || ''
        ];
        updatedSheetData.push(row);
      });
      
      // Clear existing data and write new data
      await googleSheetsService.clearSheet('Claims');
      const result = await googleSheetsService.appendToSheet('Claims', updatedSheetData);
      
      if (!result.success) {
        console.warn('⚠️  Failed to update Google Sheets:', result.message);
      }
    }
    
    console.log(`✅ Claims data synchronized successfully. Total claims: ${mergedClaims.length}`);
    return { 
      success: true, 
      message: 'Claims data synchronized successfully', 
      claimsCount: mergedClaims.length 
    };
    
  } catch (error) {
    console.error('❌ Error syncing claims data:', error);
    return {
      success: false,
      message: `Error syncing claims data: ${error instanceof Error ? error.message : String(error)}`,
      claimsCount: 0,
    };
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (VERBOSE_LOGGING) {
                console.log(`Fetching admin users from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            }
            
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Admin`;
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, { 
                next: { revalidate: 60 },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch Admin sheet: ${response.statusText}`);
            }
            const csvText = await response.text();
            const adminData = csvToObjects(csvText);

            if (adminData.length === 0) return [];
            
            const admins: AdminUser[] = adminData.map(a => ({
                username: a['Username'] || '',
                password: a['Password'] || '',
                role: a['Role'] || '',
            })).filter(a => a.username);

            if (VERBOSE_LOGGING) {
                console.log(`Successfully fetched ${admins.length} admin users`);
            }
            
            return admins;
            
        } catch(error) {
            console.error(`Error fetching admins from Google Sheet (attempt ${attempt}/${maxRetries}):`, error);
            
            if (attempt === maxRetries) {
                console.error("Max retries reached, returning empty admin array");
                return [];
            }
            
            // Wait before retry (exponential backoff)
            const waitTime = attempt * 2000; // 2s, 4s, 6s
            console.log(`Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    
    return [];
}

/**
 * Get total students count with dynamic updates handling
 * This function always checks the current state of the Google Sheets
 */
export async function getTotalStudentsCount(): Promise<number> {
    try {
        const { GoogleSheetsService } = await import('./google-sheets');
        const googleSheetsService = new GoogleSheetsService();
        
        const result = await googleSheetsService.getTotalStudentsCount();
        
        if (result.success) {
            if (VERBOSE_LOGGING) {
                console.log(`Total students count: ${result.count} - ${result.message}`);
            }
            return result.count;
        } else {
            console.error('Failed to get total students count:', result.message);
            
            // Fallback: try to count from Metadata sheet directly
            try {
                const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Metadata`;
                const response = await fetch(url, { next: { revalidate: 60 } });
                
                if (!response.ok) {
                    console.warn('Could not fetch Metadata sheet for fallback count');
                    return 0;
                }
                
                const csvText = await response.text();
                const lines = csvText.trim().split('\n');
                
                if (lines.length <= 1) {
                    return 0;
                }
                
                let validStudentCount = 0;
                
                // Skip header row, process data rows
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',');
                    if (row && row.length >= 2) {
                        const studentNumber = row[0]?.replace(/"/g, '').trim();
                        const studentName = row[1]?.replace(/"/g, '').trim();
                        
                        // Valid student row criteria
                        if (studentNumber && studentName && 
                            studentName !== '' && 
                            studentName !== '""' &&
                            !isNaN(parseInt(studentNumber)) &&
                            parseInt(studentNumber) > 0) {
                            validStudentCount++;
                        }
                    }
                }
                
                console.log(`Fallback student count from Metadata: ${validStudentCount}`);
                return validStudentCount;
                
            } catch (fallbackError) {
                console.error('Fallback student counting also failed:', fallbackError);
                return 0;
            }
        }
    } catch (error) {
        console.error('Error getting total students count:', error);
        return 0;
    }
}

    
