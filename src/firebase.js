import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC8qBKEUiX0H9OR8cCyuVrnR2T848pJ_3M",
    authDomain: "openhub-181a8.firebaseapp.com",
    projectId: "openhub-181a8",
    storageBucket: "openhub-181a8.firebasestorage.app",
    messagingSenderId: "908924325061",
    appId: "1:908924325061:web:357ee94667a0471346b4ac",
    measurementId: "G-SGFC4EVNQN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);