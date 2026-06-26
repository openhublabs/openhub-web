import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";
 
const COLLECTION_NAME = "usuarios";
 
export const obtenerUsuarios = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const usuarios = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    return usuarios;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};
 
export const crearUsuario = async (nuevoUsuario) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...nuevoUsuario,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};
 
export const actualizarUsuario = async (idUsuario, usuarioActualizado) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, idUsuario), {
      ...usuarioActualizado,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};
 
export const borrarUsuario = async (idUsuario) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, idUsuario));
    return true;
  } catch (error) {
    console.error("Error al borrar usuario:", error);
    throw error;
  }
};
 
export const obtenerUsuariosPorRol = async (rol) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("rol", "==", rol));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  } catch (error) {
    console.error("Error al obtener usuarios por rol:", error);
    return [];
  }
};
