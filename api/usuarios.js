const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

// Inicialización robusta: funciona tanto en Vercel (env vars) como en local (archivo JSON)
let serviceAccount;
let initSource = 'unknown';

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Producción (Vercel): lee desde variable de entorno (JSON completo)
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initSource = 'FIREBASE_SERVICE_ACCOUNT env var';
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    // Alternativa: variables de entorno individuales
    serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    };
    initSource = 'individual env vars';
  } else {
    // Local: lee desde archivo JSON
    const jsonPath = path.resolve(__dirname, '..', 'firebase-admin.json');
    if (fs.existsSync(jsonPath)) {
      serviceAccount = require(jsonPath);
      initSource = 'local JSON file';
    } else {
      throw new Error(
        'No se encontraron credenciales de Firebase. ' +
        'Configura FIREBASE_SERVICE_ACCOUNT en las variables de entorno de Vercel. ' +
        'Ruta buscada: ' + jsonPath
      );
    }
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
} catch (initError) {
  // Guardamos el error para retornarlo en la respuesta
  console.error('Error inicializando Firebase Admin:', initError);
  module.exports = async (req, res) => {
    return res.status(500).json({ 
      error: 'Firebase initialization failed',
      message: initError.message,
      hint: 'Configura la variable de entorno FIREBASE_SERVICE_ACCOUNT en Vercel Dashboard > Settings > Environment Variables'
    });
  };
  return; // Salimos para no definir el handler normal
}

const auth = getAuth();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const listUsersResult = await auth.listUsers(1000);
      const usuarios = listUsersResult.users.map(user => ({
        id: user.uid,
        email: user.email || 'sin-correo@openhub.com',
        rol: user.customClaims?.rol ?? 'MIEMBRO',
        estado: user.disabled ? 'Inactivo' : 'Activo'
      }));
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error('Error listando usuarios:', error);
      return res.status(500).json({ error: error.message, source: initSource });
    }
  }

  return res.status(405).json({ error: 'Método no permitido. Use /api/usuarios/[uid]' });
};