import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const COLLECTION_NAME = 'usuarios';

// 1. LEER TODOS LOS USUARIOS DIRECTO DE FIRESTORE
export const obtenerUsuarios = async () => {
  try {
    const usuariosCol = collection(db, COLLECTION_NAME);
    const usuariosSnapshot = await getDocs(usuariosCol);
    const usuariosList = usuariosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return usuariosList;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};

// 2. CREAR UN NUEVO USUARIO EN FIRESTORE
export const crearUsuario = async (nuevoUsuario) => {
  try {
    const id = nuevoUsuario.uid || nuevoUsuario.id || Date.now().toString();
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, nuevoUsuario);
    return id;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// 3. ACTUALIZAR UN USUARIO
export const actualizarUsuario = async (idUsuario, usuarioActualizado) => {
  try {
    const usuarioRef = doc(db, COLLECTION_NAME, idUsuario);
    await updateDoc(usuarioRef, usuarioActualizado);
    return true;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

// 4. ELIMINAR UN USUARIO
export const borrarUsuario = async (idUsuario) => {
  try {
    const usuarioRef = doc(db, COLLECTION_NAME, idUsuario);
    await deleteDoc(usuarioRef);
    return true;
  } catch (error) {
    console.error("Error al borrar usuario:", error);
    throw error;
  }
};

// 5. OBTENER USUARIOS POR ROL
export const obtenerUsuariosPorRol = async (rol) => {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("rol", "==", rol));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al filtrar por rol:", error);
    return [];
  }
};