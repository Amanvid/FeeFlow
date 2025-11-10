import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import user screens
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import FeeStatusScreen from '../screens/user/FeeStatusScreen';
import SchoolLandingScreen from '../screens/user/SchoolLandingScreen';

// Import types
import { UserTabParamList } from './types';

const Tab = createBottomTabNavigator<UserTabParamList>();

// User Bottom Tab Navigator
export default function UserTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'FeeStatus':
              iconName = focused ? 'currency-usd' : 'currency-usd';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'School':
              iconName = focused ? 'school' : 'school-outline';
              break;
            default:
              iconName = 'home';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold' as const,
        },
        headerShown: true,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={UserDashboardScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="FeeStatus" 
        component={FeeStatusScreen} 
        options={{ title: 'Fee Status' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={UserProfileScreen} 
        options={{ title: 'My Profile' }}
      />
      <Tab.Screen 
        name="School" 
        component={SchoolLandingScreen} 
        options={{ title: 'School Info' }}
      />
    </Tab.Navigator>
  );
}