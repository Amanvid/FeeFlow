import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PaymentScreenProps } from '../navigation/types';
import { paymentService } from '../api/payments';
import { invoiceService } from '../api/invoices';
import { Invoice } from '../types';

export default function PaymentScreen({ navigation }: PaymentScreenProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card'>('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingInvoices();
  }, []);

  const loadPendingInvoices = async () => {
    try {
      setLoading(true);
      const allInvoices = await invoiceService.getAllInvoices();
      const pendingInvoices = allInvoices.filter(
        invoice => invoice.status.toLowerCase() === 'pending' || invoice.status.toLowerCase() === 'overdue'
      );
      setInvoices(pendingInvoices);
    } catch (error) {
      Alert.alert('Error', 'Failed to load pending invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedInvoice) {
      Alert.alert('Error', 'Please select an invoice');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (paymentMethod === 'mobile_money' && !phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setProcessing(true);
    try {
      const response = await paymentService.createPayment({
        invoiceId: selectedInvoice,
        amount: parseFloat(amount),
        paymentMethod,
        phoneNumber: phoneNumber.trim(),
      });

      Alert.alert(
        'Payment Initiated',
        'Your payment has been initiated. Please complete the payment on your mobile device.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Invoices');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const selectedInvoiceData = invoices.find(inv => inv.id === selectedInvoice);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Make Payment</Text>
        <Text style={styles.headerSubtitle}>Pay your school fees securely</Text>
      </View>

      {/* Invoice Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Invoice</Text>
        {invoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-check-outline" size={48} color="#10B981" />
            <Text style={styles.emptyText}>No pending invoices</Text>
            <Text style={styles.emptySubtext}>All your invoices are paid!</Text>
          </View>
        ) : (
          <View style={styles.invoiceList}>
            {invoices.map((invoice) => (
              <TouchableOpacity
                key={invoice.id}
                style={[
                  styles.invoiceCard,
                  selectedInvoice === invoice.id && styles.selectedInvoiceCard,
                ]}
                onPress={() => {
                  setSelectedInvoice(invoice.id);
                  setAmount(invoice.totalAmount.toString());
                }}
              >
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
                  <Text style={styles.invoiceAmount}>{formatCurrency(invoice.totalAmount)}</Text>
                </View>
                <Text style={styles.studentName}>{invoice.studentName}</Text>
                <Text style={styles.dueDate}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
                {selectedInvoice === invoice.id && (
                  <View style={styles.checkIcon}>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {invoices.length > 0 && (
        <>
          {/* Payment Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Amount</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                editable={!!selectedInvoiceData}
              />
              <View style={styles.currencyContainer}>
                <Text style={styles.currencyText}>GHS</Text>
              </View>
            </View>
            {selectedInvoiceData && (
              <Text style={styles.fullAmountText}>
                Full amount: {formatCurrency(selectedInvoiceData.totalAmount)}
              </Text>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethodContainer}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'mobile_money' && styles.paymentMethodButtonActive,
                ]}
                onPress={() => setPaymentMethod('mobile_money')}
              >
                <MaterialCommunityIcons
                  name="cellphone"
                  size={24}
                  color={paymentMethod === 'mobile_money' ? '#3B82F6' : '#6B7280'}
                />
                <Text style={[
                  styles.paymentMethodText,
                  paymentMethod === 'mobile_money' && styles.paymentMethodTextActive,
                ]}>
                  Mobile Money
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'card' && styles.paymentMethodButtonActive,
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <MaterialCommunityIcons
                  name="credit-card"
                  size={24}
                  color={paymentMethod === 'card' ? '#3B82F6' : '#6B7280'}
                />
                <Text style={[
                  styles.paymentMethodText,
                  paymentMethod === 'card' && styles.paymentMethodTextActive,
                ]}>
                  Card
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number for Mobile Money */}
          {paymentMethod === 'mobile_money' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phone Number</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+233</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>
          )}

          {/* Pay Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.payButton, processing && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="lock" size={20} color="white" />
                  <Text style={styles.payButtonText}>Pay Securely</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.securityText}>
              🔒 Your payment is secure and encrypted
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}