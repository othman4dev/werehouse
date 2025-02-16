import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

interface DynamicStockInputProps {
  stock: {
    id: string;
    name: string;
    quantity: string;
    localisation: {
      city: string;
      latitude: string;
      longitude: string;
    };
  };
  onChangeStock: (field: string, value: string) => void;
  onDelete: () => void;
}

export const DynamicStockInput: React.FC<DynamicStockInputProps> = ({
  stock,
  onChangeStock,
  onDelete
}) => {
  const { user } = useAuth();

  // Pré-remplir avec les informations de l'utilisateur si c'est un nouveau stock
  React.useEffect(() => {
    if (user && !stock.id) {
      onChangeStock('id', user.warehouseId.toString());
      onChangeStock('localisation.city', user.city);
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>ID du stock</Text>
            <TextInput
              style={styles.input}
              value={stock.id}
              onChangeText={(text) => onChangeStock('id', text)}
              placeholder="ID du stock"
              keyboardType="numeric"
              editable={!user} // Désactiver si l'utilisateur est connecté
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Ville</Text>
            <TextInput
              style={styles.input}
              value={stock.localisation.city}
              onChangeText={(text) => onChangeStock('localisation.city', text)}
              placeholder="Ville"
              editable={!user} // Désactiver si l'utilisateur est connecté
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  inputsContainer: {
    flexDirection: 'column',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
}); 