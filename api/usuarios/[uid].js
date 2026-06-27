const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

function getServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (sa.private_key) {
      sa.private_key = sa.private_key.replace(/\\n/g, '\n');
    }
    return sa;
  }
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
    };
  }
  try {
    const fs = require('fs');
    const path = require('path');
    const localPath = path.resolve(__dirname, '../../firebase-admin.json');
    if (fs.existsSync(localPath)) {
      return JSON.parse(fs.readFileSync(localPath, 'utf8'));
    }
    return null;
  } catch (e) {
    return null;
  }
}

let auth = null;
let initError = null;

try {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    initError = 'No se encontraron credenciales de Firebase. Configura FIREBASE_SERVICE_ACCOUNT en Vercel Dashboard.';
  } else {
    if (!getApps().length) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    auth = getAuth();
  }
} catch (e) {
  initError = 'Error inicializando Firebase: ' + e.message;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (initError || !auth) {
    return res.status(500).json({
      error: 'Firebase no inicializado',
      message: initError || 'auth es null',
      hint: 'Configura FIREBASE_SERVICE_ACCOUNT en Vercel Dashboard'
    });
  }

  const { uid } = req.query;

  if (req.method === 'DELETE') {
    try {
      await auth.deleteUser(uid);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

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
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
};
