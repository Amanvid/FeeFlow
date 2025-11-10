#!/usr/bin/env node

/**
 * Test script to verify the total students count functionality
 * This script tests the new getTotalStudentsCount function that reads directly from Google Sheets
 */

import { GoogleSheetsService } from './src/lib/google-sheets.ts';
import { getTotalStudentsCount, getAllStudents } from './src/lib/data.ts';

async function testTotalStudentsCount() {
  console.log('🧪 Testing Total Students Count Functionality...\n');

  try {
    // Test 1: Direct Google Sheets Service
    console.log('1️⃣ Testing GoogleSheetsService.getTotalStudentsCount()...');
    const googleSheetsService = new GoogleSheetsService();
    const sheetResult = await googleSheetsService.getTotalStudentsCount();
    
    if (sheetResult.success) {
      console.log(`✅ Google Sheets Service: ${sheetResult.count} students (${sheetResult.message})`);
    } else {
      console.log(`❌ Google Sheets Service failed: ${sheetResult.message}`);
    }

    // Test 2: Data Library Function
    console.log('\n2️⃣ Testing getTotalStudentsCount() function...');
    const totalCount = await getTotalStudentsCount();
    console.log(`✅ Data Library Function: ${totalCount} students`);

    // Test 3: Compare with traditional method
    console.log('\n3️⃣ Comparing with traditional getAllStudents().length...');
    const students = await getAllStudents();
    const traditionalCount = students.length;
    console.log(`✅ Traditional Method: ${traditionalCount} students`);

    // Test 4: Summary
    console.log('\n📊 Summary:');
    console.log(`Google Sheets Service: ${sheetResult.success ? sheetResult.count : 'N/A'}`);
    console.log(`Data Library Function: ${totalCount}`);
    console.log(`Traditional Method: ${traditionalCount}`);
    
    if (sheetResult.success && sheetResult.count === totalCount) {
      console.log('✅ All methods are consistent!');
    } else if (sheetResult.success) {
      console.log(`⚠️  Difference detected: Google Sheets shows ${sheetResult.count}, local function shows ${totalCount}`);
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testTotalStudentsCount().catch(console.error);