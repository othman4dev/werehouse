import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useProduct } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { Searchbar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { debounce } from 'lodash';
import { BlurView } from 'expo-blur';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[
      styles.filterChip,
      selected && styles.filterChipSelected
    ]}
  >
    <Text style={[
      styles.filterChipText,
      selected && styles.filterChipTextSelected
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const ITEMS_PER_PAGE = 5;

export const ProductsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { products, fetchProducts, loading } = useProduct();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique product types from products
  const productTypes = ['all', ...new Set(products?.map(p => p.type) || [])];

  useEffect(() => {
    if (user?.warehouseId) {
      loadProducts();
    }
  }, [user?.warehouseId]);

  useEffect(() => {
    filterProducts();
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, selectedType, products]);

  const loadProducts = async () => {
    try {
      if (user?.warehouseId) {
        await fetchProducts(user.warehouseId);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filterProducts = () => {
    let filtered = [...(products || [])];

    // Sort products by latest edited date first
    filtered.sort((a, b) => {
      const dateA = new Date(a.editedBy?.[a.editedBy.length - 1]?.at || 0);
      const dateB = new Date(b.editedBy?.[b.editedBy.length - 1]?.at || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery)
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.type === selectedType);
    }

    setFilteredProducts(filtered);
  };

  const debouncedSearch = debounce((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
  }, 300);

  const loadMore = () => {
    if (filteredProducts.length < (products?.length || 0)) {
      setIsLoadingMore(true);
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    // Vérification que item est défini et a les propriétés nécessaires
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.productImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#999" />
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name || 'Sans nom'}
          </Text>
          <Text style={styles.productPrice}>
            {item.price ? `${item.price} DH` : 'Prix non défini'}
          </Text>
          <Text style={styles.productStock}>
            Stock: {item.stocks?.[0]?.quantity || 0}
            {item.stocks?.[0]?.minQuantity ? ` / Min: ${item.stocks?.[0]?.minQuantity}` : ''}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredCount = filteredProducts.length;
    return Math.ceil(filteredCount / ITEMS_PER_PAGE);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(getTotalPages(), prev + 1));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  // Pagination controls
  const PaginationControls = () => {
    const totalPages = getTotalPages();
    
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
      const pages = [];
      const showEllipsisStart = currentPage > 3;
      const showEllipsisEnd = currentPage < totalPages - 2;

      if (totalPages <= 5) {
        // Show all pages if total is 5 or less
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Always show first page
        pages.push(1);

        if (showEllipsisStart) {
          pages.push('...');
        }

        // Show current page and surrounding pages
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
          if (!pages.includes(i)) {
            pages.push(i);
          }
        }

        if (showEllipsisEnd) {
          pages.push('...');
        }

        // Always show last page
        if (!pages.includes(totalPages)) {
          pages.push(totalPages);
        }
      }

      return pages.map((page, index) => {
        if (page === '...') {
          return (
            <View key={`ellipsis-${index}`} style={styles.ellipsis}>
              <Text style={styles.ellipsisText}>•••</Text>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={page}
            style={[
              styles.pageButton,
              currentPage === page && styles.activePageButton,
            ]}
            onPress={() => setCurrentPage(page as number)}
          >
            <Text style={[
              styles.pageButtonText,
              currentPage === page && styles.activePageButtonText,
            ]}>
              {page}
            </Text>
          </TouchableOpacity>
        );
      });
    };

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity 
          style={[styles.arrowButton, currentPage === 1 && styles.arrowButtonDisabled]}
          onPress={handlePrevPage}
          disabled={currentPage === 1}
        >
          <MaterialIcons name="chevron-left" size={24} color={currentPage === 1 ? "#999" : "#007AFF"} />
        </TouchableOpacity>

        <View style={styles.pageNumbersContainer}>
          {renderPageNumbers()}
        </View>

        <TouchableOpacity 
          style={[styles.arrowButton, currentPage === totalPages && styles.arrowButtonDisabled]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <MaterialIcons name="chevron-right" size={24} color={currentPage === totalPages ? "#999" : "#007AFF"} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des produits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={24} color="#666" />
            <TextInput
              placeholder="Rechercher un produit..."
              placeholderTextColor="#666"
              style={styles.searchInput}
              onChangeText={debouncedSearch}
            />
          </View>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <MaterialIcons 
              name="tune" 
              size={24} 
              color={showFilters ? "#007AFF" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            <FilterChip
              label="Tous"
              selected={selectedType === 'all'}
              onPress={() => setSelectedType('all')}
            />
            {productTypes
              .filter(type => type !== 'all')
              .map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  selected={selectedType === type}
                  onPress={() => setSelectedType(type)}
                />
              ))
            }
          </ScrollView>
        )}
      </BlurView>

      <FlatList
        data={getCurrentPageItems()}
        renderItem={renderItem}
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun résultat trouvé' : 'Aucun produit disponible'}
            </Text>
          </View>
        }
        ListFooterComponent={<PaginationControls />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 12,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterScroll: {
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pageNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  arrowButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    marginHorizontal: 4,
    backgroundColor: '#F2F2F7',
  },
  activePageButton: {
    backgroundColor: '#007AFF',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activePageButtonText: {
    color: '#FFFFFF',
  },
  ellipsis: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsisText: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 2,
  },
}); 