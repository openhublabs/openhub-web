const express = require('express');
const cors = require('cors');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Busca el archivo de credenciales de forma segura en la raíz
const serviceAccount = require("./firebase-admin.json");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const auth = getAuth();
const app = express();

app.use(cors());
app.use(express.json());

// 1. RUTA PARA LISTAR
app.get('/api/usuarios', async (req, res) => {
  try {
    const listUsersResult = await auth.listUsers(1000);
    const usuarios = listUsersResult.users.map(user => ({
      id: user.uid,
      email: user.email || 'sin-correo@openhub.com',
      rol: user.customClaims?.rol ?? 'MIEMBRO',
      estado: user.disabled ? 'Inactivo' : 'Activo'
    }));
    res.json(usuarios);
  } catch (error) {
    console.error("Error en servidor local GET:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. RUTA PARA ELIMINAR (ESTA ERA LA QUE FALTABA, CARAJO)
app.delete('/api/usuarios/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    await auth.deleteUser(uid);
    console.log(`✅ Usuario ${uid} eliminado correctamente de Firebase Auth`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error en servidor local DELETE:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. RUTA PARA BANEAR / DESBANEAR
app.patch('/api/usuarios/:uid/ban', async (req, res) => {
  try {
    const { uid } = req.params;
    const { disabled } = req.body;
    await auth.updateUser(uid, { disabled });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error en servidor local BAN:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. RUTA PARA CAMBIAR ROL
app.patch('/api/usuarios/:uid/rol', async (req, res) => {
  try {
    const { uid } = req.params;
    const { rol } = req.body;
    await auth.setCustomUserClaims(uid, { rol });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error en servidor local ROL:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log('🚀 BACKEND CORRIENDO EN EL PUERTO 5000 - RUTAS COMPLETAS OK');
});