const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage des serveurs de développement...');

// Fonction pour mettre à jour le fichier de configuration
const updateApiConfig = (url) => {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'api.ts');
  const configContent = `
import { Platform } from 'react-native';

let currentApiUrl = '${url}';

const getApiUrl = () => {
  if (__DEV__) {
    console.log('🌐 URL API actuelle:', currentApiUrl);
    return currentApiUrl;
  }
  return 'https://api.production.com';
};

export const updateApiUrl = (newUrl: string) => {
  console.log('🔄 Mise à jour URL API:', newUrl);
  currentApiUrl = newUrl;
};

export const API_URL = getApiUrl();
`;

  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log('✅ Fichier de configuration mis à jour');
};

// Démarrer json-server
const jsonServer = exec('json-server --watch db.json --host 0.0.0.0 --port 3000');

jsonServer.stdout.on('data', (data) => {
  console.log('JSON Server:', data);
});

jsonServer.stderr.on('data', (data) => {
  console.log('JSON Server Error:', data);
});

// Démarrer ngrok
const ngrok = exec('ngrok http 3000');

ngrok.stdout.on('data', (data) => {
  console.log('ngrok:', data);
  
  // Rechercher l'URL https dans la sortie
  const match = data.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok\.io/);
  if (match) {
    const url = match[0];
    console.log('📱 Nouvelle URL ngrok détectée:', url);
    updateApiConfig(url);
    
    // Vérifier que le serveur est accessible
    exec(`curl -I ${url}/warehousemans`, (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Erreur lors du test du serveur:', error);
        return;
      }
      console.log('✅ Serveur accessible:', stdout);
    });
  }
});

ngrok.stderr.on('data', (data) => {
  console.log('ngrok Error:', data);
});

// Gérer la fermeture propre
process.on('SIGINT', () => {
  console.log('🛑 Arrêt des serveurs...');
  jsonServer.kill();
  ngrok.kill();
  process.exit();
}); 