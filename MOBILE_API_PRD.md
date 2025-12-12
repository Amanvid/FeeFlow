# Mobile App API Documentation (PRD)

## Base URL
`https://fee-flow-five.vercel.app/api`

## Authentication APIs

### Admin Authentication
- **POST** `/auth/login` - Admin login (username/password)
- **POST** `/auth/verify-otp` - Verify OTP and create session
- **POST** `/auth/logout` - Logout admin user

### Teacher Authentication  
- **POST** `/auth/teacher-login` - Teacher login
- **POST** `/auth/verify-otp` - Verify OTP for teachers
- **GET** `/auth/teacher-session` - Get current teacher session
- **POST** `/auth/teacher-logout` - Logout teacher
- **POST** `/auth/send-otp` - Send OTP code

## Student Management APIs

### Student Data
- **GET** `/students` - Get all students
- **GET** `/students/{id}` - Get student by ID
- **POST** `/add-student` - Add new student

### Class-based Student Data
- **GET** `/teacher/students/{className}` - Get students by class (teacher authenticated)
  - Requires teacher session
  - Returns detailed student info with fee breakdown

## Class Management APIs
- **GET** `/classes` - Get all classes from metadata
- **GET** `/teacher/classes` - Get classes for teacher view

## SBA (School-Based Assessment) APIs

### Assessment Data
- **GET** `/sba/class-assessment?className={className}&subject={subject}&term={term}` - Get SBA assessment data
  - Supports classes: `Creche`, `Nursery 1`, `BS 1`, `BS 2`, `BS 3`, `BS 4`, `BS 5`
  - Subjects: `Literacy`, `Numeracy`, `Colouring`, `Writing`, `Scribbling`
  - Terms: `1`, `2`, `3`

### Student Management
- **GET** `/sba/{id}` - Get SBA student by ID
- **POST** `/sba/create-student` - Create SBA student
- **POST** `/sba/update-student` - Update SBA student data
- **POST** `/sba/update-creche` - Update Creche student data

### Position Updates
- **POST** `/sba/update-positions` - Auto-calculate and update student positions
  - Body: `{ className: string, subject: string, term: string }`

### Sheet Management
- **POST** `/sba/create-sheets` - Create new assessment sheets
- **POST** `/sba/seed` - Seed initial data
- **POST** `/sba/init` - Initialize SBA system

## Payment & Fee Management APIs

### Payment Processing
- **POST** `/record-payment` - Record student payment
- **POST** `/add-payment` - Add payment entry
- **POST** `/create-invoice` - Create new invoice
- **POST** `/update-invoice-status` - Update invoice status
- **GET** `/invoice-status` - Get invoice status

### Payment Verification
- **POST** `/payments/send-verification-code` - Send payment verification code
- **POST** `/payments/verify-code` - Verify payment code

### Mobile Money Integration
- **POST** `/finalize-purchase` - Finalize mobile money purchase
- **POST** `/generate-gh-qr` - Generate Ghana QR code for payments

## Communication APIs

### SMS Templates
- **POST** `/sms-templates/update` - Update SMS notification templates

## Admin Management APIs

### Teacher Management
- **GET** `/admin/teachers` - Get all teachers
- **GET** `/admin/non-teachers` - Get non-teaching staff

### School Configuration
- **GET** `/school-config` - Get school configuration

## Debug & Testing APIs

### Test Endpoints
- **GET** `/test-students` - Test student data
- **GET** `/test-teachers` - Test teacher data
- **GET** `/test-env` - Test environment variables

