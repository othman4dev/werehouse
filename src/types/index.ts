export interface Warehouseman {
  id: string;
  name: string;
  dob: string;
  city: string;
  secretKey: string;
  warehouseId: number;
}

export interface Product {
  id: string;
  name: string;
  reference: string;
  barcode: string;
  price: number;
  description?: string;
  image?: string;
  minQuantity: number;
  type: string;
  quantity?: number;
  stocks: Stock[];
  editedBy: EditHistory[];
  warehouseId?: number;
  warehousemanId?: string;
  supplier: string;
  status?: 'out_of_stock' | 'low_stock' | 'in_stock';
}

export interface Stock {
  id: number;
  name: string;
  quantity: number;
  localisation: StockLocation;
}

export interface EditHistory {
  warehousemanId: string;
  at: string;
}

export interface StockLocation {
  city: string;
  latitude: number;
  longitude: number;
}

export interface Movement {
  id: string;
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  warehousemanId: number;
  warehouseId: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: Warehouseman | null;
  login: (secretKey: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export type RootStackParamList = {
  AddProduct: {
    barcode?: string;
  };
  ProductDetails: {
    productId: string;
  };
  EditProduct: {
    productId: string;
    product: Product;
  };
}; 