import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InvoiceDetailScreenProps } from '../navigation/types';
import { invoiceService } from '../api/invoices';
import { Invoice } from '../types';

export default function InvoiceDetailScreen({ navigation, route }: InvoiceDetailScreenProps) {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoiceDetails();
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getInvoiceById(invoiceId);
      setInvoice(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load invoice details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { backgroundColor: '#D1FAE5', textColor: '#065F46' };
      case 'pending':
        return { backgroundColor: '#FEF3C7', textColor: '#92400E' };
      case 'overdue':
        return { backgroundColor: '#FEE2E2', textColor: '#991B1B' };
      default:
        return { backgroundColor: '#F3F4F6', textColor: '#374151' };
    }
  };

  const handleMakePayment = () => {
    navigation.navigate('Payment');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Invoice not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = getStatusColor(invoice.status);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Invoice Header */}
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>Issued: {formatDate(invoice.issueDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
            {invoice.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Student Information */}
      <View style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <MaterialCommunityIcons name="account" size={24} color="#3B82F6" />
          <Text style={styles.studentTitle}>Student Information</Text>
        </View>
        <View style={styles.studentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{invoice.studentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Class:</Text>
            <Text style={styles.infoValue}>{invoice.studentClass}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID:</Text>
            <Text style={styles.infoValue}>{invoice.studentId}</Text>
          </View>
        </View>
      </View>

      {/* Invoice Items */}
      <View style={styles.itemsCard}>
        <View style={styles.itemsHeader}>
          <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#3B82F6" />
          <Text style={styles.itemsTitle}>Invoice Items</Text>
        </View>
        <View style={styles.itemsList}>
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemDescription}>{item.description}</Text>
                <Text style={styles.itemQuantity}>{item.quantity} × {formatCurrency(item.unitPrice)}</Text>
              </View>
              <Text style={styles.itemTotal}>{formatCurrency(item.totalPrice)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.itemsDivider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatCurrency(invoice.totalAmount)}</Text>
        </View>
      </View>

      {/* Payment Information */}
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <MaterialCommunityIcons name="cash-clock" size={24} color="#3B82F6" />
          <Text style={styles.paymentTitle}>Payment Information</Text>
        </View>
        <View style={styles.paymentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Due Date:</Text>
            <Text style={styles.infoValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, { color: statusStyle.textColor }]}>
              {invoice.status}
            </Text>
          </View>
          {invoice.paidAmount > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Paid Amount:</Text>
              <Text style={styles.infoValue}>{formatCurrency(invoice.paidAmount)}</Text>
            </View>
          )}
          {invoice.paidAmount < invoice.totalAmount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Remaining:</Text>
              <Text style={[styles.infoValue, { color: '#EF4444', fontWeight: '600' }]}>
                {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {invoice.status.toLowerCase() !== 'paid' && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.payButton} onPress={handleMakePayment}>
            <MaterialCommunityIcons name="credit-card" size={20} color="white" />
            <Text style={styles.payButtonText}>Make Payment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Generated by FeeFlow System</Text>
        <Text style={styles.footerSubtext}>
          For any questions, please contact the school administration
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  invoiceHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  studentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  studentInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  itemsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemTotal: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  itemsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  paymentInfo: {
    gap: 12,
  },
  actionContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  payButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
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
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});