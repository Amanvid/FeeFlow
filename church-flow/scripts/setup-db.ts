import * as dotenv from 'dotenv';
dotenv.config();

// Define schema first
const SCHEMA = {
  users: ['id', 'name', 'email', 'phone', 'password', 'role', 'status', 'created_at'],
  members: ['id', 'user_id', 'membership_status', 'date_joined', 'department_id', 'baptism_status'],
  new_converts: ['id', 'member_id', 'date_converted', 'follow_up_status', 'assigned_leader'],
  departments: ['id', 'name', 'leader_id', 'description'],
  events: ['id', 'title', 'start_date', 'end_date', 'department_id', 'event_type'],
  financial_records: ['id', 'type', 'category', 'amount', 'recorded_by', 'date'],
  donations: ['id', 'member_id', 'amount', 'method', 'purpose', 'date'],
  projects: ['id', 'name', 'budget', 'status', 'start_date', 'end_date'],
  reports: ['id', 'report_type', 'generated_by', 'period', 'file_path'],
  attendance: ['id', 'member_id', 'event_id', 'date', 'status'],
  tithes: ['id', 'member_id', 'amount', 'date', 'recorded_by', 'note'],
  welfare: ['id', 'member_id', 'amount', 'date', 'type', 'note'],
  soul_winning: ['id', 'member_id', 'date', 'location', 'notes', 'follow_up_status'],
  weddings: ['id', 'member_id', 'spouse_name', 'date', 'remarks'],
  birthdays: ['id', 'member_id', 'date', 'remarks'],
  staff: ['id', 'name', 'email', 'phone', 'position', 'start_date', 'status'],
  payroll: ['id', 'staff_id', 'salary', 'allowances', 'deductions', 'bonus', 'month', 'paid_date'],
  assets: ['id', 'name', 'category', 'purchase_date', 'cost', 'status', 'location', 'notes'],
};

async function setupDatabase() {
  console.log('Starting database setup...');
  
  // Dynamic import to ensure env vars are loaded before service initialization
  const { googleSheetsService } = await import('../src/lib/google-sheets');
  
  console.log('Target Sheet ID:', process.env.GOOGLE_SHEET_ID);
  
  try {
    console.log('\nAttempting to write headers to sheets...');
    
    for (const [sheet, headers] of Object.entries(SCHEMA)) {
        console.log(`\nProcessing ${sheet}...`);
        try {
            // Try to update the first row
            await googleSheetsService.updateSheet(`${sheet}!A1:Z1`, [headers]);
            console.log(`✅ Headers written for ${sheet}`);
        } catch (error: any) {
            if (error.message && error.message.includes('Unable to parse range')) {
                 console.log(`⚠️ Sheet '${sheet}' likely does not exist. Attempting to create it...`);
                 try {
                     await googleSheetsService.addSheet(sheet);
                     console.log(`✅ Created sheet '${sheet}'`);
                     // Try writing headers again
                     await googleSheetsService.updateSheet(`${sheet}!A1:Z1`, [headers]);
                     console.log(`✅ Headers written for ${sheet}`);
                 } catch (createError: any) {
                     console.log(`❌ Failed to create sheet '${sheet}':`, createError.message);
                 }
            } else if (error.code === 403 || (error.message && error.message.includes('caller does not have permission'))) {
                 console.log(`❌ Permission denied. Please share the sheet with: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
                 return; // Stop if permission denied
            } else if (error.code === 404) {
                 console.log(`❌ Spreadsheet not found. Check the ID: ${process.env.GOOGLE_SHEET_ID}`);
                 return;
            } else {
                 console.log(`❌ Error writing to ${sheet}:`, error.message);
            }
        }
    }
    
    console.log('\nSetup process finished.');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
