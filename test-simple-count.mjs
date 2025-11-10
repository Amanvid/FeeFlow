#!/usr/bin/env node

// Simple test to verify student count without importing the entire data.ts
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testStudentCount() {
  console.log('🧪 Testing student count from Google Sheets...');
  
  try {
    // Test direct CSV fetch from Metadata sheet
    const spreadsheetId = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Metadata`;
    
    console.log('📊 Fetching Metadata sheet directly...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    console.log(`📋 Total lines in CSV: ${lines.length}`);
    
    if (lines.length <= 1) {
      console.log('❌ No data found in sheet');
      return;
    }
    
    // Count valid student rows
    let validCount = 0;
    let lastValidStudent = null;
    
    // Skip header row, process data rows
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row && row.length >= 2) {
        const studentNumber = row[0]?.replace(/^"|"$/g, '').trim();
        const studentName = row[1]?.replace(/^"|"$/g, '').trim();
        
        // Valid student row criteria
        if (studentNumber && studentName && 
            studentName !== '' && 
            studentName !== '""' &&
            !isNaN(parseInt(studentNumber)) &&
            parseInt(studentNumber) > 0) {
          validCount++;
          lastValidStudent = { number: studentNumber, name: studentName };
        }
      }
    }
    
    console.log(`✅ Valid student count: ${validCount}`);
    console.log(`👤 Last valid student: ${lastValidStudent?.number} - ${lastValidStudent?.name}`);
    
    // Show last 5 rows for debugging
    console.log('\n📍 Last 5 rows for debugging:');
    for (let i = Math.max(1, lines.length - 5); i < lines.length; i++) {
      const row = lines[i].split(',');
      const studentNumber = row[0]?.replace(/^"|"$/g, '').trim();
      const studentName = row[1]?.replace(/^"|"$/g, '').trim();
      console.log(`Row ${i}: ${studentNumber} - ${studentName}`);
    }
    
    // Verify against expected count
    if (validCount === 149) {
      console.log('\n🎉 SUCCESS: Found exactly 149 students!');
    } else {
      console.log(`\n⚠️  WARNING: Expected 149 students, but found ${validCount}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing student count:', error);
  }
}

// Run the test
testStudentCount();