import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { UserProfileScreenProps } from '../../navigation/types';
import { useAuth } from '../../hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { MobileUser } from '../../types';

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [profileImage, setProfileImage] = useState(user && 'profilePicture' in user ? user.profilePicture : undefined);
  const [childImage, setChildImage] = useState(user && 'childPicture' in user ? user.childPicture : undefined);

  // Type guard to check if user is a MobileUser
  const isMobileUser = (user: any): user is MobileUser => {
    return user && 'childName' in user && 'childClass' in user;
  };

  const pickImage = async (type: 'profile' | 'child') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (type === 'profile') {
          setProfileImage(uri);
        } else {
          setChildImage(uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      await updateUser({
        ...editedUser,
        profilePicture: profileImage,
        childPicture: childImage,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setProfileImage(user?.profilePicture);
    setChildImage(user?.childPicture);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, styles.saveButton]}
              onPress={handleSave}
            >
              <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profile Photos */}
      <View style={styles.photosSection}>
        <View style={styles.photoContainer}>
          <Text style={styles.photoLabel}>Your Photo</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => pickImage('profile')}
            disabled={!isEditing}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="camera" size={30} color="#9CA3AF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.photoContainer}>
          <Text style={styles.photoLabel}>Child's Photo</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => pickImage('child')}
            disabled={!isEditing}
          >
            {childImage ? (
              <Image source={{ uri: childImage }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="baby-face" size={30} color="#9CA3AF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* User Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Full Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={editedUser?.name || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, name: text })}
            />
          ) : (
            <Text style={styles.infoValue}>{user?.name || 'Not specified'}</Text>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user?.username || 'Not specified'}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={editedUser?.email || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.infoValue}>{user?.email || 'Not specified'}</Text>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Contact</Text>
          <Text style={styles.infoValue}>{user?.contact || 'Not specified'}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Address</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={editedUser?.address || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, address: text })}
              multiline
            />
          ) : (
            <Text style={styles.infoValue}>{user?.address || 'Not specified'}</Text>
          )}
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Residence</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={editedUser?.residence || ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, residence: text })}
            />
          ) : (
            <Text style={styles.infoValue}>{user?.residence || 'Not specified'}</Text>
          )}
        </View>
      </View>

      {/* Child Information - Only show for MobileUser */}
      {isMobileUser(user) && (
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Child Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Child's Name</Text>
            <Text style={styles.infoValue}>{user.childName || 'Not specified'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Class</Text>
            <Text style={styles.infoValue}>{user.childClass || 'Not specified'}</Text>
          </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Date of Birth</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={isMobileUser(editedUser) ? editedUser.dateOfBirth || '' : ''}
              onChangeText={(text) => setEditedUser({ ...editedUser, dateOfBirth: text })}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <Text style={styles.infoValue}>{isMobileUser(user) ? user.dateOfBirth || 'Not specified' : 'Not specified'}</Text>
          )}
        </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{user.role === 'parent' ? 'Parent' : 'Guardian'}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#3B82F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  photosSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  photoButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
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
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  infoInput: {
    fontSize: 16,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#F9FAFB',
  },
});