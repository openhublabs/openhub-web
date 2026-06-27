const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require("../../firebase-admin.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
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

  // Vercel obtiene automáticamente el [uid] de la URL
  const { uid } = req.query;

  // 1. ELIMINAR (DELETE)
  if (req.method === 'DELETE') {
    try {
      await auth.deleteUser(uid);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  // 2. MODIFICACIONES (PATCH)
  if (req.method === 'PATCH') {
    try {
      const { disabled, rol } = req.body;

      // Si el body trae disabled, es la ruta de Ban / Unban
      if (disabled !== undefined) {
        await auth.updateUser(uid, { disabled });
        return res.status(200).json({ success: true });
      }

      // Si el body trae rol, es la ruta de Custom Claims (Privilegios)
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