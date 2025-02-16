import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface ScannerOverlayProps {
  isScanning: boolean;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ isScanning }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.scanArea}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
      </View>
      {!isScanning && (
        <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 280,
    height: 280,
    borderWidth: 0,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#007AFF',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#007AFF',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#007AFF',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#007AFF',
  },
  loadingIndicator: {
    position: 'absolute',
    top: '60%',
  },
}); 