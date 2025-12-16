import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
// Load env vars manually BEFORE importing service
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading env from ${envPath}`);
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
  // Explicitly set them for the process, just in case
  console.log('Set env vars:', Object.keys(envConfig).filter(k => k.startsWith('GOOGLE')));
} else {
  console.log('.env.local not found');
}

async function main() {
  try {
    const { GoogleSheetsService } = await import('../src/lib/google-sheets');
    console.log('Service Account Email:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
    const sheetsService = new GoogleSheetsService();
    // Scan columns for Nursery 1 Numeracy (L-S)
    const result = await sheetsService.getSheetData('SBA Nursery 1', 'A1:S35');
    
    if (!result.success || !result.data) {
      console.error('Failed to read sheet');
      return;
    }

    const rows = result.data;
    // We are interested in rows 3 to 35
    console.log('--- NUMERACY DATA (Rows 3-35) ---');
    // Header usually in row 1 or 2
    // Let's print row 1, 2 and then 3, 4 (Andrew is likely row 4 if Nana is row 3)
    
    rows.forEach((row: any[], index: number) => {
      const rowIndex = index + 1;
      if (rowIndex <= 5 || rowIndex === 18 + 2) { // Print header, first few students, and Jayden (approx row 20)
         // Extract columns L (index 11) to S (index 18)
         // And Name (Column B, index 1)
         const name = row[1];
         const numeracyData = row.slice(11, 19); // L is 11th (0-indexed: A=0... L=11)
         console.log(`Row ${rowIndex} [${name}]: ${JSON.stringify(numeracyData)}`);
      }
    });
    console.log('--- END ---');

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