### Debug Endpoints
- **GET** `/debug` - General debug info
- **GET** `/debug/teachers` - Debug teacher data
- **GET** `/debug/sheet-info?sheetName={sheetName}&range={range}` - Debug Google Sheets data

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "status": 400/401/500
}
```

## Authentication Headers
- Admin endpoints: Session-based authentication
- Teacher endpoints: Include session token in headers
- Public endpoints: No authentication required

## Rate Limiting
- Standard rate limits apply per endpoint
- Payment verification endpoints have stricter limits

## Error Codes
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid credentials/session)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Mobile App Integration Notes

1. **Base URL Configuration**: Configure base URL in mobile app settings
2. **Error Handling**: Implement proper error handling for network failures
3. **Offline Support**: Cache essential data (students, classes) for offline access
4. **Real-time Updates**: Use polling or WebSockets for real-time data updates
5. **Security**: Implement certificate pinning for API calls
6. **Data Sync**: Implement background sync for offline actions

## Priority APIs for Mobile App MVP

### Essential APIs (Phase 1)
1. Authentication endpoints (`/auth/*`)
2. Student data endpoints (`/students`, `/teacher/students/{className}`)
3. Class management (`/classes`)
4. SBA assessment data (`/sba/class-assessment`)

### Secondary APIs (Phase 2)
1. Payment processing endpoints
2. Student creation/update endpoints
3. Position update endpoints
4. Communication APIs

### Advanced APIs (Phase 3)
1. Admin management endpoints
2. Advanced reporting endpoints
3. Real-time notification systems



"Perfect! I can see the dev server is running on port 9002. Now let me provide you with the complete list of API endpoints for mobile development:

🚀 Dev API URLs for Mobile Development
Base URL: http://localhost:9002/api

🔐 Authentication Endpoints
Bash



Run
# Admin Login (Step 1)POST http://localhost:9002/api/auth/loginBody: { "username": "admin", "password": "password" }# Verify OTP (Step 2) - Creates sessionPOST http://localhost:9002/api/auth/verify-otp  Body: { "phone": "+233XXXXXXXXX", "otp": "123456", "username": "admin" }# Teacher LoginPOST http://localhost:9002/api/auth/teacher-loginBody: { "phone": "+233XXXXXXXXX", "password": "password" }# Send OTPPOST http://localhost:9002/api/auth/send-otpBody: { "phone": "+233XXXXXXXXX" }# LogoutPOST http://localhost:9002/api/auth/logoutPOST http://localhost:9002/api/auth/teacher-logout
👨‍🏫 Teacher Dashboard Endpoints
Bash



Run
# Get Teacher Classes (requires session)GET http://localhost:9002/api/teacher/classes# Get Students by Class (requires session)GET http://localhost:9002/api/teacher/students/{className}Example: GET http://localhost:9002/api/teacher/students/Nursery%202# Get Staff Contacts (requires session)GET http://localhost:9002/api/teacher/staff-contacts
📊 SBA Assessment Endpoints
Bash



Run
# Get Class Assessment Data (requires session)GET http://localhost:9002/api/sba/class-assessment?className=Nursery%202&subject=Pre-writing&term=1# Update Student Assessment (requires session)PUT http://localhost:9002/api/sba/update-studentBody: {   "className": "Nursery 2",  "subject": "Pre-writing",   "term": "1",  "studentName": "John Doe",  "individualTestScore": 25,  "classTestScore": 28,  "endOfTermScore": 75}# Update Positions (requires session)POST http://localhost:9002/api/sba/update-positionsBody: {   "className": "Nursery 2",   "subject": "Pre-writing",  "term": "1" }# Get Individual Student SBA (public)GET http://localhost:9002/api/sba/{id}
👥 Student Management
Bash



Run
# Get All Students (requires session)GET http://localhost:9002/api/students# Get Student by ID (requires session)GET http://localhost:9002/api/students/{id}# Add New Student (requires session)POST http://localhost:9002/api/add-studentBody: {   "studentName": "New Student",  "class": "Nursery 2",  "parentPhone": "+233XXXXXXXXX"}
🏫 Class Management
Bash



Run
# Get All Classes (requires session)GET http://localhost:9002/api/classes# Get School Configuration (public)GET http://localhost:9002/api/school-config
💳 Payment Endpoints
Bash



Run
# Create InvoicePOST http://localhost:9002/api/create-invoiceBody: { "amount": 100, "description": "School Fees" }# Check Invoice StatusGET http://localhost:9002/api/invoice-status?id={invoiceId}# Finalize PurchasePOST http://localhost:9002/api/finalize-purchaseBody: { "invoiceId": "invoice_123", "paymentMethod": "mobile_money" }# Generate Ghana QR CodePOST http://localhost:9002/api/generate-gh-qrBody: { "amount": 100, "description": "School Fees" }# Send Payment Verification CodePOST http://localhost:9002/api/payments/send-verification-codeBody: { "phone": "+233XXXXXXXXX" }# Verify Payment CodePOST http://localhost:9002/api/payments/verify-codeBody: { "phone": "+233XXXXXXXXX", "code": "123456" }
📝 SMS & Communication
Bash



Run
# Update SMS Templates (requires session)POST http://localhost:9002/api/sms-templates/updateBody: { "templateType": "payment_confirmation", "content": "Payment received!" }
🔧 Debug Endpoints
Bash



Run
# General Debug InfoGET http://localhost:9002/api/debug# Sheet Info DebugGET http://localhost:9002/api/debug/sheet-info# Teachers DebugGET http://localhost:9002/api/debug/teachers
📱 Mobile Development Notes
Authentication Flow
Admin: Use /auth/login → /auth/verify-otp (with phone OTP)
Teacher: Use /auth/teacher-login (direct with phone/password)
Session Management
Sessions are handled via HTTP cookies
Include credentials in your mobile requests
Sessions expire after inactivity
Error Responses
All endpoints return standardized JSON:

JSON



{  "success": true/false,  "message": "Error or success   message",  "data": { ... }}
Testing Data
Based on the logs I can see:

Nursery 2 class has 24 students
Subjects available: Literacy, Numeracy, Colouring, Writing, Pre-writing
Terms: 1st Term, 2nd Term, 3rd Term
The server is currently running and ready for mobile development testing!"