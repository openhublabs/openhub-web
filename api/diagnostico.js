// Función de diagnóstico para identificar qué falla en Vercel
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const diagnostics = {
    nodeVersion: process.version,
    platform: process.platform,
    env_FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT ? 'SET (' + process.env.FIREBASE_SERVICE_ACCOUNT.length + ' chars)' : 'NOT SET',
    env_FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET',
    env_FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET',
  };

  // Test 1: ¿Se puede cargar firebase-admin?
  try {
    const admin = require('firebase-admin/app');
    diagnostics.firebaseAdminLoad = 'OK';
  } catch (e) {
    diagnostics.firebaseAdminLoad = 'FAILED: ' + e.message;
    return res.status(200).json(diagnostics);
  }

  // Test 2: ¿Existe el archivo JSON?
  try {
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.resolve(__dirname, '..', 'firebase-admin.json');
    diagnostics.jsonPath = jsonPath;
    diagnostics.jsonExists = fs.existsSync(jsonPath);
    
    // Listar archivos en el directorio padre
    const parentDir = path.resolve(__dirname, '..');
    diagnostics.parentFiles = fs.readdirSync(parentDir).slice(0, 20);
    diagnostics.currentDir = __dirname;
    diagnostics.currentFiles = fs.readdirSync(__dirname).slice(0, 20);
  } catch (e) {
    diagnostics.fsError = e.message;
  }

  // Test 3: ¿Se puede inicializar Firebase?
  try {
    const { initializeApp, cert, getApps } = require('firebase-admin/app');
    const { getAuth } = require('firebase-admin/auth');
    
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      diagnostics.credSource = 'env_var';
    } else if (diagnostics.jsonExists) {
      serviceAccount = require(diagnostics.jsonPath);
      diagnostics.credSource = 'json_file';
    } else {
      diagnostics.credSource = 'NONE';
      diagnostics.error = 'No credentials available';
      return res.status(200).json(diagnostics);
    }

    diagnostics.serviceAccountProjectId = serviceAccount.project_id;
    diagnostics.serviceAccountClientEmail = serviceAccount.client_email;
    diagnostics.serviceAccountHasPrivateKey = !!serviceAccount.private_key;

    if (!getApps().length) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    const auth = getAuth();
    diagnostics.firebaseInit = 'OK';

    // Test 4: ¿Se pueden listar usuarios?
    const listUsersResult = await auth.listUsers(10);
    diagnostics.usersCount = listUsersResult.users.length;
    diagnostics.firstUserEmail = listUsersResult.users[0]?.email || 'N/A';
    diagnostics.status = 'ALL TESTS PASSED';
  } catch (e) {
    diagnostics.firebaseError = e.message;
    diagnostics.firebaseErrorCode = e.code;
  }

  return res.status(200).json(diagnostics);
};
