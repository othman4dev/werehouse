import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = () => {
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    if (!secretKey.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre clé secrète');
      return;
    }

    setLoading(true);
    try {
      console.log('Tentative de connexion avec:', secretKey);
      const success = await login(secretKey);
      console.log('Résultat de la connexion:', success);
      console.log('isAuthenticated:', isAuthenticated);
      
      if (!success) {
        Alert.alert('Erreur', 'Clé secrète invalide');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>STOCKYFY</Text>
      <TextInput
        style={styles.input}
        placeholder="Clé secrète"
        value={secretKey}
        onChangeText={setSecretKey}
        secureTextEntry={false}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>
      
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    
  },
  statusText: {
    marginTop: 16,
    color: '#6b7280',
  },
}); 