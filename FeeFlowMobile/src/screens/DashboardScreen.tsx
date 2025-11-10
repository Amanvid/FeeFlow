import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreenProps } from '../navigation/types';
import { invoiceService } from '../api/invoices';
import { authService } from '../api/auth';
import { DashboardStats, Invoice } from '../types';

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, invoicesData] = await Promise.all([
        invoiceService.getDashboardStats(),
        invoiceService.getRecentInvoices(),
      ]);
      setStats(statsData);
      setRecentInvoices(invoicesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
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
      month: 'short',
      year: 'numeric',
    });
  };

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
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back!</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons name="file-document" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats?.totalInvoices || 0}</Text>
            <Text style={styles.statLabel}>Total Invoices</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons name="cash-check" size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats?.paidInvoices || 0}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons name="cash-clock" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats?.pendingInvoices || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons name="cash-remove" size={24} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats?.overdueInvoices || 0}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      </View>

      {/* Total Amount */}
      <View style={styles.totalAmountCard}>
        <View style={styles.totalAmountContent}>
          <View>
            <Text style={styles.totalAmountLabel}>Total Outstanding</Text>
            <Text style={styles.totalAmountValue}>
              {formatCurrency(stats?.totalOutstanding || 0)}
            </Text>
          </View>
          <View style={styles.totalAmountIcon}>
            <MaterialCommunityIcons name="currency-usd" size={32} color="#EF4444" />
          </View>
        </View>
      </View>

      {/* Recent Invoices */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Invoices')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentInvoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No recent invoices</Text>
          </View>
        ) : (
          <View style={styles.invoicesList}>
            {recentInvoices.map((invoice) => (
              <TouchableOpacity
                key={invoice.id}
                style={styles.invoiceCard}
                onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: invoice.id })}
              >
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(invoice.status) }
                  ]}>
                    <Text style={styles.statusText}>{invoice.status}</Text>
                  </View>
                </View>
                <View style={styles.invoiceDetails}>
                  <Text style={styles.invoiceStudent}>{invoice.studentName}</Text>
                  <Text style={styles.invoiceAmount}>{formatCurrency(invoice.totalAmount)}</Text>
                </View>
                <Text style={styles.invoiceDate}>{formatDate(invoice.dueDate)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return '#D1FAE5';
    case 'pending':
      return '#FEF3C7';
    case 'overdue':
      return '#FEE2E2';
    default:
      return '#F3F4F6';
  }
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    backgroundColor: '#3B82F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  totalAmountCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalAmountContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalAmountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  totalAmountIcon: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    padding: 12,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  invoicesList: {
    gap: 12,
  },
  invoiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  invoiceStudent: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});