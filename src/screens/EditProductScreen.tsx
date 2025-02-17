import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  primary: '#FF6B00',    // Orange vif
  secondary: '#1C1C1E',  // Noir profond
  background: '#FFFFFF', // Blanc
  text: '#1C1C1E',      // Noir pour le texte
  textLight: '#6B6B6B', // Gris pour le texte secondaire
  inputBg: '#F8F8F8',   // Fond des inputs
  border: '#E5E5EA',    // Couleur des bordures
};

type RootStackParamList = {
  EditProduct: { productId: string };
};

export const EditProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'EditProduct'>>();
  const { user } = useAuth();
  const { getProductById, updateProduct } = useProduct();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    price: '',
    type: '',
    supplier: '',
    minQuantity: '',
  });

  const [stockData, setStockData] = useState({
    name: '',
    quantity: '',
    city: '',
  });

  useEffect(() => {
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      const productId = route.params?.productId;
      if (!productId) {
        Alert.alert('Erreur', 'ID du produit manquant');
        navigation.goBack();
        return;
      }

      const productData = getProductById(productId);
      if (productData) {
        setFormData({
          name: productData.name,
          barcode: productData.barcode,
          price: productData.price.toString(),
          type: productData.type,
          supplier: productData.supplier,
          minQuantity: productData.minQuantity?.toString() || '0',
        });
        setImage(productData.image);
        
        // Set stock data if exists
        if (productData.stocks && productData.stocks[0]) {
          setStockData({
            name: productData.stocks[0].name,
            quantity: productData.stocks[0].quantity.toString(),
            city: productData.stocks[0].localisation.city,
          });
        }
        
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du produit');
      navigation.goBack();
    }
  };

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
      setSaving(true);
      const productId = route.params?.productId;
      
      const updatedProduct = {
        ...formData,
        price: parseInt(formData.price),
        minQuantity: parseInt(formData.minQuantity) || 0,
        image: image,
        stocks: [{
          id: Date.now(),
          name: stockData.name,
          quantity: parseInt(stockData.quantity),
          localisation: {
            city: stockData.city,
            latitude: 0,
            longitude: 0
          }
        }],
        editedBy: [{
          warehousemanId: user?.id,
          at: new Date().toISOString().split('T')[0]
        }]
      };

      const success = await updateProduct(productId, updatedProduct);
      if (success) {
        navigation.goBack();
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
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
              <Text style={styles.label}>Nom du produit</Text>
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
              <Text style={styles.label}>Prix (MAD)</Text>
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
              <Text style={styles.label}>Quantité minimale</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="alert-circle" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.minQuantity}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, minQuantity: value }))}
                  keyboardType="numeric"
                  placeholder="Quantité minimale"
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
              <Text style={styles.label}>Quantité</Text>
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
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="save" size={24} color="#FFF" />
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProductScreen; 