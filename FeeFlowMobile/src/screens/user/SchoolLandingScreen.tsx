import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SchoolLandingScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SchoolInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  motto: string;
  established: string;
  principal: string;
  logo: string;
}

const schoolInfo: SchoolInfo = {
  name: "Cornerstone Educational Centre",
  address: "P.O. Box 1234-00200, Nairobi, Kenya",
  phone: "+254 700 123 456",
  email: "info@cornerstone.ac.ke",
  website: "www.cornerstone.ac.ke",
  motto: "Education for Excellence",
  established: "2010",
  principal: "Mr. John Doe",
  logo: "https://via.placeholder.com/100x100/3B82F6/FFFFFF?text=CEC",
};

export default function SchoolLandingScreen({ navigation }: SchoolLandingScreenProps) {
  const { user } = useAuth();

  const handleContact = (type: 'phone' | 'email' | 'website') => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${schoolInfo.phone.replace(/\s/g, '')}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${schoolInfo.email}`);
        break;
      case 'website':
        Linking.openURL(`https://${schoolInfo.website}`);
        break;
    }
  };

  const handleNavigation = (screen: string) => {
    navigation.navigate(screen as any);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>School Information</Text>
        <Text style={styles.headerSubtitle}>Welcome to {schoolInfo.name}</Text>
      </View>

      {/* School Overview */}
      <View style={styles.overviewSection}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: schoolInfo.logo }} style={styles.logo} />
        </View>
        <Text style={styles.schoolName}>{schoolInfo.name}</Text>
        <Text style={styles.motto}>{schoolInfo.motto}</Text>
        <Text style={styles.established}>Established {schoolInfo.established}</Text>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome, {user?.name || 'Parent'}!</Text>
        <Text style={styles.welcomeText}>
          Thank you for choosing {schoolInfo.name} for your child's education. 
          We are committed to providing quality education and fostering excellence 
          in every student. Use this app to stay updated on your child's progress, 
          fee status, and school announcements.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigation('FeeStatus')}
          >
            <MaterialCommunityIcons name="currency-usd" size={32} color="#3B82F6" />
            <Text style={styles.actionTitle}>Check Fees</Text>
            <Text style={styles.actionDescription}>View fee status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigation('Profile')}
          >
            <MaterialCommunityIcons name="account" size={32} color="#10B981" />
            <Text style={styles.actionTitle}>Profile</Text>
            <Text style={styles.actionDescription}>Update your profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigation('Payment')}
          >
            <MaterialCommunityIcons name="credit-card" size={32} color="#F59E0B" />
            <Text style={styles.actionTitle}>Pay Fees</Text>
            <Text style={styles.actionDescription}>Make payments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => handleNavigation('Home')}
          >
            <MaterialCommunityIcons name="home" size={32} color="#8B5CF6" />
            <Text style={styles.actionTitle}>Dashboard</Text>
            <Text style={styles.actionDescription}>Go to dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* School Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>School Details</Text>
        
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{schoolInfo.address}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="account-tie" size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Principal</Text>
            <Text style={styles.infoValue}>{schoolInfo.principal}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => handleContact('phone')}
        >
          <MaterialCommunityIcons name="phone" size={20} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={[styles.infoValue, styles.clickable]}>{schoolInfo.phone}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => handleContact('email')}
        >
          <MaterialCommunityIcons name="email" size={20} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={[styles.infoValue, styles.clickable]}>{schoolInfo.email}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => handleContact('website')}
        >
          <MaterialCommunityIcons name="web" size={20} color="#3B82F6" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Website</Text>
            <Text style={[styles.infoValue, styles.clickable]}>{schoolInfo.website}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* School Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose Us?</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="school" size={24} color="#3B82F6" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Quality Education</Text>
              <Text style={styles.featureDescription}>
                Experienced teachers and modern teaching methods
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="account-group" size={24} color="#10B981" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Small Class Sizes</Text>
              <Text style={styles.featureDescription}>
                Personalized attention for every student
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="laptop" size={24} color="#F59E0B" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Modern Facilities</Text>
              <Text style={styles.featureDescription}>
                Computer labs and digital learning resources
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="bus" size={24} color="#8B5CF6" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Transport Services</Text>
              <Text style={styles.featureDescription}>
                Safe and reliable school transport
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Contact CTA */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need Help?</Text>
        <Text style={styles.contactText}>
          Contact us for any questions about fees, admissions, or school programs.
        </Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContact('phone')}
        >
          <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" />
          <Text style={styles.contactButtonText}>Call Us Now</Text>
        </TouchableOpacity>
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
  overviewSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  motto: {
    fontSize: 16,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  established: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  welcomeSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  quickActionsSection: {
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  clickable: {
    color: '#3B82F6',
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactSection: {
    backgroundColor: '#3B82F6',
    padding: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});