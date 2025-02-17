import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useProduct } from '../context/ProductContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../context/AuthContext';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RNHTMLtoPDF from 'react-native-html-to-pdf-lite';
import * as Print from 'expo-print';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';

const { width } = Dimensions.get('window');

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  propsForLabels: {
    fontSize: "10",
  },
};

export const StatisticsScreen = () => {
  const { products, loading } = useProduct();
  const { user } = useAuth();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const statistics = React.useMemo(() => {
    if (!products) return null;

    const totalProducts = products.length;
    const outOfStock = products.filter(p => 
      !p.stocks?.[0]?.quantity || p.stocks[0].quantity === 0
    ).length;
    const lowStock = products.filter(p => {
      const stock = p.stocks?.[0];
      return stock?.quantity && stock.minQuantity && stock.quantity <= stock.minQuantity;
    }).length;
    const totalValue = products.reduce((sum, p) => 
      sum + ((p.price || 0) * (p.stocks?.[0]?.quantity || 0)), 0
    );

    // Grouper les produits par type
    const productsByType = products.reduce((acc, product) => {
      acc[product.type] = (acc[product.type] || 0) + 1;
      return acc;
    }, {});

    // Calculer la valeur par type
    const valueByType = products.reduce((acc, product) => {
      const value = (product.price || 0) * (product.stocks?.[0]?.quantity || 0);
      acc[product.type] = (acc[product.type] || 0) + value;
      return acc;
    }, {});

    // Données pour le graphique circulaire
    const pieChartData = Object.entries(productsByType).map(([type, count], index) => ({
      name: type,
      population: count,
      color: `hsl(${index * 45}, 70%, 50%)`,
      legendFontColor: "#7F7F7F",
      legendFontSize: 12,
    }));

    // Données pour le graphique linéaire (simulées - à adapter selon vos besoins)
    const lineChartData = {
      labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
      datasets: [{
        data: [
          Math.round(totalValue * 0.8),
          Math.round(totalValue * 0.85),
          Math.round(totalValue * 0.9),
          Math.round(totalValue * 0.95),
          Math.round(totalValue * 0.98),
          totalValue
        ],
      }]
    };

    return {
      totalProducts,
      outOfStock,
      lowStock,
      totalValue,
      productsByType,
      valueByType,
      pieChartData,
      lineChartData,
    };
  }, [products]);

  const generatePDF = async () => {
    setGeneratingPDF(true);
    try {
      const html = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
                padding: 40px;
                color: #2c3e50;
                line-height: 1.6;
              }
              h1 { 
                color: #2c3e50; 
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 10px;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
              }
              h2 {
                color: #34495e;
                font-size: 24px;
                margin-top: 30px;
                margin-bottom: 20px;
              }
              .date { 
                color: #7f8c8d; 
                font-size: 14px;
                margin-bottom: 40px;
              }
              .section { 
                margin-bottom: 40px;
                background: #fff;
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              }
              .stats-grid { 
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 25px;
                margin-bottom: 30px;
              }
              .stat-card { 
                padding: 20px;
                background: #f8f9fa;
                border-radius: 12px;
                border-left: 4px solid #3498db;
              }
              .stat-value { 
                color: #2c3e50;
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .stat-label { 
                color: #7f8c8d;
                font-size: 16px;
              }
              table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin-top: 20px;
                border-radius: 8px;
                overflow: hidden;
              }
              th, td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #ecf0f1;
              }
              th { 
                background-color: #3498db;
                color: white;
                font-weight: 600;
                font-size: 14px;
              }
              tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              tr:hover {
                background-color: #f1f3f4;
              }
            </style>
          </head>
          <body>
            <h1>Rapport des Stocks</h1>
            <div class="date">
              ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}
            </div>
            
            <div class="section">
              <h2>Statistiques Générales</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${statistics?.totalProducts}</div>
                  <div class="stat-label">Produits Total</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${statistics?.outOfStock}</div>
                  <div class="stat-label">Rupture de Stock</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${statistics?.lowStock}</div>
                  <div class="stat-label">Stock Faible</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${statistics?.totalValue?.toLocaleString()} DH</div>
                  <div class="stat-label">Valeur Totale</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Liste des Produits</h2>
              <table>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Prix (DH)</th>
                  <th>Stock</th>
                </tr>
                ${products?.map(product => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.type}</td>
                    <td>${product.price?.toLocaleString()}</td>
                    <td>${product.stocks?.[0]?.quantity || 0}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          </body>
        </html>
      `;

      // Générer le PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });

      const filename = `rapport_stocks_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        
        if (permissions.granted) {
          // Créer le fichier dans le dossier choisi par l'utilisateur
          const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            'application/pdf'
          );

          // Lire le contenu du PDF généré
          const fileContent = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Écrire le contenu dans le nouveau fichier
          await FileSystem.StorageAccessFramework.writeAsStringAsync(
            destinationUri,
            fileContent,
            { encoding: FileSystem.EncodingType.Base64 }
          );

          Alert.alert('Succès', 'Le PDF a été téléchargé');
        }
      } else {
        // Pour iOS
        const destinationUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.copyAsync({
          from: uri,
          to: destinationUri
        });
        Alert.alert('Succès', 'Le PDF a été enregistré');
      }

      // Supprimer le fichier temporaire
      await FileSystem.deleteAsync(uri);

    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la génération du PDF',
        [{ text: 'OK' }]
      );
    } finally {
      setGeneratingPDF(false);
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#EBF7FF' }]}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="inventory" size={24} color="#007AFF" />
          </View>
          <Text style={styles.statValue}>{statistics?.totalProducts}</Text>
          <Text style={styles.statLabel}>Produits Total</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#FFE8E8' }]}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="warning" size={24} color="#FF3B30" />
          </View>
          <Text style={[styles.statValue, { color: '#FF3B30' }]}>{statistics?.outOfStock}</Text>
          <Text style={styles.statLabel}>Rupture de Stock</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#FFF9EB' }]}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="low-priority" size={24} color="#FF9500" />
          </View>
          <Text style={[styles.statValue, { color: '#FF9500' }]}>{statistics?.lowStock}</Text>
          <Text style={styles.statLabel}>Stock Faible</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: '#F0FFE9' }]}>
          <View style={styles.statIconContainer}>
            <MaterialIcons name="attach-money" size={24} color="#34C759" />
          </View>
          <Text style={[styles.statValue, { color: '#34C759' }]}>{statistics?.totalValue.toLocaleString()} DH</Text>
          <Text style={styles.statLabel}>Valeur Totale</Text>
        </View>
      </View>
    </View>
  );

  const renderChartsTab = () => {
    // Calculate responsive dimensions
    const chartWidth = width - 32; // Full width minus padding
    const chartHeight = Math.min(220, chartWidth * 0.6); // Height proportional to width, max 220

    return (
      <View style={styles.tabContent}>
        <View style={[styles.chartContainer, { width: chartWidth }]}>
          <Text style={styles.chartTitle}>Répartition des Produits par Type</Text>
          <PieChart
            data={statistics?.pieChartData || []}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BlurView intensity={80} style={styles.statsContainer}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Aperçu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'charts' && styles.activeTab]}
            onPress={() => setActiveTab('charts')}
          >
            <Text style={[styles.tabText, activeTab === 'charts' && styles.activeTabText]}>
              Graphiques
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' ? renderOverviewTab() : renderChartsTab()}

        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={generatePDF}
          disabled={generatingPDF}
        >
          {generatingPDF ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="file-download" size={24} color="#FFFFFF" />
              <Text style={styles.downloadButtonText}>Télécharger Rapport PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </BlurView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    padding: 8,
  },
  statCard: {
    width: '47%',
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  chartContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});