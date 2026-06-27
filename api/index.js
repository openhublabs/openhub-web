const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Lee la variable en Vercel o tu archivo local si estás desarrollando en tu PC
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require("../firebase-admin.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const auth = getAuth();

module.exports = async (req, res) => {
  // Configuración de CORS necesaria para Vercel
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
      return res.status(500).json({ error: error.message });
    }
  }
}
  return res.status(405).json({ error: 'Método no permitido' });
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // EN ESTE ARCHIVO SOLO DEBE ENTRAR EL GET
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

  // Si intentan meter un DELETE o PATCH aquí en Vercel, le decimos que vaya al otro archivo
  return res.status(405).json({ error: 'Método no permitido. Use /api/usuarios/[uid]' });
};