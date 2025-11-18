// Test the private key loading from the GoogleSheetsService
const { GoogleSheetsService } = require('./src/lib/google-sheets.ts');

console.log('Testing private key loading...');

try {
  // This will trigger the constructor and private key loading
  const service = new GoogleSheetsService();
  console.log('✅ GoogleSheetsService created successfully');
  
  // Test if we can access the private key (it should be loaded)
  console.log('Service created without errors');
  
} catch (error) {
  console.error('❌ Failed to create GoogleSheetsService:', error.message);
}