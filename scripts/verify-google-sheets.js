#!/usr/bin/env node

/**
 * Script to verify Google Sheets integration is working properly
 * This should be run before deployment to Vercel
 */

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';

async function testGoogleSheetsConnection() {
  console.log('🧪 Testing Google Sheets integration...');
  console.log(`📊 Spreadsheet ID: ${SPREADSHEET_ID}`);
  
  const sheets = ['Template', 'Config', 'Metadata', 'Admin'];
  
  for (const sheet of sheets) {
    try {
      console.log(`\n🔍 Testing ${sheet} sheet...`);
      
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheet}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const text = await response.text();
        const lines = text.trim().split('\n');
        console.log(`✅ ${sheet} sheet: ${lines.length} rows found`);
        
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          console.log(`   Headers: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);
        }
      } else {
        console.log(`❌ ${sheet} sheet: HTTP ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${sheet} sheet: Error - ${error.message}`);
    }
  }
  
  console.log('\n🎉 Google Sheets integration test complete!');
}

// Run the test
testGoogleSheetsConnection().catch(console.error);