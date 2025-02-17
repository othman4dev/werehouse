import api from './api';
import { Product } from '../types';

interface Statistics {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  totalStockValue: number;
  mostAddedProducts: Array<{ id: string; count: number }>;
  mostRemovedProducts: Array<{ id: string; count: number }>;
}

class ProductService {
  async getAllProducts(warehouseId: number): Promise<Product[]> {
    try {
      const response = await api.get(`/products?warehouseId=${warehouseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      const response = await api.get('/products');
      const product = response.data.find((p: Product) => p.barcode === barcode);
      return product || null;
    } catch (error) {
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      const updatedProduct = response.data;
      await this.updateStatistics('update', updatedProduct);
      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const product = await this.getProductById(productId);
      if (product) {
        await api.delete(`/products/${productId}`);
        await this.updateStatistics('delete', product);
      }
    } catch (error) {
      throw error;
    }
  }

  async updateStockQuantity(productId: string, warehouseId: number, newQuantity: number): Promise<boolean> {
    try {
      const product = (await api.get(`/products/${productId}`)).data;
      const stockIndex = product.stocks.findIndex((s: any) => s.id === warehouseId);
      
      if (stockIndex === -1) {
        throw new Error('Stock non trouvé');
      }

      product.stocks[stockIndex].quantity = newQuantity;
      await api.put(`/products/${productId}`, product);
      
      // Update statistics after stock quantity change
      await this.updateStatistics('update', product);
      
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la quantité');
    }
  }

  private calculateStatus(quantity: number, minQuantity: number): Product['status'] {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= minQuantity) return 'low_stock';
    return 'in_stock';
  }

  async updateProductQuantity(productId: number, newQuantity: number): Promise<boolean> {
    try {
      const product = (await api.get(`/products/${productId}`)).data;
      const updatedProduct = {
        ...product,
        quantity: newQuantity,
        lastUpdated: new Date().toISOString(),
        status: this.calculateStatus(newQuantity, product.minQuantity)
      };
      
      await api.put(`/products/${productId}`, updatedProduct);
      return true;
    } catch (error) {
      return false;
    }
  }

  async updateProductAfterScan(
    productId: number, 
    quantity: number, 
    type: 'in' | 'out'
  ): Promise<boolean> {
    try {
      const product = (await api.get(`/products/${productId}`)).data;
      const newQuantity = type === 'in' 
        ? product.quantity + quantity
        : product.quantity - quantity;
      
      if (newQuantity < 0) return false;
      
      await this.updateProductQuantity(productId, newQuantity); 
      return true;
    } catch (error) {
      return false;
    }
  }

  async addNewProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.post('/products', {
        ...productData,
        barcode: productData.barcode
      });
      const newProduct = response.data;
      await this.updateStatistics('add', newProduct);
      return newProduct;
    } catch (error) {
      throw error;
    }
  }

  private async saveImage(uri: string): Promise<string> {
    try {
      return uri;
    } catch (error) {
      throw new Error('Erreur lors de la sauvegarde de l\'image');
    }
  }

  private isOutOfStock(product: Product): boolean {
    return product.stocks?.every(stock => stock.quantity === 0) ?? true;
  }

  private isLowStock(product: Product): boolean {
    return product.stocks?.some(stock => 
      stock.quantity > 0 && 
      stock.quantity <= (product.minQuantity || 0)
    ) ?? false;
  }

  private calculateProductValue(product: Product): number {
    const totalQuantity = product.stocks?.reduce(
      (sum, stock) => sum + (stock.quantity || 0), 
      0
    ) || 0;
    return totalQuantity * (product.price || 0);
  }

  private async updateStatistics(action: 'add' | 'update' | 'delete', product: Product) {
    try {
      const response = await api.get('/statistics');
      const currentStats: Statistics = response.data;
      let newStats: Statistics = { ...currentStats };

      switch (action) {
        case 'add':
          newStats.totalProducts += 1;
          if (this.isOutOfStock(product)) {
            newStats.outOfStock += 1;
          } else if (this.isLowStock(product)) {
            newStats.lowStock = (newStats.lowStock || 0) + 1;
          }
          newStats.totalStockValue += this.calculateProductValue(product);
          break;

        case 'delete':
          newStats.totalProducts -= 1;
          if (this.isOutOfStock(product)) {
            newStats.outOfStock -= 1;
          } else if (this.isLowStock(product)) {
            newStats.lowStock = Math.max(0, (newStats.lowStock || 0) - 1);
          }
          newStats.totalStockValue -= this.calculateProductValue(product);
          break;

        case 'update':
          const products = await this.getAllProducts(product.stocks[0].id);
          newStats.outOfStock = products.filter(p => this.isOutOfStock(p)).length;
          newStats.lowStock = products.filter(p => this.isLowStock(p)).length;
          newStats.totalStockValue = products.reduce((total, p) => 
            total + this.calculateProductValue(p), 0
          );
          break;
      }

      // Ensure lowStock is initialized if it doesn't exist
      if (typeof newStats.lowStock === 'undefined') {
        newStats.lowStock = 0;
      }

      await api.put('/statistics', newStats);
      return newStats;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
      throw error;
    }
  }

  async getStatistics(): Promise<Statistics> {
    try {
      const response = await api.get('/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductService(); 