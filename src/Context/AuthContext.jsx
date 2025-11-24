// src/context/authContext.jsx
// 👇 Contexto de autenticación unificado: Auth + Firestore + Storage

import { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider, db, storage } from "../lib/firebase";

import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile, // 💡 IMPORTANTE: Necesario para cambiar displayName y photoURL
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc, // 💡 IMPORTANTE: Necesario para actualizar el documento de perfil
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// 1. Creamos el contexto
const AuthContext = createContext();

// 2. Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

// 3. Componente proveedor
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función que mezcla datos de Auth + Firestore en un solo objeto user
  const cargarUsuarioCompleto = async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      return;
    }

    try {
      // Asegúrate de que tu colección se llama 'usuarios'
      const userRef = doc(db, "usuarios", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const profile = snap.data();
        setUser({
          ...firebaseUser,
          ...profile,
        });
      } else {
        setUser(firebaseUser);
      }
    } catch (error) {
      console.error("Error al cargar usuario completo:", error);
      setUser(firebaseUser);
    }
  };

  // Escuchamos cambios de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await cargarUsuarioCompleto(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  // =========================================================================
  // 🚀 NUEVAS FUNCIONES PARA EL DASHBOARD/MI PERFIL
  // =========================================================================

  // 🟢 FUNCIÓN 1: Actualizar datos personales (Nombre, Apellido, etc.)
  const updateProfileData = async (data) => {
    if (!user) throw new Error("No hay usuario autenticado para actualizar.");

    const userRef = doc(db, 'usuarios', user.uid);
    const { nombre, apellido, ...firestoreData } = data;

    // 1. Crear el nombre completo para Firebase Auth
    const newDisplayName = `${nombre} ${apellido}`.trim();

    // 2. Actualizar Firebase Auth (displayName)
    await updateProfile(auth.currentUser, {
      displayName: newDisplayName,
    });

    // 3. Actualizar Firestore
    await updateDoc(userRef, {
      username: nombre, // Guardamos el nombre de pila como 'username'
      lastName: apellido, // Guardamos el apellido
      ...firestoreData, // Campos adicionales (celular, genero, etc.)
      updatedAt: serverTimestamp()
    });

    // 4. Recargar el usuario completo para reflejar los cambios en el contexto
    await cargarUsuarioCompleto(auth.currentUser);
  };


  // 🟢 FUNCIÓN 2: Actualizar la foto de perfil (Avatar)
  const updateAvatar = async (file) => {
    if (!user) throw new Error("No hay usuario autenticado para actualizar el avatar.");

    // 1. Subir el archivo a Storage (usamos el UID del usuario para la carpeta)
    const storageRef = ref(storage, `avatars/${user.uid}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);

    // 2. Obtener la URL de descarga
    const photoURL = await getDownloadURL(snapshot.ref);

    // 3. Actualizar la URL en Firebase Auth
    await updateProfile(auth.currentUser, { photoURL });

    // 4. Actualizar la URL en Firestore
    const userRef = doc(db, 'usuarios', user.uid);
    await updateDoc(userRef, { avatar: photoURL });

    // 5. Recargar el usuario completo para reflejar los cambios
    await cargarUsuarioCompleto(auth.currentUser);
  };

  // =========================================================================
  // 🛑 FIN DE LAS NUEVAS FUNCIONES
  // =========================================================================


  // 🟢 REGISTRO con email/password + avatar en Storage + perfil en Firestore
  const register = async (
    email,
    password,
    {
      username,
      avatarFile,
    }
  ) => {
    // ... (Tu lógica existente para registro) ...
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;
    const uid = firebaseUser.uid;

    let avatarUrl = "";
    if (avatarFile) {
      const uniqueName = `${uid}-${Date.now()}-${avatarFile.name}`;
      const avatarRef = ref(storage, `avatars/${uid}/${uniqueName}`); // 💡 CAMBIO: Usar carpeta 'avatars/UID' para consistencia
      await uploadBytes(avatarRef, avatarFile);
      avatarUrl = await getDownloadURL(avatarRef);
    }

    // Actualizar Auth con el displayName inicial si es posible
    await updateProfile(firebaseUser, { displayName: username || email.split('@')[0] });


    // 3. Crear documento de perfil en Firestore
    const userRef = doc(db, "usuarios", uid);
    await setDoc(userRef, {
      uid,
      email,
      username,
      avatar: avatarUrl,
      provider: "password",
      createdAt: serverTimestamp()
    });

    await cargarUsuarioCompleto(firebaseUser);
    return firebaseUser;
  };

  // 🟢 LOGIN con email/password
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = cred.user;

    await cargarUsuarioCompleto(firebaseUser);
    return firebaseUser;
  };

  // 🟢 LOGIN con Google (y creación de perfil si no existe)
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const gUser = result.user;

    const userRef = doc(db, "usuarios", gUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: gUser.uid,
        email: gUser.email,
        username: gUser.displayName || "",
        avatar: gUser.photoURL || "",
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }

    await cargarUsuarioCompleto(gUser);

    return gUser;
  };

  // 🟢 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 🟢 RESET PASSWORD
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    // 💡 EXPORTAR las nuevas funciones de actualización
    updateProfileData,
    updateAvatar,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}