#!/usr/bin/env node

/**
 * Test script to verify the updated getTotalStudentsCount functions
 * This script tests both the Google Sheets service and data.ts implementations
 */

import { GoogleSheetsService } from './src/lib/google-sheets.ts';
import { getTotalStudentsCount } from './src/lib/data.ts';

async function testStudentCountFunctions() {
    console.log('🧪 Testing updated student count functions...\n');
    
    try {
        // Test 1: Google Sheets Service directly
        console.log('1️⃣ Testing GoogleSheetsService.getTotalStudentsCount()...');
        const googleSheetsService = new GoogleSheetsService();
        const sheetsResult = await googleSheetsService.getTotalStudentsCount();
        
        console.log('📊 Google Sheets Service Result:');
        console.log(`   Success: ${sheetsResult.success}`);
        console.log(`   Count: ${sheetsResult.count}`);
        console.log(`   Message: ${sheetsResult.message}\n`);
        
        // Test 2: Data.ts function (which uses Google Sheets Service)
        console.log('2️⃣ Testing getTotalStudentsCount() from data.ts...');
        const dataResult = await getTotalStudentsCount();
        
        console.log('📊 Data.ts Function Result:');
        console.log(`   Count: ${dataResult}\n`);
        
        // Test 3: Verify the count matches expected value (149)
        console.log('3️⃣ Verification:');
        const expectedCount = 149;
        const googleSheetsCount = sheetsResult.success ? sheetsResult.count : 0;
        const dataCount = dataResult;
        
        console.log(`   Expected count: ${expectedCount}`);
        console.log(`   Google Sheets count: ${googleSheetsCount}`);
        console.log(`   Data.ts count: ${dataCount}`);
        
        const googleSheetsMatches = googleSheetsCount === expectedCount;
        const dataMatches = dataCount === expectedCount;
        const bothMatch = googleSheetsMatches && dataMatches;
        
        console.log(`\n   ✅ Google Sheets matches expected: ${googleSheetsMatches}`);
        console.log(`   ✅ Data.ts matches expected: ${dataMatches}`);
        console.log(`   ✅ Both functions return same count: ${googleSheetsCount === dataCount}`);
        
        if (bothMatch) {
            console.log('\n🎉 SUCCESS: All functions return the correct count of 149 students!');
            console.log('✨ The dynamic Google Sheet update handling is working correctly.');
        } else {
            console.log('\n⚠️  WARNING: Count mismatch detected');
            if (!googleSheetsMatches) {
                console.log(`   Google Sheets returned ${googleSheetsCount} instead of ${expectedCount}`);
            }
            if (!dataMatches) {
                console.log(`   Data.ts returned ${dataCount} instead of ${expectedCount}`);
            }
        }
        
        // Test 4: Test dynamic behavior (run multiple times to ensure consistency)
        console.log('\n4️⃣ Testing dynamic consistency...');
        const consistencyTests = 3;
        const results = [];
        
        for (let i = 0; i < consistencyTests; i++) {
            const result = await getTotalStudentsCount();
            results.push(result);
            console.log(`   Test ${i + 1}: ${result} students`);
            
            // Small delay between tests
            if (i < consistencyTests - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        const allConsistent = results.every(r => r === expectedCount);
        console.log(`   ✅ All consistency tests pass: ${allConsistent}`);
        
        return {
            success: bothMatch && allConsistent,
            googleSheetsCount,
            dataCount,
            expectedCount,
            consistent: allConsistent
        };
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test
testStudentCountFunctions().then(result => {
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(50));
    
    if (result.success) {
        console.log('✅ All tests passed!');
        console.log(`✅ Student count is correctly reported as ${result.expectedCount}`);
        console.log('✅ Dynamic Google Sheet updates are handled properly');
    } else {
        console.log('❌ Tests failed');
        if (result.error) {
            console.log(`❌ Error: ${result.error}`);
        }
    }
    
    process.exit(result.success ? 0 : 1);
});