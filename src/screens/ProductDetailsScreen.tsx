import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { Product } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

const COLORS = {
  primary: '#FF6B00',    // Orange vif
  secondary: '#1C1C1E',  // Noir profond
  background: '#FFFFFF', // Blanc
  text: '#1C1C1E',      // Noir pour le texte
  textLight: '#6B6B6B', // Gris pour le texte secondaire
  success: '#34C759',   // Vert pour stock disponible
  danger: '#FF3B30',    // Rouge pour stock épuisé
};

interface InfoItemProps {
  icon: any;
  label: string;
  value: string;
  color?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, color }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={20} color={color || '#007AFF'} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// Ajout d'un nouveau type pour le modal de transaction
type TransactionType = 'sell' | 'buy' | null;

const ProductDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { getProductById, deleteProduct, loading, updateProduct } = useProduct();
  const [product, setProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>(null);
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const loadProduct = async () => {
    if (route.params?.productId) {
      setRefreshing(true);
      const data = await getProductById(route.params.productId);
      setProduct(data);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [route.params?.productId]);

  const handleDelete = async () => {
    try {
      if (product?.id) {
        await deleteProduct(product.id);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleTransaction = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Veuillez saisir une quantité valide');
      return;
    }

    const currentStock = product?.stocks?.[0]?.quantity || 0;
    const quantityNum = parseInt(quantity);

    try {
      if (transactionType === 'sell') {
        if (currentStock < quantityNum) {
          setError('Stock insuffisant');
          return;
        }
        // Mettre à jour le stock (soustraction)
        await updateProduct(product.id, {
          ...product,
          stocks: [{
            ...product.stocks[0],
            quantity: currentStock - quantityNum
          }]
        });
      } else {
        // Mettre à jour le stock (addition)
        await updateProduct(product.id, {
          ...product,
          stocks: [{
            ...product.stocks[0],
            quantity: currentStock + quantityNum
          }]
        });
      }

      // Recharger les données du produit
      await loadProduct();
      setShowTransactionModal(false);
      setQuantity('');
      setError('');
    } catch (error) {
      setError('Une erreur est survenue');
    }
  };

  if (!product) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadProduct} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Product Title and Badges */}
        <View style={styles.mainInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.priceBadge}>
              <Ionicons name="pricetag" size={20} color={COLORS.primary} />
              <Text style={styles.priceText}>{product.price} MAD</Text>
            </View>
            <View style={[styles.stockBadge, { 
              backgroundColor: product.stocks?.[0]?.quantity > 0 ? '#FFF5ED' : '#FFE5E5'
            }]}>
              <Ionicons 
                name="cube" 
                size={20} 
                color={product.stocks?.[0]?.quantity > 0 ? COLORS.primary : COLORS.danger} 
              />
              <Text style={[styles.stockText, { 
                color: product.stocks?.[0]?.quantity > 0 ? COLORS.primary : COLORS.danger
              }]}>
                {product.stocks?.[0]?.quantity || 0} unités
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          <View style={styles.infoGrid}>
            <InfoItem 
              icon="barcode"
              label="Référence"
              value={product.barcode}
              color={COLORS.primary}
            />
            <InfoItem 
              icon="business"
              label="Fournisseur"
              value={product.supplier}
              color={COLORS.primary}
            />
            <InfoItem 
              icon="apps"
              label="Catégorie"
              value={product.type}
              color={COLORS.primary}
            />
            <InfoItem 
              icon="alert-circle"
              label="Stock minimum"
              value={product.minQuantity ? `${product.minQuantity} unités` : '0 unités'}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Stock Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emplacements de stock</Text>
          {product.stocks.map((stock, index) => (
            <View key={index} style={styles.stockItem}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockName}>{stock.name}</Text>
                <View style={styles.locationInfo}>
                  <Ionicons name="location" size={16} color={COLORS.primary} />
                  <Text style={styles.locationText}>{stock.localisation.city}</Text>
                </View>
              </View>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>{stock.quantity} unités</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.sellButton]}
            onPress={() => {
              setTransactionType('sell');
              setShowTransactionModal(true);
            }}
          >
            <Ionicons name="cart-outline" size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Vendre</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.buyButton]}
            onPress={() => {
              setTransactionType('buy');
              setShowTransactionModal(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Acheter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('EditProduct', { productId: product.id })}
          >
            <Ionicons name="create-outline" size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash-outline" size={16} color="#FFF" />
            <Text style={styles.actionButtonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transaction Modal */}
      <Modal
        visible={showTransactionModal}
        transparent={true}
        animationType="fade"
      >
        <BlurView intensity={30} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {transactionType === 'sell' ? 'Vendre des produits' : 'Acheter des produits'}
            </Text>
            
            <View style={styles.quantityInputContainer}>
              <Text style={styles.quantityLabel}>Quantité :</Text>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="Saisir la quantité"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTransactionModal(false);
                  setQuantity('');
                  setError('');
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton, 
                  { backgroundColor: transactionType === 'sell' ? '#FF3B30' : '#34C759' }
                ]}
                onPress={handleTransaction}
              >
                <Text style={styles.confirmButtonText}>
                  {transactionType === 'sell' ? 'Vendre' : 'Acheter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
      >
        <BlurView intensity={30} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Supprimer le produit</Text>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDelete}
              >
                <Text style={styles.confirmButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#F8F8F8',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  mainInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5ED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 8,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    gap: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionContainer: {
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFF',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  sellButton: {
    backgroundColor: '#6366F1',
  },
  buyButton: {
    backgroundColor: '#43A047',
  },
  editButton: {
    backgroundColor: '#1E88E5',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#1E88E5',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  quantityInputContainer: {
    marginVertical: 12,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 12,
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  stockItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductDetailsScreen; 