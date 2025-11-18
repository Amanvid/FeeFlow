#!/usr/bin/env node

/**
 * Comprehensive test script for daily SMS template update system
 * Tests all components: API endpoint, Google Sheets integration, and daily update script
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:9002';
const TEST_TIMEOUT = 30000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(`\n[STEP ${step}] ${description}`, 'cyan');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { text, status: response.status };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: error.message,
      status: 0
    };
  }
}

// Test server availability
async function testServerAvailability() {
  logStep(1, 'Testing server availability');
  
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    const result = await makeRequest(`${SERVER_URL}/api/health`);
    
    if (result.success) {
      logSuccess(`Server is running (attempt ${attempt})`);
      log(`  Status: ${result.status}`);
      log(`  Response: ${JSON.stringify(result.data, null, 2)}`);
      return true;
    }
    
    if (attempt < RETRY_ATTEMPTS) {
      logWarning(`Server not available, retrying in ${RETRY_DELAY}ms (attempt ${attempt}/${RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  logError('Server is not available after all retry attempts');
  return false;
}

// Test SMS template API endpoint
async function testSmsTemplateApi() {
  logStep(2, 'Testing SMS template API endpoint');
  
  // Test GET request (status check)
  log('Testing GET /api/sms-templates/update (status check)...');
  const getResult = await makeRequest(`${SERVER_URL}/api/sms-templates/update`);
  
  if (getResult.success) {
    logSuccess('GET request successful');
    log(`  Templates loaded: ${getResult.data.templates?.count || 0}`);
    log(`  Template types: ${getResult.data.templates?.types?.join(', ') || 'none'}`);
    
    if (getResult.data.templates?.content) {
      log('  Template content preview:');
      Object.entries(getResult.data.templates.content).slice(0, 3).forEach(([name, content]) => {
        log(`    ${name}: ${(content || '').substring(0, 50)}...`);
      });
    }
  } else {
    logError(`GET request failed: ${getResult.error}`);
    return false;
  }
  
  // Test POST request (force update)
  log('\nTesting POST /api/sms-templates/update (force update)...');
  const postResult = await makeRequest(`${SERVER_URL}/api/sms-templates/update`, {
    method: 'POST',
    body: JSON.stringify({ force: true })
  });
  
  if (postResult.success) {
    logSuccess('POST request successful');
    log(`  Templates updated: ${postResult.data.templates?.count || 0}`);
    log(`  Update duration: ${postResult.data.duration || 'unknown'}ms`);
    return true;
  } else {
    logError(`POST request failed: ${postResult.error}`);
    return false;
  }
}

// Test Google Sheets integration
async function testGoogleSheetsIntegration() {
  logStep(3, 'Testing Google Sheets integration');
  
  // Test direct template fetching from data.ts
  try {
    const { getSmsTemplatesFromSheet } = require('../src/lib/data.ts');
    const templates = await getSmsTemplatesFromSheet();
    
    if (templates && Object.keys(templates).length > 0) {
      logSuccess('Google Sheets integration working');
      log(`  Retrieved ${Object.keys(templates).length} templates`);
      log('  Template types found:');
      Object.keys(templates).forEach(type => {
        log(`    - ${type}: ${(templates[type] || '').substring(0, 60)}...`);
      });
      return true;
    } else {
      logWarning('No templates found in Google Sheets');
      return false;
    }
  } catch (error) {
    logError(`Google Sheets integration failed: ${error.message}`);
    return false;
  }
}

// Test daily update script
async function testDailyUpdateScript() {
  logStep(4, 'Testing daily update script');
  
  const scriptPath = path.join(__dirname, 'daily-sms-template-update.js');
  
  if (!fs.existsSync(scriptPath)) {
    logError('Daily update script not found');
    return false;
  }
  
  log('Running daily update script...');
  
  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath], {
      cwd: __dirname,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        logSuccess('Daily update script completed successfully');
        resolve(true);
      } else {
        logError(`Daily update script failed with code ${code}`);
        log(`STDERR: ${stderr}`);
        resolve(false);
      }
    });
    
    child.on('error', (error) => {
      logError(`Failed to run daily update script: ${error.message}`);
      resolve(false);
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      child.kill();
      logError('Daily update script timed out');
      resolve(false);
    }, 60000);
  });
}

// Test environment variables
function testEnvironmentVariables() {
  logStep(5, 'Testing environment variables');
  
  const requiredVars = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_SHEET_ID'
  ];
  
  const optionalVars = [
    'SMS_TEMPLATE_CACHE_TTL',
    'SMS_TEMPLATE_RETRY_ATTEMPTS',
    'SMS_TEMPLATE_RETRY_DELAY'
  ];
  
  let allRequiredPresent = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: Present`);
      if (varName.includes('KEY')) {
        log(`  Value: ${(process.env[varName] || '').substring(0, 20)}...`);
      }
    } else {
      logError(`${varName}: Missing`);
      allRequiredPresent = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName}: Present (${process.env[varName]})`);
    } else {
      logWarning(`${varName}: Not set (using defaults)`);
    }
  });
  
  return allRequiredPresent;
}

// Test admin dashboard
async function testAdminDashboard() {
  logStep(6, 'Testing admin dashboard');
  
  const result = await makeRequest(`${SERVER_URL}/admin/sms-templates`);
  
  if (result.success) {
    logSuccess('Admin dashboard accessible');
    log(`  Status: ${result.status}`);
    log(`  Content length: ${result.data.length || result.data.text?.length || 0} characters`);
    return true;
  } else {
    logError(`Admin dashboard not accessible: ${result.error}`);
    return false;
  }
}

// Performance test
async function performanceTest() {
  logStep(7, 'Performance testing');
  
  const iterations = 5;
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const result = await makeRequest(`${SERVER_URL}/api/sms-templates/update`);
    const duration = Date.now() - start;
    
    results.push({
      iteration: i + 1,
      success: result.success,
      duration,
      templates: result.data?.templates?.count || 0
    });
  }
  
  const successful = results.filter(r => r.success);
  const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
  const minDuration = Math.min(...successful.map(r => r.duration));
  const maxDuration = Math.max(...successful.map(r => r.duration));
  
  logSuccess(`Performance test completed (${successful.length}/${iterations} successful)`);
  log(`  Average response time: ${avgDuration.toFixed(0)}ms`);
  log(`  Min response time: ${minDuration}ms`);
  log(`  Max response time: ${maxDuration}ms`);
  
  return successful.length === iterations;
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting comprehensive SMS template system test', 'bright');
  log(`Server URL: ${SERVER_URL}`);
  log(`Test timeout: ${TEST_TIMEOUT}ms`);
  log(`Retry attempts: ${RETRY_ATTEMPTS}`);
  
  const results = {
    server: false,
    api: false,
    sheets: false,
    script: false,
    env: false,
    dashboard: false,
    performance: false
  };
  
  try {
    // Run tests sequentially
    results.server = await testServerAvailability();
    if (!results.server) {
      logError('Server not available, stopping tests');
      return results;
    }
    
    results.api = await testSmsTemplateApi();
    results.sheets = await testGoogleSheetsIntegration();
    results.script = await testDailyUpdateScript();
    results.env = testEnvironmentVariables();
    results.dashboard = await testAdminDashboard();
    results.performance = await performanceTest();
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
  }
  
  return results;
}

// Generate test report
function generateReport(results) {
  log('\n📊 TEST REPORT', 'bright');
  log('='.repeat(50));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  const percentage = ((passed / total) * 100).toFixed(0);
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✓ PASSED' : '✗ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(15)}: ${status}`, color);
  });
  
  log('='.repeat(50));
  log(`Overall: ${passed}/${total} tests passed (${percentage}%)`, 
    percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red');
  
  if (percentage >= 80) {
    log('🎉 System is ready for daily updates!', 'green');
  } else if (percentage >= 60) {
    log('⚠ System has some issues but may work', 'yellow');
  } else {
    log('❌ System needs attention before deployment', 'red');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(results => {
    generateReport(results);
    process.exit(Object.values(results).every(Boolean) ? 0 : 1);
  }).catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runAllTests, generateReport };