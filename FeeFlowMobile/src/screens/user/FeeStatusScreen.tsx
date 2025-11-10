import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FeeStatusScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../../api/api';

interface FeeStatus {
  studentName: string;
  studentId: string;
  class: string;
  term: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
  lastPaymentDate?: string;
  dueDate: string;
}

export default function FeeStatusScreen({ navigation }: FeeStatusScreenProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FeeStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [childFeeStatus, setChildFeeStatus] = useState<FeeStatus | null>(null);

  useEffect(() => {
    loadChildFeeStatus();
  }, []);

  const loadChildFeeStatus = async () => {
    if (!user?.childName) return;

    try {
      setLoading(true);
      // Search for child's fee status
      const response = await apiService.searchFeeStatus(user.childName, user.childClass);
      if (response.success && response.data.length > 0) {
        setChildFeeStatus(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading child fee status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a student name or ID');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.searchFeeStatus(searchQuery);
      if (response.success) {
        setSearchResults(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to search fee status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search fee status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'partial':
        return '#F59E0B';
      case 'unpaid':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return 'check-circle';
      case 'partial':
        return 'alert-circle';
      case 'unpaid':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const FeeStatusCard = ({ feeStatus, isChild = false }: { feeStatus: FeeStatus; isChild?: boolean }) => (
    <View style={[styles.feeCard, isChild && styles.childFeeCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{feeStatus.studentName}</Text>
          <Text style={styles.studentClass}>{feeStatus.class}</Text>
          {isChild && <Text style={styles.childLabel}>Your Child</Text>}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feeStatus.status) + '20' }]}>
          <MaterialCommunityIcons
            name={getStatusIcon(feeStatus.status)}
            size={16}
            color={getStatusColor(feeStatus.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(feeStatus.status) }]}>
            {feeStatus.status.charAt(0).toUpperCase() + feeStatus.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.feeDetails}>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Term:</Text>
          <Text style={styles.feeValue}>{feeStatus.term}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Total Fees:</Text>
          <Text style={styles.feeValue}>KES {feeStatus.totalFees.toLocaleString()}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Paid Amount:</Text>
          <Text style={styles.feeValue}>KES {feeStatus.paidAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Balance:</Text>
          <Text style={[styles.feeValue, styles.balanceValue]}>
            KES {feeStatus.balance.toLocaleString()}
          </Text>
        </View>
        {feeStatus.lastPaymentDate && (
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Last Payment:</Text>
            <Text style={styles.feeValue}>{feeStatus.lastPaymentDate}</Text>
          </View>
        )}
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Due Date:</Text>
          <Text style={styles.feeValue}>{feeStatus.dueDate}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => navigation.navigate('InvoiceDetail', { studentId: feeStatus.studentId })}
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
        <MaterialCommunityIcons name="arrow-right" size={16} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fee Status</Text>
        <Text style={styles.headerSubtitle}>Check fee payment status</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search Student</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter student name or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Child's Fee Status */}
      {!loading && childFeeStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Child's Fee Status</Text>
          <FeeStatusCard feeStatus={childFeeStatus} isChild={true} />
        </View>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchResults.map((result, index) => (
            <FeeStatusCard key={index} feeStatus={result} />
          ))}
        </View>
      )}

      {/* No Results */}
      {!loading && searchQuery && searchResults.length === 0 && (
        <View style={styles.noResultsContainer}>
          <MaterialCommunityIcons name="account-search" size={48} color="#9CA3AF" />
          <Text style={styles.noResultsText}>No results found</Text>
          <Text style={styles.noResultsSubtext}>
            Try searching with a different name or student ID
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (user?.childName) {
                setSearchQuery(user.childName);
                handleSearch();
              }
            }}
          >
            <MaterialCommunityIcons name="account-child" size={24} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Check Child's Fees</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Payment')}
          >
            <MaterialCommunityIcons name="credit-card" size={24} color="#10B981" />
            <Text style={styles.actionButtonText}>Make Payment</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  searchSection: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  feeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  childFeeCard: {
    borderColor: '#3B82F6',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  childLabel: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  feeDetails: {
    marginBottom: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  feeValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  balanceValue: {
    color: '#EF4444',
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  detailsButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    fontWeight: '600',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
});