import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  isCurrency?: boolean;
}

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { products, fetchProducts } = useProduct();
  const [refreshing, setRefreshing] = React.useState(false);
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalStockValue: 0,
    lowStock: 0,
  });

  useEffect(() => {
    if (user?.warehouseId) {
      fetchProducts(user.warehouseId);
    }
  }, [user]);

  useEffect(() => {
    if (products) {
      const stats = calculateStatistics(products);
      setStatistics(stats);
    }
  }, [products]);

  const calculateStatistics = (products: Product[]) => {
    return {
      totalProducts: products.length,
      outOfStock: products.filter(product => 
        product.stocks?.every(stock => stock.quantity === 0)
      ).length,
      totalStockValue: products.reduce((total, product) => {
        const stockQuantity = product.stocks?.reduce((sum, stock) => sum + (stock.quantity || 0), 0) || 0;
        return total + (stockQuantity * (product.price || 0));
      }, 0),
      lowStock: products.filter(product => 
        product.stocks?.some(stock => 
          stock.quantity > 0 && 
          stock.quantity <= (product.minQuantity || 0)
        )
      ).length
    };
  };

  const onRefresh = React.useCallback(async () => {
    if (!user?.warehouseId) return;
    setRefreshing(true);
    await fetchProducts(user.warehouseId);
    setRefreshing(false);
  }, [user]);

  // Produits en rupture de stock
  const outOfStockProducts = products ? products.filter((product: Product) => 
    product.stocks?.every(stock => stock.quantity === 0)
  ) : [];

  // Produits en stock faible (mais pas en rupture)
  const lowStockProducts = products ? products.filter((product: Product) => 
    product.stocks?.some(stock => 
      stock.quantity > 0 && 
      stock.quantity <= (product.minQuantity || 0)
    )
  ) : [];

  const StatCard = ({ title, value, icon, color, isCurrency }: StatCardProps) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statValue}>
          {isCurrency 
            ? `${value.toLocaleString()} DH`
            : value.toLocaleString()}
        </Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const ProductList = ({ products, title }: { products: Product[], title: string }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
          <Text style={styles.seeAllButton}>Voir tout</Text>
        </TouchableOpacity>
      </View>

      {products.length > 0 ? (
        products.slice(0, 3).map((product) => (
          <TouchableOpacity 
            key={product.id}
            style={styles.productItem}
            onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
          >
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={[
                styles.productStock,
                product.stocks?.[0]?.quantity === 0 ? styles.outOfStockText : styles.lowStockText
              ]}>
                Stock: {product.stocks?.[0]?.quantity || 0} 
                {product.minQuantity ? ` / Min: ${product.minQuantity}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun produit dans cette catégorie</Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bonjour,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => navigation.navigate('ScanTab')}
        >
          <Ionicons name="scan" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total Produits"
          value={statistics.totalProducts}
          icon="cube-outline"
          color="#007AFF"
        />
        <StatCard
          title="Valeur du Stock"
          value={statistics.totalStockValue}
          icon="cash-outline"
          color="#34C759"
          isCurrency={true}
        />
        <StatCard
          title="Stock Faible"
          value={statistics.lowStock}
          icon="warning-outline"
          color="#FF9500"
        />
        <StatCard
          title="Rupture Stock"
          value={statistics.outOfStock}
          icon="alert-circle-outline"
          color="#FF3B30"
        />
      </View>

      {/* Rupture de stock section */}
      {outOfStockProducts.length > 0 && (
        <ProductList 
          products={outOfStockProducts} 
          title="Produits en rupture de stock" 
        />
      )}

      {/* Stock faible section */}
      {lowStockProducts.length > 0 && (
        <ProductList 
          products={lowStockProducts} 
          title="Produits en stock faible" 
        />
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  seeAllButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    marginTop: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
  outOfStockText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
  lowStockText: {
    color: '#FF9500',
    fontWeight: '500',
  },
});
