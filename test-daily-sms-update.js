#!/usr/bin/env node

/**
 * Test script for Daily SMS Template Update System
 * 
 * This script tests the daily SMS template update functionality
 * to ensure it's working correctly before setting up cron jobs.
 */

require('dotenv').config({ path: '.env.local' });

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
  timeout: 10000, // 10 seconds for tests
  logLevel: 'info'
};

// Logging utility
const logger = {
  info: (message, ...args) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args),
  warn: (message, ...args) => console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args),
  error: (message, ...args) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args),
  success: (message, ...args) => console.log(`[SUCCESS] ${new Date().toISOString()} - ${message}`, ...args),
  test: (message, ...args) => console.log(`[TEST] ${new Date().toISOString()} - ${message}`, ...args)
};

// HTTP request utility
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FeeFlow-Test-Script/1.0',
        ...options.headers
      },
      timeout: CONFIG.timeout,
      ...options
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: parsedData });
          } catch (e) {
            reject(new Error(`Failed to parse JSON response: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    // Send request body if provided
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testServerConnection() {
  logger.test('Testing server connection...');
  
  try {
    const healthUrl = `${CONFIG.baseUrl}/api/sms-templates/update`;
    const result = await makeRequest(healthUrl, { method: 'GET' });
    
    if (result.data.success) {
      logger.success('✅ Server connection test passed');
      logger.info('Current template status:', {
        count: result.data.templates?.count,
        types: result.data.templates?.types,
        timestamp: result.data.timestamp
      });
      return true;
    } else {
      logger.warn('⚠️ Server connection test failed:', result.data.message);
      return false;
    }
  } catch (error) {
    logger.error('❌ Server connection test failed:', error.message);
    return false;
  }
}

async function testTemplateUpdate() {
  logger.test('Testing template update functionality...');
  
  try {
    const updateUrl = `${CONFIG.baseUrl}/api/sms-templates/update`;
    const result = await makeRequest(updateUrl, {
      method: 'POST',
      body: { force: true }
    });
    
    if (result.data.success) {
      logger.success('✅ Template update test passed');
      logger.info('Update details:', {
        duration: result.data.duration,
        timestamp: result.data.timestamp,
        templateCount: result.data.templates?.count,
        templateTypes: result.data.templates?.types
      });
      return true;
    } else {
      logger.warn('⚠️ Template update test failed:', result.data.message);
      return false;
    }
  } catch (error) {
    logger.error('❌ Template update test failed:', error.message);
    return false;
  }
}

async function testTemplateContent() {
  logger.test('Testing template content retrieval...');
  
  try {
    const contentUrl = `${CONFIG.baseUrl}/api/sms-templates/update?content=true`;
    const result = await makeRequest(contentUrl, { method: 'GET' });
    
    if (result.data.success && result.data.templates?.content) {
      logger.success('✅ Template content test passed');
      
      const content = result.data.templates.content;
      const templates = Object.keys(content);
      
      logger.info('Available templates:', templates);
      
      // Check each template
      templates.forEach(templateName => {
        const template = content[templateName];
        const hasPlaceholders = /\{[^}]+\}/.test(template);
        
        logger.info(`Template: ${templateName}`, {
          length: template.length,
          hasPlaceholders: hasPlaceholders,
          preview: template.substring(0, 50) + (template.length > 50 ? '...' : '')
        });
      });
      
      return true;
    } else {
      logger.warn('⚠️ Template content test failed:', result.data.message);
      return false;
    }
  } catch (error) {
    logger.error('❌ Template content test failed:', error.message);
    return false;
  }
}

async function testDailyScript() {
  logger.test('Testing daily update script...');
  
  try {
    // Import the daily update script
    const { updateSmsTemplates, healthCheck } = require('./scripts/daily-sms-template-update.js');
    
    logger.info('Testing health check...');
    const healthResult = await healthCheck();
    
    if (healthResult) {
      logger.success('✅ Health check passed');
    } else {
      logger.warn('⚠️ Health check failed');
    }
    
    logger.info('Testing template update...');
    const updateResult = await updateSmsTemplates();
    
    if (updateResult.success) {
      logger.success('✅ Daily script test passed');
      logger.info('Update result:', {
        duration: updateResult.duration,
        success: updateResult.success
      });
      return true;
    } else {
      logger.warn('⚠️ Daily script test failed:', updateResult.error);
      return false;
    }
  } catch (error) {
    logger.error('❌ Daily script test failed:', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  logger.test('Testing environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SPREADSHEET_ID',
    'FROG_API_KEY',
    'FROG_USERNAME'
  ];
  
  const optionalVars = [
    'NEXT_PUBLIC_SITE_URL',
    'VERBOSE_LOGGING'
  ];
  
  logger.info('Required environment variables:');
  let allRequiredSet = true;
  
  requiredVars.forEach(varName => {
    const isSet = !!process.env[varName];
    logger.info(`  ${varName}: ${isSet ? '✅ Set' : '❌ Missing'}`);
    if (!isSet) allRequiredSet = false;
  });
  
  logger.info('Optional environment variables:');
  optionalVars.forEach(varName => {
    const isSet = !!process.env[varName];
    logger.info(`  ${varName}: ${isSet ? '✅ Set' : '⚠️ Not set'}`);
  });
  
  if (process.env.FROG_API_KEY) {
    logger.info(`FROG_API_KEY length: ${process.env.FROG_API_KEY.length}`);
  }
  
  return allRequiredSet;
}

// Main test function
async function runAllTests() {
  console.log('\n🧪 FeeFlow Daily SMS Template Update System Test\n');
  console.log('=' .repeat(60));
  
  const testResults = [];
  
  // Test 1: Environment Variables
  logger.info('\n📋 Test 1: Environment Variables');
  const envTest = await testEnvironmentVariables();
  testResults.push({ name: 'Environment Variables', passed: envTest });
  
  if (!envTest) {
    logger.error('\n❌ Critical environment variables missing. Stopping tests.');
    return;
  }
  
  // Test 2: Server Connection
  logger.info('\n🌐 Test 2: Server Connection');
  const serverTest = await testServerConnection();
  testResults.push({ name: 'Server Connection', passed: serverTest });
  
  if (!serverTest) {
    logger.error('\n❌ Server connection failed. Ensure your Next.js server is running on port 9002.');
    logger.info('Start your server with: npm run dev -- --turbopack -p 9002');
    return;
  }
  
  // Test 3: Template Update
  logger.info('\n🔄 Test 3: Template Update Functionality');
  const updateTest = await testTemplateUpdate();
  testResults.push({ name: 'Template Update', passed: updateTest });
  
  // Test 4: Template Content
  logger.info('\n📄 Test 4: Template Content');
  const contentTest = await testTemplateContent();
  testResults.push({ name: 'Template Content', passed: contentTest });
  
  // Test 5: Daily Script
  logger.info('\n🤖 Test 5: Daily Update Script');
  const scriptTest = await testDailyScript();
  testResults.push({ name: 'Daily Script', passed: scriptTest });
  
  // Summary
  logger.info('\n📊 Test Summary');
  console.log('=' .repeat(60));
  
  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;
  
  testResults.forEach(test => {
    logger.info(`${test.passed ? '✅' : '❌'} ${test.name}`);
  });
  
  logger.info(`\nResults: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    logger.success('\n🎉 All tests passed! Your daily SMS template update system is ready.');
    logger.info('\nNext steps:');
    logger.info('1. Set up the daily cron job or Windows Task Scheduler');
    logger.info('2. Monitor the logs for the first few days');
    logger.info('3. Test SMS functionality to ensure templates are working');
  } else {
    logger.error(`\n❌ ${totalTests - passedTests} test(s) failed. Please fix the issues above before proceeding.`);
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests().catch((error) => {
    logger.error('Test execution failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
}

module.exports = {
  testServerConnection,
  testTemplateUpdate,
  testTemplateContent,
  testDailyScript,
  testEnvironmentVariables
};