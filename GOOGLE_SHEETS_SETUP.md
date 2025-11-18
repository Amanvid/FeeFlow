# Google Sheets Integration Setup

This document explains how to set up Google Sheets integration for saving settings and invoices in FeeFlow.

## Prerequisites

1. A Google Cloud Project with Google Sheets API enabled
2. A service account with access to the spreadsheet
3. The spreadsheet ID of your Google Sheets document

## Setup Steps

### 1. Create Google Cloud Project and Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `feeflow-sheets-service`
   - Description: `Service account for FeeFlow Google Sheets integration`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

### 3. Generate Service Account Key

1. Click on your newly created service account
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format and click "Create"
5. Save the downloaded JSON file securely

### 4. Share Google Sheet with Service Account

1. Open your Google Sheets document
2. Click "Share" button
3. Add the service account email (from the JSON file) as an editor
4. Click "Send" (no email will actually be sent to the service account)

### 5. Configure Environment Variables

Update your `.env.local` file with the following values from your service account JSON:

```env
# Google Sheets Configuration
NEXT_PUBLIC_SPREADSHEET_ID=your-spreadsheet-id-here

# Google Sheets API Credentials (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n
# Force Google Sheets usage
USE_GOOGLE_SHEETS=true
FORCE_GOOGLE_SHEETS=true
```

**Note**: The private key should have `\n` characters instead of actual newlines.

## Data Structure

The Google Sheets integration saves data to the following sheets:

### Settings Sheet ("Settings")
- Notification settings (SMS enabled, fee reminders, payment notifications, admission notifications)
- Updated when settings are saved in the admin panel

### Invoices Sheet ("Invoices")
- Invoice details (invoice number, student name, guardian info, amounts, payment status)
- Updated when new invoices are created or payment status changes

## API Endpoints

- `POST /api/school-config` - Updates notification settings in Google Sheets
- `POST /api/update-invoice-status` - Updates invoice payment status in Google Sheets
- `POST /api/finalize-purchase` - Updates invoice status when payment is confirmed

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**: Ensure the service account has editor access to the spreadsheet
2. **"API not enabled" errors**: Make sure Google Sheets API is enabled in your Google Cloud project
3. **Invalid private key**: Ensure the private key is properly formatted with `\n` characters

### Testing

To test the integration:

1. Update notification settings in the admin panel
2. Create a new fee claim/invoice
3. Process a payment and check if the invoice status updates

## Security Notes

- Keep your service account credentials secure and never commit them to version control
- Use environment variables for all sensitive configuration
- Regularly rotate service account keys
- Monitor API usage in Google Cloud Console