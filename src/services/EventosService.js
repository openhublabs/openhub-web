import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
 
const COLLECTION_NAME = "events";
 
// 1. LEER TODOS LOS EVENTOS
export const obtenerEventos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const eventos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return eventos;
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    return [];
  }
};
 
// 2. CREAR UN NUEVO EVENTO
export const crearEvento = async (nuevoEvento) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...nuevoEvento,
      clips: nuevoEvento.clips || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
};
 
// 3. ACTUALIZAR UN EVENTO
export const actualizarEvento = async (idEvento, eventoActualizado) => {
  try {
    await updateDoc(doc(db, COLLECTION_NAME, idEvento), {
      ...eventoActualizado,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    throw error;
  }
};
 
// 4. ELIMINAR UN EVENTO
export const borrarEvento = async (idEvento) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, idEvento));
    return true;
  } catch (error) {
    console.error("Error al borrar evento:", error);
    throw error;
  }
};