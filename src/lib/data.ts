

"use server";

import type { Student, SchoolConfig, PhoneClaim, InvoiceGenerationClaim, AdminUser, TeacherUser } from './definitions';
import { PlaceHolderImages } from './placeholder-images';

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';

// Enable verbose logging for Vercel deployment
const VERBOSE_LOGGING = process.env.VERCEL || process.env.NODE_ENV === 'development';




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
                
                // Create unique ID to avoid duplicates - use row number + student name hash
                const rowNumber = s['No.'] || (index + 1).toString();
                const nameHash = s['NAME'] ? s['NAME'].replace(/\s+/g, '').toLowerCase().substring(0, 10) : '';
                const uniqueId = `${rowNumber}-${nameHash || index}`;
                
                const student: Student = {
                    id: uniqueId,
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
                    guardianName: s['PARENT NAME'] || '',
                    guardianPhone: s['CONTACT'] || '',
                    guardianLocation: s['LOCATION'] || '',
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
    // Always save to Google Sheets exclusively
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error saving claim:", errorMessage, error);
    return { success: false, message: `Could not save claim data. Reason: ${errorMessage}` };
  }
}

export async function deleteClaim(invoiceNumber: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Always use Google Sheets exclusively for delete operations
    const { GoogleSheetsService } = await import('./google-sheets');
    const googleSheetsService = new GoogleSheetsService();
    
    // Get current claims data to find the row to delete
    const result = await googleSheetsService.getSheetData('Claims');
    if (!result.success) {
      return { success: false, message: `Failed to read claims data: ${result.message}` };
    }

    const rows = result.data;
    if (rows.length <= 1) { // Only header row or empty
      return { success: false, message: "No claims found to delete." };
    }

    // Find the row with matching invoice number (skip header row)
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === invoiceNumber) { // Invoice Number is in first column
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return { success: false, message: "Claim with that invoice number not found." };
    }

    // Delete the entire row from Google Sheets (add 1 for 1-based indexing)
    const deleteResult = await googleSheetsService.deleteRowFromSheet('Claims', rowIndex + 1);
    
    if (!deleteResult.success) {
      return { success: false, message: "Failed to delete claim from Google Sheets." };
    }

    console.log(`Successfully deleted claim with invoice number: ${invoiceNumber}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting claim from Google Sheets:", errorMessage, error);
    return { success: false, message: `Could not delete claim data. Reason: ${errorMessage}` };
  }
}

export async function deleteMultipleClaims(invoiceNumbers: string[]): Promise<{ success: boolean; message?: string }> {
  try {
    // Always use Google Sheets exclusively for delete operations
    const { GoogleSheetsService } = await import('./google-sheets');
    const googleSheetsService = new GoogleSheetsService();
    
    // Get current claims data to find rows to delete
    const result = await googleSheetsService.getSheetData('Claims');
    if (!result.success) {
      return { success: false, message: `Failed to read claims data: ${result.message}` };
    }

    const rows = result.data;
    if (rows.length <= 1) { // Only header row or empty
      return { success: false, message: "No claims found to delete." };
    }

    // Find all rows with matching invoice numbers (skip header row)
    const rowsToDelete: number[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (invoiceNumbers.includes(row[0])) { // Invoice Number is in first column
        rowsToDelete.push(i + 1); // Store 1-based row index
      }
    }

    if (rowsToDelete.length === 0) {
      return { success: false, message: "No matching claims found to delete." };
    }

    // Delete rows in reverse order to maintain correct indices
    rowsToDelete.sort((a, b) => b - a);
    
    for (const rowIndex of rowsToDelete) {
      const deleteResult = await googleSheetsService.deleteRowFromSheet('Claims', rowIndex);
      if (!deleteResult.success) {
        console.error(`Failed to delete row ${rowIndex} from Google Sheets`);
      }
    }

    console.log(`Successfully deleted ${rowsToDelete.length} claims`);
    return { success: true, message: `Successfully deleted ${rowsToDelete.length} claims` };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting multiple claims from Google Sheets:", errorMessage, error);
    return { success: false, message: `Could not delete claims data. Reason: ${errorMessage}` };
  }
}

export async function getClaimsForInvoiceGeneration(): Promise<InvoiceGenerationClaim[]> {
  try {
    // Always use Google Sheets exclusively for claims data
    const { GoogleSheetsService } = await import('./google-sheets');
    const googleSheetsService = new GoogleSheetsService();
    const result = await googleSheetsService.getSheetData('Claims');
    
    if (!result.success) {
      console.error('Failed to fetch claims from Google Sheets:', result.message);
      return [];
    }

    const rows = result.data;
    if (rows.length <= 1) return []; // Only header row or empty

    const claims: InvoiceGenerationClaim[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0] || row[0] === 'Invoice Number') continue; // Skip empty rows and header
      
      claims.push({ invoiceNumber: row[0] });
    }
    
    // Sort by timestamp to get the latest ones for invoice number generation
    return claims.filter(c => c.invoiceNumber);
  } catch (error) {
    console.error('Error fetching claims from Google Sheets:', error);
    return [];
  }
}

export async function getAllClaims(): Promise<PhoneClaim[]> {
  try {
    const { GoogleSheetsService } = await import('./google-sheets');
    const googleSheetsService = new GoogleSheetsService();
    const result = await googleSheetsService.getSheetData('Claims');
    
    if (!result.success || !result.data || result.data.length <= 1) {
      return [];
    }

    const rows = result.data;
    const claims: PhoneClaim[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 9) continue;

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

      if (claim.invoiceNumber && claim.invoiceNumber !== 'Invoice Number') {
        claims.push(claim);
      }
    }

    return claims.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Error fetching claims from Google Sheets:", error);
    return [];
  }
}



export async function getTeacherUsers(): Promise<TeacherUser[]> {
    const maxRetries = 3;
    const timeoutMs = 30000; // 30 seconds timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (VERBOSE_LOGGING) {
                console.log(`Fetching teachers from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            }
            
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Teachers`;
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, { 
                next: { revalidate: 60 },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch Teachers sheet: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            const teacherData = csvToObjects(csvText);

            if (teacherData.length === 0) return [];
            
            const teachers: TeacherUser[] = teacherData.map(t => ({
                name: t['Teacher Name'] || t['Name'] || '',
                class: t['Class'] || '',
                role: t['Role'] || '',
                status: t['Status'] || '',
                username: t['Username'] || '',
                password: t['Password'] || ''
            })).filter(t => t.username && t.password && t.status.toLowerCase() === 'active');

            if (VERBOSE_LOGGING) {
                console.log(`Successfully fetched ${teachers.length} active teachers`);
            }
            
            return teachers;
            
        } catch (error) {
            console.error(`Error fetching teachers from Google Sheet (attempt ${attempt}/${maxRetries}):`, error);
            
            if (attempt === maxRetries) {
                console.error("Max retries reached, returning empty teacher array");
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

    
