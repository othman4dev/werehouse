import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product } from '../types';
import productService from '../services/product.service';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (warehouseId: number) => Promise<void>;
  getProductById: (id: string) => Product | null;
  addProduct: (productData: Partial<Product>) => Promise<boolean>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (warehouseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts(warehouseId);
      setProducts(data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback((id: string) => {
    const product = products.find(p => p.id === id);
    return product || null;
  }, [products]);

  const addProduct = async (productData: Partial<Product>) => {
    try {
      setLoading(true);
      const newProduct = await productService.addNewProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      return true;
    } catch (err) {
      setError('Erreur lors de l\'ajout du produit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      setLoading(true);
      await productService.updateProduct(productId, productData);
      setProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, ...productData } : p)
      );
      return true;
    } catch (err) {
      setError('Erreur lors de la mise à jour du produit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      setLoading(true);
      await productService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression du produit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};