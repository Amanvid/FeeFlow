// Test script to verify the new delete functionality
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

async function testDeleteFunctionality() {
  console.log('Testing new delete functionality...');
  
  try {
    const googleSheetsService = new GoogleSheetsService();
    
    // First, let's get the current claims data
    console.log('Fetching current claims data...');
    const result = await googleSheetsService.getSheetData('Claims');
    
    if (!result.success) {
      console.error('Failed to fetch claims data:', result.message);
      return;
    }
    
    const rows = result.data;
    console.log(`Found ${rows.length} total rows (including header)`);
    
    // Show the first few rows for reference
    console.log('\nFirst 5 rows:');
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      console.log(`Row ${i + 1}:`, rows[i]);
    }
    
    // Test the new deleteRowFromSheet method
    if (rows.length > 2) {
      console.log('\nTesting deleteRowFromSheet method...');
      console.log('Attempting to delete row 2 (first data row after header)...');
      
      const deleteResult = await googleSheetsService.deleteRowFromSheet('Claims', 2);
      
      if (deleteResult.success) {
        console.log('✅ Row deleted successfully!');
        
        // Fetch data again to verify the row was actually removed
        console.log('Fetching data again to verify...');
        const newResult = await googleSheetsService.getSheetData('Claims');
        
        if (newResult.success) {
          console.log(`New row count: ${newResult.data.length} (should be ${rows.length - 1})`);
          
          // Show the first few rows after deletion
          console.log('\nFirst 5 rows after deletion:');
          for (let i = 0; i < Math.min(5, newResult.data.length); i++) {
            console.log(`Row ${i + 1}:`, newResult.data[i]);
          }
          
          if (newResult.data.length === rows.length - 1) {
            console.log('✅ Row count matches expected - row was physically removed!');
          } else {
            console.log('❌ Row count doesn\'t match expected');
          }
        }
      } else {
        console.error('❌ Failed to delete row:', deleteResult.message);
      }
    } else {
      console.log('Not enough rows to test deletion');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testDeleteFunctionality();