# Daily SMS Template Update System

This guide explains how to set up and use the daily SMS template update system for FeeFlow, which automatically fetches SMS templates from Google Sheets instead of using hardcoded templates.

## Overview

The system consists of:
1. **API Endpoint**: `/api/sms-templates/update` - Triggers template updates
2. **Node.js Script**: `scripts/daily-sms-template-update.js` - Automated daily updates
3. **Windows Batch File**: `scripts/daily-sms-template-update.bat` - Easy Windows execution
4. **Caching System**: Built-in cache with 5-minute TTL for performance
5. **Retry Logic**: Automatic retry with exponential backoff
6. **Health Checks**: System health monitoring
7. **Comprehensive Logging**: Detailed logging for troubleshooting

## Current Implementation

The system already fetches SMS templates from the "Template" sheet in your Google Sheets document. The templates include:

- **Fee Reminder Template**: For sending fee payment reminders
- **Admin Activation Template**: For admin OTP codes
- **OTP Template**: For user verification codes
- **Activation Template**: For account activation
- **Payment Notification Template**: For payment confirmations
- **Admission Notification Template**: For admission notifications

## Quick Start

### 1. Test the System Manually

```bash
# Test the API endpoint (requires server to be running)
curl -X POST http://localhost:9002/api/sms-templates/update \
  -H "Content-Type: application/json" \
  -d '{"force": true}'

# Or use the Node.js script directly
node scripts/daily-sms-template-update.js

# On Windows, use the batch file
scripts\daily-sms-template-update.bat
```

### 2. Check Current Template Status

```bash
# Check current template status
curl http://localhost:9002/api/sms-templates/update

# Check with template content
curl "http://localhost:9002/api/sms-templates/update?content=true"
```

## Google Sheets Template Structure

Your Google Sheets "Template" sheet should have the following columns:

| Fee Reminder Template | Admin Activation Template | OTP Template | Activation Template | Payment Notification Template | Admission Notification Template |
|----------------------|---------------------------|--------------|-------------------|----------------------------|--------------------------------|
| Dear {guardianName}, a friendly reminder... | {guardianPhone} Your confirmation code... | Your {senderId} verification code... | Your {senderId} activation code... | Dear {guardianName}, payment of GHS... | Dear {guardianName}, {studentName} has been admitted... |

### Template Placeholders

The system supports the following placeholders in templates:

- `{guardianName}` - Guardian's name
- `{studentName}` - Student's name
- `{schoolName}` - School name
- `{balance}` - Outstanding balance
- `{dueDate}` - Payment due date
- `{guardianPhone}` - Guardian's phone number
- `{otpCode}` - OTP code
- `{expiry}` - OTP expiry time
- `{senderId}` - SMS sender ID
- `{amount}` - Payment amount
- `{className}` - Student's class

## Setup Instructions

### Option 1: Windows Task Scheduler (Recommended for Windows)

1. **Open Task Scheduler**:
   - Press `Win + R`, type `taskschd.msc`, press Enter

2. **Create Basic Task**:
   - Click "Create Basic Task"
   - Name: "FeeFlow Daily SMS Template Update"
   - Description: "Daily update of SMS templates from Google Sheets"
   - Click "Next"

3. **Set Schedule**:
   - Choose "Daily"
   - Set start time: 2:00 AM (or your preferred time)
   - Click "Next"

4. **Set Action**:
   - Choose "Start a program"
   - Program/script: `C:\Windows\System32\cmd.exe`
   - Arguments: `/c "C:\path\to\your\project\scripts\daily-sms-template-update.bat"`
   - Start in: `C:\path\to\your\project`
   - Click "Next"

5. **Finish**:
   - Check "Open the Properties dialog"
   - Click "Finish"

6. **Configure Properties**:
   - General tab: Check "Run whether user is logged on or not"
   - Conditions tab: Uncheck "Start the task only if the computer is on AC power" (optional)
   - Settings tab: Check "Run task as soon as possible after a scheduled start is missed"

### Option 2: Cron Job (Linux/Mac)

1. **Open crontab**:
   ```bash
   crontab -e
   ```

