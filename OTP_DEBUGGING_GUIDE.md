# OTP Verification Debugging Guide

## Issue Summary
The mobile app is showing "Invalid OTP" despite the API returning a successful response with the correct format.

## Recent Changes Made

### 1. Updated API Configuration
- Changed `API_BASE_URL` from `http://localhost:9002/api` to `https://fee-flow-five.vercel.app/api`
- This connects the mobile app to the live Vercel deployment

### 2. Fixed Parameter Order
- Fixed `verifyOtp` function in `FeeFlowMobile/src/api/auth.ts`
- Changed from `(username, phone, otp)` to match API expectation of `(phone, otp, username)`

### 3. Enhanced Error Handling
- Added detailed debug logging to both `authService.verifyOtp` and `LoginScreen.handleVerifyOtp`
- Improved error response handling to return proper error messages instead of throwing exceptions

### 4. Updated Response Format
- Added `success` and `message` fields to `AuthResponse` type
- Ensured mobile app receives proper response structure

## Current API Response Format

When OTP verification is successful, the API returns:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "username": "SuperAdmin",
    "role": "SuperAdmin"
  }
}
```

## Debugging Steps

### 1. Check Console Logs
The mobile app now includes extensive debug logging. Check your React Native console for:
- `Attempting OTP verification with:` - Shows the data being sent
- `OTP Verification Response:` - Shows the complete API response
- `Response type:` and `Response keys:` - Shows response structure
- `Response.success:` - Shows the actual success value
- `✅ OTP verification successful` or `❌ OTP verification failed` - Final result

### 2. Test the API Directly
You can test the API endpoints directly:

**Send OTP:**
```bash
curl -X POST https://fee-flow-five.vercel.app/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"test@example.com","username":"SuperAdmin"}'
```

**Verify OTP:**
```bash
curl -X POST https://fee-flow-five.vercel.app/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"test@example.com","otp":"131700","username":"SuperAdmin"}'
```

### 3. Common Issues and Solutions

#### "Recipient number is invalid"
- **Cause**: The API expects a phone number but receives an email
- **Solution**: The system now automatically falls back to email verification when SMS fails

#### "Invalid OTP" with correct response
- **Cause**: Mobile app not properly parsing the response
- **Solution**: Check the debug logs to see the exact response format

#### Network timeouts
- **Cause**: Vercel cold starts or network issues
- **Solution**: Wait a few seconds and try again

### 4. Expected Flow

1. User enters username and phone/email
2. App calls `/api/auth/send-otp`
3. API generates and sends OTP (shows in console for development)
4. User enters OTP
5. App calls `/api/auth/verify-otp`
6. API returns success response
7. App navigates to Main dashboard

## Next Steps

1. **Run the mobile app** and check the console logs for detailed debugging information
2. **Test the API directly** using the curl commands above
3. **Check the exact error message** in the mobile app logs
4. **Verify the admin user exists** in your Google Sheets "Admin" tab

The system should now work correctly with the live Vercel API. The enhanced error handling and debugging will help identify any remaining issues.