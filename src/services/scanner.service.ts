import productService from './product.service';
import { Product } from '../types';

class ScannerService {
  async processBarcode(barcode: string): Promise<{
    product: Product | null;
    isNewProduct: boolean;
  }> {
    try {
      console.log('Processing barcode:', barcode);
      
      if (!barcode) {
        throw new Error('Code-barres invalide');
      }

      // Recherche du produit dans la base de données
      const existingProduct = await productService.getProductByBarcode(barcode);
      console.log('Product found:', existingProduct);
      
      // Si le produit n'existe pas, on retourne isNewProduct = true
      if (!existingProduct) {
        return {
          product: null,
          isNewProduct: true
        };
      }

      // Si le produit existe, on le retourne avec isNewProduct = false
      return {
        product: existingProduct,
        isNewProduct: false
      };
    } catch (error) {
      console.error('Scanner service error:', error);
      throw error;
    }
  }
}

export default new ScannerService(); 