#!/usr/bin/env node

// Ultra-detailed analysis to find any hidden students
async function ultraDetailedAnalysis() {
  console.log('🔍 Ultra-Detailed Analysis - Checking for Hidden Students...');
  
  try {
    const spreadsheetId = '1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew';
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Metadata`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    
    console.log(`📊 Total lines in CSV: ${lines.length}`);
    console.log('');
    
    // Check every single row for any potential student data
    console.log('=== CHECKING ALL ROWS FOR HIDDEN STUDENTS ===');
    
    let potentialHiddenStudents = [];
    
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i];
      const cells = row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
      
      const studentNumber = cells[0];
      const studentName = cells[1];
      
      // Check if this might be a student with different formatting
      const hasAnyNumber = /\d+/.test(studentNumber);
      const hasAnyText = studentName && studentName.length > 0 && studentName !== '""';
      const looksLikeName = studentName && studentName.match(/[a-zA-Z]/);
      const looksLikeNumber = studentNumber && !isNaN(parseInt(studentNumber));
      
      if (hasAnyNumber || hasAnyText) {
        potentialHiddenStudents.push({
          row: i + 1,
          number: studentNumber,
          name: studentName,
          hasNumber: hasAnyNumber,
          hasText: hasAnyText,
          looksLikeName: !!looksLikeName,
          looksLikeNumber: !!looksLikeNumber,
          first5Cells: cells.slice(0, 5).map(c => `"${c}"`).join(' | ')
        });
      }
    }
    
    console.log(`Found ${potentialHiddenStudents.length} rows with any content in first 2 columns:`);
    
    potentialHiddenStudents.forEach((row, index) => {
      console.log(`\n--- Row ${row.row} ---`);
      console.log(`Number: "${row.number}"`);
      console.log(`Name: "${row.name}"`);
      console.log(`Has number: ${row.hasNumber}`);
      console.log(`Has text: ${row.hasText}`);
      console.log(`Looks like name: ${row.looksLikeName}`);
      console.log(`Looks like number: ${row.looksLikeNumber}`);
      console.log(`First 5 cells: ${row.first5Cells}`);
      
      // Determine if this should be a student
      const shouldBeStudent = row.looksLikeNumber && row.looksLikeName;
      console.log(`Should be counted as student: ${shouldBeStudent}`);
    });
    
    // Final count
    const actualStudents = potentialHiddenStudents.filter(row => 
      row.looksLikeNumber && row.looksLikeName
    ).length;
    
    console.log(`\n=== FINAL RESULT ===`);
    console.log(`Total rows with content: ${potentialHiddenStudents.length}`);
    console.log(`Actual students found: ${actualStudents}`);
    
    if (actualStudents === 149) {
      console.log('🎉 Found all 149 students!');
    } else if (actualStudents === 145) {
      console.log('✅ Confirmed: 145 students (4 students are indeed missing from the sheet)');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing rows:', error);
  }
}

// Run the analysis
ultraDetailedAnalysis();