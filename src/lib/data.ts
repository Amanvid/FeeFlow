

"use server";

import type { Student, SchoolConfig, PhoneClaim, InvoiceGenerationClaim, AdminUser, TeacherUser, NonTeacherUser, SBARecord, SBASummary, TeacherUserWithPassword, AdminUserWithPassword } from './definitions';
import { PlaceHolderImages } from './placeholder-images';
import { GoogleSheetsService } from './google-sheets';

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';

// Enable verbose logging for Vercel deployment
const VERBOSE_LOGGING = process.env.VERCEL || process.env.NODE_ENV === 'development';




// Helper function to parse teacher CSV data (with headers)
function parseTeacherCsv(csv: string): any[] {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return [];

  const objects = [];
  
  // Skip the header row (first line) and process data rows
  for (let i = 1; i < lines.length; i++) {
    const obj: { [key: string]: string } = {};
    // Split by comma only if it's not enclosed in quotes
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 

    // Map actual column headers to expected field names
    obj['Name'] = (currentline[0] || '').replace(/"/g, '').trim();
    obj['Class'] = (currentline[1] || '').replace(/"/g, '').trim();
    obj['Role'] = (currentline[2] || '').replace(/"/g, '').trim(); // "Teacher" column maps to "Role"
    obj['Status'] = (currentline[3] || '').replace(/"/g, '').trim(); // "Active" column maps to "Status"
    obj['Username'] = (currentline[4] || '').replace(/"/g, '').trim();
    obj['Password'] = (currentline[5] || '').replace(/"/g, '').trim();
    obj['Contact'] = (currentline[6] || '').replace(/"/g, '').trim();
    obj['Location'] = (currentline[7] || '').replace(/"/g, '').trim(); // "Locationed" column maps to "Location"
    obj['Employment Date'] = (currentline[8] || '').replace(/"/g, '').trim();
    obj['Date Stopped'] = (currentline[9] || '').replace(/"/g, '').trim();
    
    objects.push(obj);
  }
  return objects;
}

// Helper function to parse non-teacher CSV data (no headers, fixed column order)
function parseNonTeacherCsv(csv: string): any[] {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return [];

  const objects = [];
  // Expected column order: Name, Department, Role, Status, Username, Password, Contact, Location, DateCreated, DateUpdated
  
  for (let i = 0; i < lines.length; i++) {
    const obj: { [key: string]: string } = {};
    // Split by comma only if it's not enclosed in quotes
    const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 

    // Map to expected field names based on column position
    obj['Name'] = (currentline[0] || '').replace(/"/g, '').trim();
    obj['Department'] = (currentline[1] || '').replace(/"/g, '').trim();
    obj['Role'] = (currentline[2] || '').replace(/"/g, '').trim();
    obj['Status'] = (currentline[3] || '').replace(/"/g, '').trim();
    obj['Username'] = (currentline[4] || '').replace(/"/g, '').trim();
    obj['Password'] = (currentline[5] || '').replace(/"/g, '').trim();
    obj['Contact'] = (currentline[6] || '').replace(/"/g, '').trim();
    obj['Location'] = (currentline[7] || '').replace(/"/g, '').trim();
    obj['Date created'] = (currentline[8] || '').replace(/"/g, '').trim();
    obj['Date updated'] = (currentline[9] || '').replace(/"/g, '').trim();
    
    objects.push(obj);
  }
  return objects;
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
            console.log(`Fetching students from Google Sheets (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            
            const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Metadata`;
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch(url, { 
                next: { revalidate: 60 },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`Students sheet response status: ${response.status}`);
            
             if (!response.ok) {
                throw new Error(`Failed to fetch students sheet: ${response.statusText}`);
            }
            const csvText = await response.text();
            const studentData = csvToObjects(csvText);
            
            console.log(`Students sheet data rows: ${studentData.length}`);

            if (studentData.length === 0) {
                console.log('No student data found in sheet');
                return [];
            }
            
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
                
                // Create unique ID to avoid duplicates - use row number + student name hash + index
                const rowNumber = s['No.'] || (index + 1).toString();
                const nameHash = s['NAME'] ? s['NAME'].replace(/\s+/g, '').toLowerCase().substring(0, 15) : '';
                const uniqueId = `${rowNumber}-${nameHash}-${index}`;
                
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
                    guardianName: s['Parent Name'] || '',
                    guardianPhone: s['Contact'] || '',
                };
                return student;
            }).filter(s => s.studentName && s.class);

            console.log(`Processed ${students.length} students from sheet`);
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
  console.log(`getStudentsByClass called with className: "${className}"`);
  const allStudents = await getAllStudents();
  console.log(`Total students fetched: ${allStudents.length}`);
  console.log('Sample student classes:', allStudents.slice(0, 3).map(s => s.class));
  
  const filteredStudents = allStudents.filter(s => {
    const matches = s.class.trim() === className.trim();
    console.log(`Student ${s.studentName} class "${s.class.trim()}" matches "${className.trim()}": ${matches}`);
    return matches;
  });
  
  console.log(`Filtered students for class "${className}": ${filteredStudents.length}`);
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
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (VERBOSE_LOGGING) {
                console.log(`Fetching teachers from Google Sheets API (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            }
            
            // Use Google Sheets API instead of CSV export
            const sheetsService = new GoogleSheetsService();
            const result = await sheetsService.getSheetData('Teachers');
            
            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('No teacher data found in Google Sheets');
                return [];
            }
            
            const rows = result.data;
            
            // Skip header row and process data rows
            const teacherData = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const obj: { [key: string]: string } = {};
                
                // Map actual column headers to expected field names
                obj['Name'] = (row[0] || '').toString().trim();
                obj['Class'] = (row[1] || '').toString().trim();
                obj['Role'] = (row[2] || '').toString().trim(); // "Teacher" column maps to "Role"
                obj['Status'] = (row[3] || '').toString().trim(); // "Active" column maps to "Status"
                obj['Username'] = (row[4] || '').toString().trim();
                obj['Password'] = (row[5] || '').toString().trim();
                obj['Contact'] = (row[6] || '').toString().trim();
                obj['Location'] = (row[7] || '').toString().trim(); // "Locationed" column maps to "Location"
                obj['Employment Date'] = (row[8] || '').toString().trim();
                obj['Date Stopped'] = (row[9] || '').toString().trim();
                
                teacherData.push(obj);
            }

            if (teacherData.length === 0) return [];
            
            const teachers: TeacherUser[] = teacherData.map(t => ({
                id: t['Username'] || '',
                name: t['Name'] || t['Teacher Name'] || '',
                class: t['Class'] || '',
                role: t['Role'] || '',
                status: ((t['Status'] || '').toLowerCase() === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
                username: t['Username'] || '',
                email: '',
                phone: '',
                contact: t['Contact'] || '',
                location: t['Location'] || '',
                employmentDate: t['Employment Date'] || t['Employement Dated'] || '',
                dateStopped: t['Date Stopped'] || ''
            })).filter(t => t.username);

            if (VERBOSE_LOGGING) {
                console.log(`Successfully fetched ${teachers.length} teachers`);
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

export async function getTeacherLoginUsers(): Promise<TeacherUserWithPassword[]> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const sheetsService = new GoogleSheetsService();
            const result = await sheetsService.getSheetData('Teachers');
            if (!result.success || !result.data || result.data.length === 0) {
                return [];
            }
            const rows = result.data;
            const out: TeacherUserWithPassword[] = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const username = (row[4] || '').toString().trim();
                if (!username) continue;
                out.push({
                    username,
                    password: (row[5] || '').toString().trim(),
                    role: (row[2] || '').toString().trim(),
                    name: (row[0] || '').toString().trim(),
                    class: (row[1] || '').toString().trim(),
                    status: ((row[3] || '').toString().trim().toLowerCase() === 'active') ? 'active' : 'inactive'
                });
            }
            return out;
        } catch (error) {
            if (attempt === maxRetries) {
                return [];
            }
            const waitTime = attempt * 2000;
            await new Promise(r => setTimeout(r, waitTime));
        }
    }
    return [];
}

export async function getNonTeacherUsers(): Promise<NonTeacherUser[]> {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (VERBOSE_LOGGING) {
                console.log(`Fetching non-teachers from Google Sheets API (attempt ${attempt}/${maxRetries}): ${SPREADSHEET_ID}`);
            }
            
            // Use Google Sheets API instead of CSV export
            const sheetsService = new GoogleSheetsService();
            const result = await sheetsService.getSheetData('Non-Teaching');
            
            if (!result.success || !result.data || result.data.length === 0) {
                console.warn('No non-teacher data found in Google Sheets');
                return [];
            }
            
            const rows = result.data;
            
            // Skip header row and process data rows
            const nonTeacherData = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const obj: { [key: string]: string } = {};
                
                // Map actual column headers to expected field names
                obj['Name'] = (row[0] || '').toString().trim();
                obj['Department'] = (row[1] || '').toString().trim();
                obj['Role'] = (row[2] || '').toString().trim();
                obj['Status'] = (row[3] || '').toString().trim();
                obj['Username'] = (row[4] || '').toString().trim();
                obj['Password'] = (row[5] || '').toString().trim();
                obj['Contact'] = (row[6] || '').toString().trim();
                obj['Location'] = (row[7] || '').toString().trim();
                obj['Date created'] = (row[8] || '').toString().trim();
                obj['Date updated'] = (row[9] || '').toString().trim();
                
                nonTeacherData.push(obj);
            }

            if (nonTeacherData.length === 0) return [];
            
            const nonTeachers: NonTeacherUser[] = nonTeacherData.map(t => ({
                id: t['Username'] || '',
                name: t['Name'] || '',
                username: t['Username'] || '',
                email: '',
                phone: '',
                department: t['Department'] || '',
                role: t['Role'] || '',
                status: ((t['Status'] || '').toLowerCase() === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
                contact: t['Contact'] || '',
                location: t['Location'] || '',
                dateCreated: t['Date created'] || '',
                dateUpdated: t['Date updated'] || ''
            })).filter(t => t.username);

            if (VERBOSE_LOGGING) {
                console.log(`Successfully fetched ${nonTeachers.length} non-teachers`);
            }
            
            return nonTeachers;
            
        } catch (error) {
            console.error(`Error fetching non-teachers from Google Sheet (attempt ${attempt}/${maxRetries}):`, error);
            
            if (attempt === maxRetries) {
                console.error("Max retries reached, returning empty non-teacher array");
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

export async function getAdminUsers(): Promise<AdminUserWithPassword[]> {
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
            
            const admins: AdminUserWithPassword[] = adminData.map(a => ({
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

function gradeFromPercentage(p: number): string {
  if (p >= 80) return 'A';
  if (p >= 70) return 'B';
  if (p >= 60) return 'C';
  if (p >= 50) return 'D';
  if (p >= 40) return 'E';
  return 'F';
}

export async function getSBARecords(): Promise<SBARecord[]> {
  try {
    const sheetsService = new GoogleSheetsService();
    const candidateNames = ['SBA', 'SBA Records', 'Assessments', 'SBA Sheet'];
    let result = await sheetsService.getSheetData(candidateNames[0]);
    if (!result.success || !result.data || result.data.length <= 1) {
      for (let i = 1; i < candidateNames.length; i++) {
        const alt = await sheetsService.getSheetData(candidateNames[i]);
        if (alt.success && alt.data && alt.data.length > 1) {
          result = alt;
          break;
        }
      }
    }
    if (!result.success || !result.data) {
      const headers = [
        'ID','Student ID','Student Name','Class','Subject','Term','Academic Year','Assessment Type','Score','Total Marks','Percentage','Grade','Remarks','Date','Teacher ID','Teacher Name','Created At','Updated At'
      ];
      const created = await sheetsService.createSheet('SBA');
      if (created.success) {
        await sheetsService.appendToSheet('SBA', [headers]);
        const retry = await sheetsService.getSheetData('SBA');
        result = retry;
      } else {
        return [];
      }
    } else if (result.data.length === 0) {
      const headers = [
        'ID','Student ID','Student Name','Class','Subject','Term','Academic Year','Assessment Type','Score','Total Marks','Percentage','Grade','Remarks','Date','Teacher ID','Teacher Name','Created At','Updated At'
      ];
      await sheetsService.appendToSheet('SBA', [headers]);
      const retry = await sheetsService.getSheetData('SBA');
      result = retry;
    }
    if (!result.data || result.data.length <= 1) return [];
    const rows = result.data;
    const headers: string[] = rows[0].map((h: unknown) => (h ? String(h).trim().toLowerCase() : ''));
    const getIndex = (name: string) => headers.findIndex((h: string) => h === name.toLowerCase());
    const idx = {
      id: getIndex('id'),
      studentId: getIndex('student id'),
      studentName: getIndex('student name'),
      className: getIndex('class'),
      subject: getIndex('subject'),
      term: getIndex('term'),
      academicYear: getIndex('academic year'),
      assessmentType: getIndex('assessment type'),
      score: getIndex('score'),
      totalMarks: getIndex('total marks'),
      percentage: getIndex('percentage'),
      grade: getIndex('grade'),
      remarks: getIndex('remarks'),
      date: getIndex('date'),
      teacherId: getIndex('teacher id'),
      teacherName: getIndex('teacher name'),
      createdAt: getIndex('created at'),
      updatedAt: getIndex('updated at'),
    };
    const toStr = (row: any[], i: number | undefined) => (typeof i === 'number' && i >= 0 ? String(row[i] || '').trim() : '');
    const toNum = (row: any[], i: number | undefined) => {
      const v = toStr(row, i);
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };
    const records: SBARecord[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const score = toNum(row, idx.score);
      const totalMarks = toNum(row, idx.totalMarks);
      const pctHeader = toNum(row, idx.percentage);
      const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : pctHeader;
      const rec: SBARecord = {
        id: toStr(row, idx.id) || `SBA-${i}`,
        studentId: toStr(row, idx.studentId),
        studentName: toStr(row, idx.studentName),
        className: toStr(row, idx.className),
        subject: toStr(row, idx.subject),
        term: toStr(row, idx.term),
        academicYear: toStr(row, idx.academicYear),
        assessmentType: toStr(row, idx.assessmentType).toLowerCase() as SBARecord['assessmentType'],
        score,
        totalMarks,
        percentage,
        grade: toStr(row, idx.grade) || gradeFromPercentage(percentage),
        remarks: toStr(row, idx.remarks) || undefined,
        date: toStr(row, idx.date),
        teacherId: toStr(row, idx.teacherId),
        teacherName: toStr(row, idx.teacherName),
        createdAt: toStr(row, idx.createdAt) || new Date().toISOString(),
        updatedAt: toStr(row, idx.updatedAt) || new Date().toISOString(),
      };
      if (rec.studentId && rec.subject) {
        records.push(rec);
      }
    }
    return records;
  } catch (error) {
    console.error('Error fetching SBA records:', error);
    return [];
  }
}

export async function getStudentSBASummaryBySubject(studentId: string, className?: string): Promise<SBASummary[]> {
  const records = await getSBARecords();
  const filtered = records.filter(r => r.studentId === studentId && (!className || r.className === className));
  if (filtered.length === 0) return [];
  const map: Record<string, SBARecord[]> = {};
  for (const r of filtered) {
    const key = r.subject;
    if (!map[key]) map[key] = [];
    map[key].push(r);
  }
  const summaries: SBASummary[] = Object.entries(map).map(([subject, recs]) => {
    const totalAssessments = recs.length;
    const avg = totalAssessments ? recs.reduce((s, r) => s + (r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : r.percentage), 0) / totalAssessments : 0;
    const latest = recs.slice().sort((a, b) => {
      const da = new Date(a.date || a.updatedAt).getTime();
      const db = new Date(b.date || b.updatedAt).getTime();
      return db - da;
    })[0];
    return {
      studentId: latest.studentId,
      studentName: latest.studentName,
      className: latest.className,
      subject,
      term: latest.term,
      academicYear: latest.academicYear,
      totalAssessments,
      averageScore: Number(avg.toFixed(2)),
      finalGrade: gradeFromPercentage(avg),
      teacherId: latest.teacherId,
      teacherName: latest.teacherName,
    };
  });
  return summaries;
}

    
