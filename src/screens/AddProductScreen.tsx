import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#FF6B00',    // Orange vif
  secondary: '#1C1C1E',  // Noir profond
  background: '#FFFFFF', // Blanc
  text: '#1C1C1E',      // Noir pour le texte
  textLight: '#6B6B6B', // Gris pour le texte secondaire
  inputBg: '#F8F8F8',   // Fond des inputs
  border: '#E5E5EA',    // Couleur des bordures
};

export const AddProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { addProduct } = useProduct();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    barcode: route.params?.barcode || '',
    price: '',
    type: '',
    supplier: '',
    description: '',
  });

  const [stockData, setStockData] = useState({
    name: '',
    quantity: '',
    minQuantity: '',
    city: user?.city || '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        Alert.alert('Erreur', 'Le nom du produit est obligatoire');
        return;
      }
      if (!formData.price.trim()) {
        Alert.alert('Erreur', 'Le prix est obligatoire');
        return;
      }
      if (!stockData.quantity.trim()) {
        Alert.alert('Erreur', 'La quantité est obligatoire');
        return;
      }

      setLoading(true);

      const productData = {
        name: formData.name.trim(),
        barcode: formData.barcode.trim(),
        price: Number(formData.price),
        type: formData.type.trim() || 'Divers',
        supplier: formData.supplier.trim() || 'N/A',
        description: formData.description.trim(),
        image: image,
        stocks: [{
          id: Date.now(),
          name: stockData.name.trim() || 'Stock principal',
          quantity: Number(stockData.quantity),
          minQuantity: Number(stockData.minQuantity) || 0,
          localisation: {
            city: stockData.city.trim() || user?.city || 'N/A',
            latitude: 0,
            longitude: 0
          }
        }],
        editedBy: [{
          warehousemanId: user?.id,
          at: new Date().toISOString()
        }]
      };

      const success = await addProduct(productData);
      if (success) {
        navigation.goBack();
      } else {
        throw new Error('Échec de l\'ajout du produit');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le produit. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Section */}
        <TouchableOpacity onPress={pickImage} style={styles.imageSection}>
          {image ? (
            <Image source={{ uri: image }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={40} color={COLORS.primary} />
              <Text style={styles.imagePlaceholderText}>Ajouter une image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Product Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du produit</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom du produit *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="cube" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  placeholder="Nom du produit"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prix (MAD) *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="pricetag" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.price}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, price: value }))}
                  keyboardType="numeric"
                  placeholder="Prix"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Code-barres</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="barcode" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.barcode}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, barcode: value }))}
                  placeholder="Code-barres"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="apps" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.type}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  placeholder="Catégorie"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fournisseur</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.supplier}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, supplier: value }))}
                  placeholder="Fournisseur"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textArea]}>
                <TextInput
                  style={[styles.input, styles.textAreaInput]}
                  value={formData.description}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Description du produit"
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Stock Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information du stock</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nom de l'emplacement</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="location" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={stockData.name}
                  onChangeText={(value) => setStockData(prev => ({ ...prev, name: value }))}
                  placeholder="Nom de l'emplacement"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantité *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="cube" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={stockData.quantity}
                  onChangeText={(value) => setStockData(prev => ({ ...prev, quantity: value }))}
                  keyboardType="numeric"
                  placeholder="Quantité"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quantité minimum</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="warning" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={stockData.minQuantity}
                  onChangeText={(value) => setStockData(prev => ({ ...prev, minQuantity: value }))}
                  keyboardType="numeric"
                  placeholder="Quantité minimum"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ville</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={stockData.city}
                  onChangeText={(value) => setStockData(prev => ({ ...prev, city: value }))}
                  placeholder="Ville"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="add-circle" size={24} color="#FFF" />
              <Text style={styles.saveButtonText}>Ajouter le produit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    height: 200,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: COLORS.textLight,
    fontSize: 14,
  },
  section: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 