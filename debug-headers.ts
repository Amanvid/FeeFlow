
import { GoogleSheetsService } from './src/lib/google-sheets';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
const envResult = dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
console.log('Dotenv result:', envResult.error ? envResult.error.message : 'Success');
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Loaded' : 'Missing');
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'Loaded' : 'Missing');

async function main() {
    try {
        const sheetsService = new GoogleSheetsService();
        // @ts-ignore
        const result = await sheetsService.getSheetData('Metadata');

        if (result.success && result.data && result.data.length > 0) {
            console.log('--- RAW METADATA SHEET CONTENT (First 5 Rows) ---');
            const rows = result.data.slice(0, 5);
            rows.forEach((row: any, index: number) => {
                console.log(`Row ${index + 1}:`, JSON.stringify(row));
            });
            console.log('-----------------------------------------------');
        } else {
            console.error('Failed to get data or empty sheet:', result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
