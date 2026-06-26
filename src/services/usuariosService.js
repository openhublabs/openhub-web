import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";
 
const COLLECTION_NAME = "usuarios"; // Colección para usuario profiles
 
// 1. LEER TODOS LOS USUARIOS
export const obtenerUsuarios = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const usuarios = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return usuarios;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
};
 
// 2. CREAR UN NUEVO USUARIO
export const crearUsuario = async (nuevoUsuario) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, nuevoUsuario.id);

    await setDoc(docRef, {
      email: nuevoUsuario.email,
      rol: nuevoUsuario.rol || 'ADMINISTRADOR',
      estado: nuevoUsuario.estado || 'Activo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return nuevoUsuario.id;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};
 
// 3. ACTUALIZAR UN USUARIO
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
 
// 4. ELIMINAR UN USUARIO
export const borrarUsuario = async (idUsuario) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, idUsuario));
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
    console.error("Error al obtener usuarios por rol:", error);
    return [];
  }
};