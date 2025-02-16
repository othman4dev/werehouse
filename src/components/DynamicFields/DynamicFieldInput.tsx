import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DynamicFieldInputProps {
  fieldKey: string;
  value: string;
  onChangeKey: (text: string) => void;
  onChangeValue: (text: string) => void;
  onDelete: () => void;
}

export const DynamicFieldInput: React.FC<DynamicFieldInputProps> = ({
  fieldKey,
  value,
  onChangeKey,
  onChangeValue,
  onDelete
}) => {
  return (
    <Animated.View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.label}>Champ personnalisé</Text>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.deleteButtonInner}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Marque, Couleur..."
              placeholderTextColor="#A3A3A3"
              value={fieldKey}
              onChangeText={onChangeKey}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Valeur</Text>
            <TextInput
              style={styles.input}
              placeholder="Saisir une valeur"
              placeholderTextColor="#A3A3A3"
              value={value}
              onChangeText={onChangeValue}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B6B6B',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 46,
  },
  separator: {
    height: 12,
  },
}); 