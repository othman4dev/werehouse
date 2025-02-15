import React, { useCallback, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert, 
  Text, 
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
  StatusBar
} from 'react-native';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useScanner } from '../context/ScannerContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.65;

export const ScanScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { 
    isScanning,
    loading,
    processScannedBarcode,
    resetScanner
  } = useScanner();
  const [scanAnimation] = useState(new Animated.Value(0));
  const [torchOn, setTorchOn] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  React.useEffect(() => {
    if (isScanning) {
      startScanAnimation();
    }
  }, [isScanning]);

  const handleBarCodeScanned = useCallback(async ({ data: barcode }: BarcodeScanningResult) => {
    if (!isScanning || loading) return;
    setScannedCode(barcode);
  }, [isScanning, loading]);

  const handleSearch = async () => {
    if (!scannedCode) return;
    
    try {
      const { product, isNewProduct } = await processScannedBarcode(scannedCode);
      
      if (isNewProduct) {
        navigation.navigate('AddProduct', { barcode: scannedCode });
      } else if (product) {
        navigation.navigate('ProductDetails', { productId: product.id });
      }
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du scan',
        [{ text: 'Réessayer', onPress: resetScanner }]
      );
    }
  };

  const handleRescan = () => {
    setScannedCode(null);
    resetScanner();
  };

  if (!permission?.granted) {
    requestPermission();
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={(!scannedCode && isScanning) ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8'],
          interval: 300,
        }}
        torch={torchOn ? 'on' : 'off'}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.torchButton}
              onPress={() => setTorchOn(!torchOn)}
            >
              <Ionicons 
                name={torchOn ? "flash" : "flash-outline"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>

          {!scannedCode && (
            <>
              <View style={styles.scanArea}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{
                        translateY: scanAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, SCAN_AREA_SIZE],
                        }),
                      }],
                    },
                  ]}
                />
              </View>
              <Text style={styles.instructions}>
                Placez le code-barres dans le cadre pour le scanner
              </Text>
            </>
          )}

          {scannedCode && (
            <View style={styles.resultContainer}>
              <View style={styles.resultContent}>
                <Text style={styles.scannedLabel}>Code scanné :</Text>
                <Text style={styles.scannedCode}>{scannedCode}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.searchButton]}
                    onPress={handleSearch}
                  >
                    <Ionicons name="search" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Rechercher</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rescanButton]}
                    onPress={handleRescan}
                  >
                    <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Scanner à nouveau</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderRadius: 20,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      android: {
        elevation: 4,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 20,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 20,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 20,
  },
  scanLine: {
    height: 3,
    width: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  instructions: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    position: 'absolute',
    bottom: height * 0.15,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 16,
    borderRadius: 12,
  },
  resultContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  resultContent: {
    width: '80%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  scanFrame: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFFFFF30',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  scannedLabel: {
    fontSize: 14,
    color: '#FFFFFF80',
    marginBottom: 8,
  },
  scannedCode: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  searchButton: {
    backgroundColor: '#007AFF',
  },
  rescanButton: {
    backgroundColor: '#333333',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    position: 'absolute',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: width - 40,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
}); 