2. **Add the daily job**:
   ```bash
   # FeeFlow Daily SMS Template Update - Runs at 2 AM daily
   0 2 * * * cd /path/to/your/project && node scripts/daily-sms-template-update.js >> /var/log/feeflow-sms-update.log 2>&1
   ```

3. **Save and exit**

### Option 3: Manual Execution

Run manually whenever needed:

```bash
# Using Node.js directly
node scripts/daily-sms-template-update.js

# On Windows
scripts\daily-sms-template-update.bat
```

## Configuration

### Environment Variables

The script supports these environment variables (optional):

```bash
# Set the base URL for the API (defaults to http://localhost:9002)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Set log level (debug, info, warn, error)
LOG_LEVEL=info
```

### Script Configuration

Edit `scripts/daily-sms-template-update.js` to adjust:

```javascript
const CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002',
  endpoint: '/api/sms-templates/update',
  timeout: 30000,        // Request timeout in milliseconds
  retries: 3,             // Number of retry attempts
  retryDelay: 5000,       // Delay between retries in milliseconds
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

## Monitoring and Troubleshooting

### Log Files

The script provides detailed logging:

```bash
# When run manually, logs appear in console
node scripts/daily-sms-template-update.js

# For cron jobs, logs are typically in:
# Linux/Mac: /var/log/feeflow-sms-update.log
# Windows: Event Viewer or custom log file
```

### Common Issues

1. **Server Not Running**:
   ```
   ERROR: Connection refused
   ```
   Solution: Ensure your Next.js server is running on the configured port

2. **Template Fetch Failed**:
   ```
   ERROR: Failed to update SMS templates after all retries
   ```
   Solution: Check Google Sheets API access and template sheet structure

3. **Permission Denied**:
   ```
   ERROR: Access denied to Google Sheets
   ```
   Solution: Verify Google Sheets API credentials and spreadsheet sharing settings

### Health Check

The script performs a health check before updating:

```bash
# Manual health check
curl http://localhost:9002/api/sms-templates/update

# Should return success status
```

## Testing

### Test Template Updates

1. **Manual Update**:
   ```bash
   curl -X POST http://localhost:9002/api/sms-templates/update \
     -H "Content-Type: application/json" \
     -d '{"force": true}'
   ```

2. **Check Current Templates**:
   ```bash
   curl "http://localhost:9002/api/sms-templates/update?content=true"
   ```

3. **Test SMS Functionality**:
   Use the existing test scripts:
   ```bash
   node test-sms-templates.js
   ```

### Verify Daily Updates

Check the logs to ensure daily updates are working:

```bash
# Check for successful updates
grep "SMS templates updated successfully" /var/log/feeflow-sms-update.log

# Check for failures
grep "Failed to update SMS templates" /var/log/feeflow-sms-update.log
```

## Security Considerations

1. **API Security**: The update endpoint is currently public. Consider adding authentication if needed.
2. **Rate Limiting**: The system has built-in rate limiting through caching (5-minute TTL).
3. **Error Handling**: All errors are logged but not exposed to prevent information leakage.

## Performance

- **Caching**: Templates are cached for 5 minutes to reduce Google Sheets API calls
- **Retry Logic**: Automatic retry with exponential backoff for reliability
- **Timeout**: 30-second timeout for each request
- **Concurrent Requests**: Cache prevents concurrent template fetches

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check logs weekly for any update failures
2. **Verify Templates**: Test SMS functionality monthly
3. **Update Dependencies**: Keep Node.js and dependencies updated
4. **Backup Configuration**: Keep backups of your scheduling configuration

### Updating the System

When updating the FeeFlow application:

1. The template update system will continue to work as long as the API endpoint exists
2. Test the update functionality after major updates
3. Update the script configuration if the server URL or port changes

## Support

If you encounter issues:

1. Check the logs for specific error messages
2. Verify Google Sheets API access and credentials
3. Test the API endpoint manually
4. Check server status and network connectivity
5. Review Google Sheets template structure

For additional help, consult the main FeeFlow documentation or contact support.