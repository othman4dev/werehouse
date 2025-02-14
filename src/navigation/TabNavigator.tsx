import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { Ionicons } from '@expo/vector-icons';
import { navigationStyles } from '../styles/navigation';
import { COLORS } from '../styles/theme';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: navigationStyles.header,
        headerTitleStyle: navigationStyles.headerTitle,
        tabBarStyle: navigationStyles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarShowLabel: true,
        tabBarLabelStyle: navigationStyles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Accueil',
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          headerTitle: 'Produits',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "cube" : "cube-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Produits',
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanScreen}
        options={{
          headerTitle: 'Scanner',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "scan" : "scan-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Scanner',
        }}
      />
     
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          headerTitle: 'Statistiques',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "stats-chart" : "stats-chart-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Statistiques',
        }}
      />
       <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
              color={color} 
            />
          ),
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
}; 