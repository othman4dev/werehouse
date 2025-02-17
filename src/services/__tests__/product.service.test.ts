import ProductService from '../product.service';
import api from '../api';
import { Product } from '../../types';

// Mock the api module
jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('ProductService', () => {
  // Sample test data
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    reference: 'REF123',
    barcode: '123456789',
    price: 10.99,
    minQuantity: 5,
    type: 'test',
    stocks: [
      {
        id: 1,
        name: 'Warehouse 1',
        quantity: 10,
        localisation: {
          city: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522
        }
      }
    ],
    editedBy: [],
    supplier: 'Test Supplier',
    status: 'in_stock'
  };

  const mockStatistics = {
    totalProducts: 1,
    outOfStock: 0,
    lowStock: 0,
    totalStockValue: 100,
    mostAddedProducts: [],
    mostRemovedProducts: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return all products for a warehouse', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockProduct] });

      const products = await ProductService.getAllProducts(1);
      
      expect(products).toHaveLength(1);
      expect(products[0]).toEqual(mockProduct);
      expect(mockedApi.get).toHaveBeenCalledWith('/products?warehouseId=1');
    });

    it('should throw error when API call fails', async () => {
      const error = new Error('API Error');
      mockedApi.get.mockRejectedValueOnce(error);

      await expect(ProductService.getAllProducts(1)).rejects.toThrow();
    });
  });

  describe('getProductByBarcode', () => {
    it('should return product when barcode exists', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockProduct] });

      const product = await ProductService.getProductByBarcode('123456789');
      
      expect(product).toEqual(mockProduct);
      expect(mockedApi.get).toHaveBeenCalledWith('/products');
    });

    it('should return null when barcode does not exist', async () => {
      mockedApi.get.mockResolvedValueOnce({ data: [mockProduct] });

      const product = await ProductService.getProductByBarcode('nonexistent');
      
      expect(product).toBeNull();
    });
  });

  

  describe('updateProductAfterScan', () => {
    it('should increase quantity on scan in', async () => {
      const productWithQuantity = { ...mockProduct, quantity: 10 };
      mockedApi.get.mockResolvedValueOnce({ data: productWithQuantity });
      mockedApi.put.mockResolvedValueOnce({ data: { ...productWithQuantity, quantity: 15 } });

      const result = await ProductService.updateProductAfterScan(1, 5, 'in');
      
      expect(result).toBe(true);
    });

    it('should prevent negative quantity on scan out', async () => {
      const productWithQuantity = { ...mockProduct, quantity: 5 };
      mockedApi.get.mockResolvedValueOnce({ data: productWithQuantity });

      const result = await ProductService.updateProductAfterScan(1, 10, 'out');
      
      expect(result).toBe(false);
    });
  });

  describe('addNewProduct', () => {
    it('should add new product successfully', async () => {
      mockedApi.post.mockResolvedValueOnce({ data: mockProduct });
      mockedApi.get.mockResolvedValueOnce({ data: mockStatistics });
      mockedApi.put.mockResolvedValueOnce({ data: {} });

      const newProduct = await ProductService.addNewProduct(mockProduct);
      
      expect(newProduct).toEqual(mockProduct);
      expect(mockedApi.post).toHaveBeenCalledWith('/products', expect.any(Object));
    });
  });

  describe('private methods', () => {
    describe('isOutOfStock', () => {
      it('should return true when all stocks are empty', () => {
        const product = {
          ...mockProduct,
          stocks: [
            { ...mockProduct.stocks[0], quantity: 0 },
            { ...mockProduct.stocks[0], quantity: 0 }
          ]
        };
        
        // @ts-ignore - accessing private method for testing
        expect(ProductService['isOutOfStock'](product)).toBe(true);
      });

      it('should return false when any stock has items', () => {
        // @ts-ignore - accessing private method for testing
        expect(ProductService['isOutOfStock'](mockProduct)).toBe(false);
      });
    });

    describe('isLowStock', () => {
      it('should return true when stock is below minQuantity', () => {
        const product = {
          ...mockProduct,
          minQuantity: 15,
          stocks: [{ ...mockProduct.stocks[0], quantity: 10 }]
        };
        
        // @ts-ignore - accessing private method for testing
        expect(ProductService['isLowStock'](product)).toBe(true);
      });
    });
  });
}); 