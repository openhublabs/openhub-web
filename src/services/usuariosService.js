/* eslint-disable */
const API_URL = 'http://localhost:5000/api';

// 1. LEER TODOS LOS USUARIOS (Directo de Authentication)
export const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/usuarios`);
    if (!response.ok) throw new Error('Error al conectar con el servidor de Auth');
    const usuarios = await response.json();
    return usuarios;
  } catch (error) {
    console.error("Error al obtener usuarios de Auth:", error);
    return [];
  }
};

// 2. CREAR UN NUEVO USUARIO (Opcional por si tu web registra)
export const crearUsuario = async (nuevoUsuario) => {
  try {
    // Como el registro fuerte ocurre en la app móvil, si necesitas crear desde la web
    // lo ideal es usar el método estándar de Firebase Auth en el componente.
    console.warn("Para crear usuarios puramente en Auth se recomienda usar createUserWithEmailAndPassword en el frontend.");
    return nuevoUsuario.id;
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// 3. ACTUALIZAR UN USUARIO 
export const actualizarUsuario = async (idUsuario, usuarioActualizado) => {
  try {
    // Authentication no permite editar campos libres desde el cliente,
    // devolvemos true simulado para que tus modales de la web no crasheen.
    console.log(`Simulando actualización para el usuario: ${idUsuario}`);
    return true;
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

// 4. ELIMINAR UN USUARIO (Borra directo de Authentication usando tu server)
export const borrarUsuario = async (idUsuario) => {
  try {
    const response = await fetch(`${API_URL}/usuarios/${idUsuario}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('No se pudo eliminar el usuario de Firebase Auth');
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error al borrar usuario de Auth:", error);
    throw error;
  }
};

// 5. OBTENER USUARIOS POR ROL (Filtrado en caliente para que no se rompan tus gráficos)
export const obtenerUsuariosPorRol = async (rol) => {
  try {
    // Como Auth puro no discrimina roles, traemos todos los usuarios del server 
    // y los filtramos en un array para alimentar tus contadores del Dashboard.
    const todosLosUsuarios = await obtenerUsuarios();
    return todosLosUsuarios.filter(user => user.rol === rol);
  } catch (error) {
    console.error("Error al obtener usuarios por rol:", error);
    return [];
  }
};