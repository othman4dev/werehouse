import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Platform } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';

// Screens
import { TabNavigator } from './TabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { EditProductScreen } from '../screens/EditProductScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';


// Types
export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  Scanner: undefined;
  ProductDetails: { productId?: string };
  AddProduct: { barcode?: string };
  EditProduct: { productId: string };
  UpdateQuantity: { productId: string };
  Statistics: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

const screenOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitleStyle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerBackTitleVisible: false,
  headerTintColor: '#007AFF',
  ...Platform.select({
    ios: {
      ...TransitionPresets.SlideFromRightIOS,
    },
    android: {
      ...TransitionPresets.RevealFromBottomAndroid,
    },
  }),
};

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      {!isAuthenticated ? (
        // Routes non authentifiées
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            headerShown: false,
            animationTypeForReplace: isAuthenticated ? 'push' : 'pop',
          }}
        />
      ) : (
        // Routes authentifiées
        <>
          <Stack.Screen 
            name="Tabs" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          
          {/* Regular Screens */}
          <Stack.Screen 
            name="ProductDetails" 
            component={ProductDetailsScreen}
            options={{
              headerTitle: 'Détails du produit',
              headerBackTitle: 'Retour',
              headerTransparent: true,
              headerBackground: () => (
                <View 
                  style={{ 
                    flex: 1, 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E5EA',
                    
                  }} 
                />
              ),
            }}
          />
          
          <Stack.Screen 
            name="EditProduct" 
            component={EditProductScreen}
            options={{
              headerTitle: 'Modifier le produit',
              presentation: 'modal',
              gestureEnabled: true,
              cardOverlayEnabled: true,
            }}
          />

          <Stack.Screen 
            name="Statistics" 
            component={StatisticsScreen}
            options={{
              headerTitle: 'Statistiques',
              presentation: 'card',
            }}
          />

          {/* Modal Screens */}
          <Stack.Group 
            screenOptions={{
              presentation: 'modal',
              gestureEnabled: true,
              cardOverlayEnabled: true,
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
            }}
          >
            <Stack.Screen 
              name="Scanner" 
              component={ScanScreen}
              options={{
                headerTitle: 'Scanner',
              }}
            />
            
            <Stack.Screen 
              name="AddProduct" 
              component={AddProductScreen}
              options={{
                headerTitle: 'Ajouter un produit',
              }}
            />
            
            
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  );
};

// Types pour la navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 