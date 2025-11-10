import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { UserRegistrationScreenProps } from '../../navigation/types';
import { authService } from '../../api/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function UserRegistrationScreen({ navigation }: UserRegistrationScreenProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    contact: '',
    address: '',
    residence: '',
    password: '',
    confirmPassword: '',
    childName: '',
    childClass: '',
    dateOfBirth: '',
    role: 'parent' as 'parent' | 'guardian',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.residence.trim()) newErrors.residence = 'Residence is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.childName.trim()) newErrors.childName = "Child's name is required";
    if (!formData.childClass.trim()) newErrors.childClass = "Child's class is required";
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = "Date of birth is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation (Kenyan format)
    const phoneRegex = /^\+254\d{9}$|^0\d{9}$/;
    if (formData.contact && !phoneRegex.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid Kenyan phone number';
    }

    // Date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (formData.dateOfBirth && !dateRegex.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter date in YYYY-MM-DD format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await authService.mobileRegister({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        contact: formData.contact,
        address: formData.address,
        residence: formData.residence,
        password: formData.password,
        childName: formData.childName,
        childClass: formData.childClass,
        dateOfBirth: formData.dateOfBirth,
        role: formData.role,
        registrationDate: new Date().toISOString(),
        isActive: true,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Registration successful! Please login to continue.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', response.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderInput = (
    field: keyof typeof formData,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError, multiline && styles.multilineInput]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(text) => updateFormData(field, text)}
        keyboardType={keyboardType}
        multiline={multiline}
        secureTextEntry={field.includes('password')}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parent Registration</Text>
        <Text style={styles.headerSubtitle}>Create your account to access fee information</Text>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        {renderInput('name', 'Full Name *')}
        {renderInput('username', 'Username *')}
        {renderInput('email', 'Email Address *', 'email-address')}
        {renderInput('contact', 'Phone Number *', 'phone-pad')}
        {renderInput('address', 'Home Address *', 'default', true)}
        {renderInput('residence', 'Area of Residence *')}
        {renderInput('password', 'Password *')}
        {renderInput('confirmPassword', 'Confirm Password *')}
      </View>

      {/* Child Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Child Information</Text>
        
        {renderInput('childName', "Child's Full Name *")}
        {renderInput('childClass', "Child's Class *")}
        {renderInput('dateOfBirth', 'Date of Birth (YYYY-MM-DD) *', 'numeric')}

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>Your Role *</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'parent' && styles.roleButtonSelected,
              ]}
              onPress={() => updateFormData('role', 'parent')}
            >
              <Text style={[
                styles.roleButtonText,
                formData.role === 'parent' && styles.roleButtonTextSelected,
              ]}>
                Parent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'guardian' && styles.roleButtonSelected,
              ]}
              onPress={() => updateFormData('role', 'guardian')}
            >
              <Text style={[
                styles.roleButtonText,
                formData.role === 'guardian' && styles.roleButtonTextSelected,
              ]}>
                Guardian
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By registering, you agree to our terms of service and privacy policy.
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitButtonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginLinkText}>
          Already have an account? <Text style={styles.loginLinkHighlight}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  roleContainer: {
    marginTop: 16,
  },
  roleLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  roleButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  termsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLinkHighlight: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});