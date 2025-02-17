import { Product } from './index';

// Add or update your navigation types
export type RootStackParamList = {
  AddProduct: {
    barcode?: string;
    isNewScan?: boolean;
  };
  ProductDetails: {
    productId: string;
    isNewScan?: boolean;
  };
  EditProduct: {
    productId: string;
    product: Product;
  };
  // ... other routes
}; 