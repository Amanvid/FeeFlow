# FeeFlow Mobile App

A React Native mobile application for FeeFlow - School Fee Management System. This app allows students and parents to view invoices, make payments, and track their fee status.

## Features

- **Secure Authentication**: OTP-based login system
- **Dashboard**: Overview of invoices, payments, and outstanding amounts
- **Invoice Management**: View all invoices with filtering and search capabilities
- **Payment Processing**: Secure mobile money and card payments
- **Profile Management**: User profile and settings
- **Real-time Updates**: Live invoice status and payment tracking

## Tech Stack

- **React Native** with **TypeScript**
- **Expo** for development and deployment
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **Axios** for API calls
- **AsyncStorage** for local storage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on your device**:
   - Scan the QR code with the Expo Go app (iOS/Android)
   - Or press `i` for iOS simulator
   - Or press `a` for Android emulator

### API Configuration

The mobile app is configured to connect to your Vercel deployment. Update the API base URL in `src/config/api.ts` if needed:

```typescript
// Available deployments:
export const DEPLOYMENT_URLS = {
  primary: "https://fee-flow-five.vercel.app/api",
  alternative1: "https://fee-flow-git-main-ghub-it-centers-projects.vercel.app/api",
  alternative2: "https://fee-flow-k6097t0s0-ghub-it-centers-projects.vercel.app/api",
};
```

Change the `CURRENT_DEPLOYMENT` variable to switch between different deployments.

## Project Structure

```
src/
├── api/              # API service functions
├── components/       # Reusable UI components
├── config/          # Configuration files
├── navigation/      # Navigation setup and types
├── screens/         # Screen components
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Features Overview

### Authentication
- Phone number verification with OTP
- Secure token-based authentication
- Automatic login persistence

### Dashboard
- Quick stats overview
- Recent invoices display
- Outstanding amount summary

### Invoices
- List all invoices with status indicators
- Search and filter functionality
- Detailed invoice view with items breakdown

### Payments
- Multiple payment methods (Mobile Money, Card)
- Secure payment processing
- Payment history tracking

### Profile
- User information display
- App settings and preferences
- Logout functionality

## API Endpoints

The mobile app connects to your existing Next.js backend API:

- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/invoices` - Get all invoices for authenticated user
- `GET /api/invoices/:id` - Get specific invoice details
- `POST /api/payments` - Create new payment
- `GET /api/dashboard` - Get dashboard statistics

## Security Features

- OTP-based authentication
- Secure API communication
- Local data encryption
- Payment security compliance

## Deployment

### Build for Production

1. **iOS Build**:
   ```bash
   expo build:ios
   ```

2. **Android Build**:
   ```bash
   expo build:android
   ```

### Submit to App Stores

Follow the standard app store submission process:
- **Apple App Store**: Use App Store Connect
- **Google Play Store**: Use Play Console

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run typescript
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

## License

This project is licensed under the MIT License.