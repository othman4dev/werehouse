import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ProductProvider } from './src/context/ProductContext';
import { Platform } from 'react-native';
import { ScannerProvider } from './src/context/ScannerContext';

// Définition d'un thème personnalisé
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
    background: '#F2F2F7',
    card: 'white',
    text: '#000000',
    border: '#C6C6C8',
    notification: '#FF3B30',
  },
};

// Configuration des styles de navigation globaux
const navigationTheme = {
  ...MyTheme,
  fonts: Platform.select({
    ios: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      light: {
        fontFamily: 'System',
        fontWeight: '300',
      },
      thin: {
        fontFamily: 'System',
        fontWeight: '100',
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700',
      },
    },
    android: {
      regular: {
        fontFamily: 'sans-serif',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'sans-serif-medium',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'sans-serif-light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'sans-serif-thin',
        fontWeight: 'normal',
      },
      bold: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
      },
    },
  }),
};

export default function App() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <AuthProvider>
        <ProductProvider>
        <ScannerProvider>
          <AppNavigator />
          </ScannerProvider>
        </ProductProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}

