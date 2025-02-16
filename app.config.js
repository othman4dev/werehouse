module.exports = {
  name: 'STOCKYFY',
  version: '1.0.0',
  plugins: [
    [
     "expo-camera",
        {
          "cameraPermission": "L'application nécessite l'accès à la caméra pour scanner les codes-barres."
        }
    ]
  ],
  experiments: {
    tsconfigPaths: true
  },
  android: {
    newArchEnabled: true
  },
  ios: {
    newArchEnabled: true
  }
}; 