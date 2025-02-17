import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types';
import scannerService from '../services/scanner.service';

interface ScannerContextType {
  isScanning: boolean;
  loading: boolean;
  processScannedBarcode: (barcode: string) => Promise<{
    product: Product | null;
    isNewProduct: boolean;
  }>;
  resetScanner: () => void;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export const ScannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading] = useState(false);

  const processScannedBarcode = async (barcode: string) => {
    try {
      setLoading(true);
      setIsScanning(false);
      return await scannerService.processBarcode(barcode);
    } catch (error) {
      console.error('Error processing barcode:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setIsScanning(true);
    setLoading(false);
  };

  return (
    <ScannerContext.Provider
      value={{
        isScanning,
        loading,
        processScannedBarcode,
        resetScanner
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error('useScanner must be used within a ScannerProvider');
  }
  return context;
}; 