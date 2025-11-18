#!/usr/bin/env node

/**
 * Daily SMS Template Update Script
 * 
 * This script fetches the latest SMS templates from Google Sheets
 * and updates the local cache. It should be run daily via cron job.
 * 
 * Usage:
 *   node scripts/daily-sms-template-update.js
 * 
 * Cron Job Setup (runs daily at 2 AM):
 *   0 2 * * * cd /path/to/your/project && node scripts/daily-sms-template-update.js >> /var/log/sms-template-update.log 2>&1
 * 
 * Windows Task Scheduler:
 *   Create a task that runs daily at 2 AM with the action:
 *   Program: node
 *   Arguments: scripts/daily-sms-template-update.js
 *   Start in: C:\path\to\your\project
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Use localhost for local development, or your actual domain for production
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
  endpoint: '/api/sms-templates/update',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 5000, // 5 seconds
  logLevel: process.env.LOG_LEVEL || 'info' // debug, info, warn, error
};

// Logging utility
const logger = {
  debug: (message, ...args) => {
    if (CONFIG.logLevel === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
  info: (message, ...args) => {
    if (['debug', 'info'].includes(CONFIG.logLevel)) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    if (['debug', 'info', 'warn'].includes(CONFIG.logLevel)) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  }
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FeeFlow-SMS-Template-Updater/1.0',
        ...options.headers
      },
      timeout: CONFIG.timeout,
      ...options
    };

    logger.debug('Making request to:', url);
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        logger.debug('Response status:', res.statusCode);
        logger.debug('Response data:', data);
        
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
      logger.error('Request error:', error.message);
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

// Retry logic
async function makeRequestWithRetry(url, options = {}, attempt = 1) {
  try {
    logger.info(`Attempt ${attempt}/${CONFIG.retries}: Updating SMS templates...`);
    const result = await makeRequest(url, options);
    logger.info(`Successfully updated SMS templates on attempt ${attempt}`);
    return result;
  } catch (error) {
    logger.warn(`Attempt ${attempt} failed:`, error.message);
    
    if (attempt < CONFIG.retries) {
      logger.info(`Retrying in ${CONFIG.retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      return makeRequestWithRetry(url, options, attempt + 1);
    } else {
      throw error;
    }
  }
}

// Main update function
async function updateSmsTemplates() {
  const startTime = Date.now();
  
  logger.info('Starting daily SMS template update');
  logger.info('Configuration:', {
    baseUrl: CONFIG.baseUrl,
    endpoint: CONFIG.endpoint,
    timeout: CONFIG.timeout,
    retries: CONFIG.retries,
    retryDelay: CONFIG.retryDelay
  });
  
  try {
    // Make the update request
    const url = `${CONFIG.baseUrl}${CONFIG.endpoint}`;
    const result = await makeRequestWithRetry(url, {
      body: { force: true } // Force update to ensure fresh templates
    });
    
    const duration = Date.now() - startTime;
    
    if (result.data.success) {
      logger.info('✅ SMS templates updated successfully!');
      logger.info('Update details:', {
        duration: `${duration}ms`,
        timestamp: result.data.timestamp,
        templateCount: result.data.templates?.count,
        templateTypes: result.data.templates?.types
      });
      
      // Log success metrics
      logger.info('📊 Update metrics:', {
        totalDuration: `${duration}ms`,
        averageDurationPerAttempt: `${Math.round(duration / CONFIG.retries)}ms`,
        success: true
      });
      
      return { success: true, duration, data: result.data };
    } else {
      throw new Error(`Update failed: ${result.data.message}`);
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Failed to update SMS templates after all retries:', error.message);
    logger.error('📊 Error metrics:', {
      totalDuration: `${duration}ms`,
      retries: CONFIG.retries,
      success: false
    });
    
    return { success: false, duration, error: error.message };
  }
}

// Health check function
async function healthCheck() {
  try {
    const healthUrl = `${CONFIG.baseUrl}/api/sms-templates/update`;
    logger.info('Performing health check...');
    
    const result = await makeRequest(healthUrl.replace('/update', ''), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (result.data.success) {
      logger.info('✅ Health check passed');
      return true;
    } else {
      logger.warn('⚠️ Health check failed:', result.data.message);
      return false;
    }
  } catch (error) {
    logger.error('❌ Health check error:', error.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n🚀 FeeFlow Daily SMS Template Update\n');
  console.log('=' .repeat(50));
  
  // Perform health check first
  const isHealthy = await healthCheck();
  if (!isHealthy) {
    logger.warn('System health check failed, but proceeding with update anyway...');
  }
  
  // Update templates
  const result = await updateSmsTemplates();
  
  // Exit with appropriate code
  if (result.success) {
    console.log('\n✅ Daily SMS template update completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Daily SMS template update failed!');
    process.exit(1);
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

// Run the script
if (require.main === module) {
  main().catch((error) => {
    logger.error('Script execution failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  });
}

module.exports = { updateSmsTemplates, healthCheck };