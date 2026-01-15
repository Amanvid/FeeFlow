# Vercel Deployment Guide for FeeFlow with Google Sheets

This guide explains how to deploy FeeFlow to Vercel with Google Sheets as the primary data source.

## Prerequisites

1. **Google Sheets Setup**: Ensure your Google Sheets document is publicly accessible or shared with appropriate permissions
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Environment Variables

Set these environment variables in your Vercel dashboard:
cxxxxf   
```bash
# Required - Google Sheets Configuration
NEXT_PUBLIC_SPREADSHEET_ID=1WHkw5YaVbnHjWD2nwTcYnQfIYV7PxascjEzY7FqL4Ew

# Required - Session Configuration
SESSION_SECRET=your-secure-random-string-here

# Optional - App Configuration
NEXT_PUBLIC_APP_NAME=FeeFlow
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Optional - Force Google Sheets usage
USE_GOOGLE_SHEETS=true
FORCE_GOOGLE_SHEETS=true
```

## Google Sheets Setup

### Making Google Sheets Publicly Accessible

For Vercel deployment, your Google Sheets document needs to be publicly accessible. Here's how:

1. **Open your Google Sheets document**
2. **Click "Share" button (top right)**
3. **Click "Change to anyone with the link"**
4. **Set permission to "Viewer"**
5. **Copy the sharing link**
6. **Extract the spreadsheet ID from the URL** (the long string between `/d/` and `/edit`)

### Google Sheets Structure

Your Google Sheets document should have these sheets:

#### 1. Template Sheet
- Contains the Sender ID for SMS messages
- Column: `Sender ID`

#### 2. Config Sheet
- Contains school configuration
- Columns: `School Name`, `Address`, `Momo number`, `Due Date`, `Invoice number`

#### 3. Metadata Sheet
- Contains student data
- Columns: `No.`, `NAME`, `GRADE`, `Student Type`, `Total Balance`, `ARREAS`, `BOOKS Fees`, `School Fees AMOUNT`, `INTIAL AMOUNT PAID`, `PAYMENT`, `BOOKS Fees Payment`, `GENDER`, `Guardian Name`, `Guardian Phone`

#### 4. Admin Sheet
- Contains admin user credentials
- Columns: `Username`, `Password`, `Role`

## Deployment Steps

1. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables**: Add the variables listed above in your Vercel dashboard

3. **Deploy**: Vercel will automatically deploy your application

## Verification

After deployment, run the verification script:

```bash
node scripts/verify-google-sheets.js
```

This will test the connection to all Google Sheets and verify data accessibility.

## Troubleshooting

### Google Sheets Access Issues
- Ensure your Google Sheets document is publicly accessible
- Check that the SPREADSHEET_ID is correct
- Verify sheet names match exactly (case-sensitive)

### Data Not Loading
- Check Vercel function logs for detailed error messages
- Verify environment variables are set correctly
- Test the Google Sheets URLs manually in browser

### Performance Issues
- Google Sheets has rate limits for public access
- Consider implementing caching for frequently accessed data
- Monitor Vercel function execution time

## Security Notes

- Never commit sensitive credentials to your repository
- Use strong SESSION_SECRET values
- Consider implementing rate limiting for API endpoints
- Monitor your Google Sheets access logs

## Support

For issues specific to:
- **Google Sheets**: Check [Google Sheets API documentation](https://developers.google.com/sheets/api)
- **Vercel**: Check [Vercel documentation](https://vercel.com/docs)
- **FeeFlow**: Create an issue in this repository