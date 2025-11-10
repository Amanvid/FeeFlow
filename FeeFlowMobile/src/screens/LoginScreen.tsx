import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LoginScreenProps } from '../navigation/types';
import { authService } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login, mobileLogin } = useAuth();
  const [loginMode, setLoginMode] = useState<'admin' | 'user'>('admin');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(phone);
      setShowOtp(true);
      Alert.alert('Success', 'OTP sent to your phone');
    } catch (error) {
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('BALANCE_NOT_ENOUGH')) {
          errorMessage = 'SMS service temporarily unavailable. Please contact support or try again later.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('Recipient number is invalid')) {
          errorMessage = 'Invalid phone number format. Please use format: +2567XXXXXXXX or your email address.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Email verification sent! Please check your email for the verification code.';
          setShowOtp(true);
          Alert.alert('Success', errorMessage);
          return;
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp(username, phone, otp);
      if (response.success) {
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Main'),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const success = await mobileLogin(username, password);
      if (success) {
        Alert.alert('Success', 'Login successful!', [
          {
            text: 'OK',
            onPress: () => navigation.replace('UserMain'),
          },
        ]);
      } else {
        Alert.alert('Error', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegister = () => {
    navigation.navigate('UserRegistration');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>F</Text>
          </View>
          <Text style={styles.appTitle}>FeeFlow</Text>
          <Text style={styles.appSubtitle}>School Fee Management</Text>
        </View>

        {/* Login Mode Selection */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, loginMode === 'admin' && styles.modeButtonActive]}
            onPress={() => setLoginMode('admin')}
          >
            <Text style={[styles.modeButtonText, loginMode === 'admin' && styles.modeButtonTextActive]}>
              Admin Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, loginMode === 'user' && styles.modeButtonActive]}
            onPress={() => setLoginMode('user')}
          >
            <Text style={[styles.modeButtonText, loginMode === 'user' && styles.modeButtonTextActive]}>
              User Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          {loginMode === 'admin' ? (
            !showOtp ? (
              <>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
                <Text style={styles.helpText}>Use your registered admin username</Text>
                <Text style={styles.label}>Phone Number or Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter phone (+2567XXXXXXXX) or email"
                  keyboardType="default"
                  value={phone}
                  onChangeText={setPhone}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={6}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Verify OTP</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    setShowOtp(false);
                    setOtp('');
                  }}
                >
                  <Text style={styles.linkText}>Back to Phone Number</Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleUserLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleUserRegister}
              >
                <Text style={styles.linkText}>Don't have an account? Register</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: -12,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: 'white',
  },
  modeButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#3B82F6',
  },
});