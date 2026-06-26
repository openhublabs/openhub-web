const express = require('express');
const cors = require('cors');
const { cert, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const serviceAccount = require("./firebase-admin.json");

initializeApp({
  credential: cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

// RUTA 1: LISTAR USUARIOS
app.get('/api/usuarios', async (req, res) => {
  try {
    const listUsersResult = await getAuth().listUsers(1000);
    const usuarios = listUsersResult.users.map(user => ({
      id: user.uid,
      email: user.email || 'sin-correo@openhub.com',
      rol: user.customClaims?.rol ?? 'MIEMBRO',
      estado: user.disabled ? 'Inactivo' : 'Activo'
    }));
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA 2: ELIMINAR USUARIO
app.delete('/api/usuarios/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    await getAuth().deleteUser(uid);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA 3: BANEAR / DESBANEAR
app.patch('/api/usuarios/:uid/ban', async (req, res) => {
  try {
    const { uid } = req.params;
    const { disabled } = req.body;
    await getAuth().updateUser(uid, { disabled });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RUTA 4: CAMBIAR ROL
app.patch('/api/usuarios/:uid/rol', async (req, res) => {
  try {
    const { uid } = req.params;
    const { rol } = req.body;
    await getAuth().setCustomUserClaims(uid, { rol });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log('🚀 Backend corriendo en el puerto 5000');
});