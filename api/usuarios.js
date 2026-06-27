import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

// ============================================================
// INICIALIZACIÓN DE FIREBASE ADMIN
// En Vercel: usa la variable de entorno FIREBASE_SERVICE_ACCOUNT
// En local: usa el archivo firebase-admin.json
// ============================================================
function getServiceAccount() {
  // 1. Variable de entorno con JSON completo (recomendado para Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  // 2. Variables de entorno individuales (alternativa)
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

  // 3. Archivo local (solo funciona en desarrollo)
  try {
    const require = createRequire(import.meta.url);
    return require("../firebase-admin.json");
  } catch (e) {
    return null;
  }
}

let auth = null;
let initError = null;

try {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    initError = 'No se encontraron credenciales de Firebase. Configura FIREBASE_SERVICE_ACCOUNT en Vercel Dashboard > Settings > Environment Variables.';
  } else {
    if (!getApps().length) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    auth = getAuth();
  }
} catch (e) {
  initError = 'Error inicializando Firebase: ' + e.message;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Si Firebase no se pudo inicializar, retornar error descriptivo
  if (initError || !auth) {
    return res.status(500).json({
      error: 'Firebase no inicializado',
      message: initError || 'auth es null',
      hint: 'Configura FIREBASE_SERVICE_ACCOUNT en Vercel Dashboard > Settings > Environment Variables'
    });
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
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido. Use /api/usuarios/[uid]' });
}