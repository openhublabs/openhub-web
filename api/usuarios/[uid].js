const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

// Inicialización robusta: funciona tanto en Vercel (env vars) como en local (archivo JSON)
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
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
  } else {
    const jsonPath = path.resolve(__dirname, '..', '..', 'firebase-admin.json');
    if (fs.existsSync(jsonPath)) {
      serviceAccount = require(jsonPath);
    } else {
      throw new Error(
        'No se encontraron credenciales de Firebase. ' +
        'Configura FIREBASE_SERVICE_ACCOUNT en Vercel.'
      );
    }
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
} catch (initError) {
  console.error('Error inicializando Firebase Admin:', initError);
  module.exports = async (req, res) => {
    return res.status(500).json({ 
      error: 'Firebase initialization failed',
      message: initError.message,
      hint: 'Configura FIREBASE_SERVICE_ACCOUNT en Vercel Dashboard'
    });
  };
  return;
}

const auth = getAuth();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { uid } = req.query;

  // 1. ELIMINAR (DELETE)
  if (req.method === 'DELETE') {
    try {
      await auth.deleteUser(uid);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // 2. MODIFICACIONES (PATCH)
  if (req.method === 'PATCH') {
    try {
      const { disabled, rol } = req.body;

      if (disabled !== undefined) {
        await auth.updateUser(uid, { disabled });
        return res.status(200).json({ success: true });
      }

      if (rol !== undefined) {
        await auth.setCustomUserClaims(uid, { rol });
        return res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error('Error modificando usuario:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
};