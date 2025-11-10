// Navigation types for TypeScript support

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  UserMain: undefined;
  InvoiceDetail: { invoiceId: string };
  UserRegistration: undefined;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Invoices: undefined;
  Payment: undefined;
  Profile: undefined;
};

export type UserTabParamList = {
  Home: undefined;
  FeeStatus: undefined;
  Profile: undefined;
  School: undefined;
};

// Screen prop types
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type DashboardScreenProps = BottomTabScreenProps<RootTabParamList, 'Dashboard'>;
export type InvoicesScreenProps = BottomTabScreenProps<RootTabParamList, 'Invoices'>;
export type PaymentScreenProps = BottomTabScreenProps<RootTabParamList, 'Payment'>;
export type ProfileScreenProps = BottomTabScreenProps<RootTabParamList, 'Profile'>;
export type InvoiceDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'InvoiceDetail'>;

// User screen props
export type UserDashboardScreenProps = BottomTabScreenProps<UserTabParamList, 'Home'>;
export type FeeStatusScreenProps = BottomTabScreenProps<UserTabParamList, 'FeeStatus'>;
export type UserProfileScreenProps = BottomTabScreenProps<UserTabParamList, 'Profile'>;
export type SchoolLandingScreenProps = BottomTabScreenProps<UserTabParamList, 'School'>;
export type UserRegistrationScreenProps = NativeStackScreenProps<RootStackParamList, 'UserRegistration'>;