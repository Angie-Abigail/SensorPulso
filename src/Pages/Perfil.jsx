import { useState, useEffect } from "react";
import Navbar from "../Componentes/Navbar";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }
  };

  const registrar = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError("");
      setIsLogin(true);
    } catch (err) {
      setError("No se pudo registrar. Verifica tu correo.");
    }
  };

  const salir = async () => {
    await signOut(auth);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen px-6 pt-10">

      <h1 className="text-2xl font-bold text-gray-800 text-center">Mi Perfil</h1>

      {/* ============================
          SI EL USUARIO NO ESTÁ LOGEADO
      ============================ */}
      {!user ? (
        <div className="mt-10 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold mb-4 text-center text-red-500">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>

          <input
            type="email"
            placeholder="Correo"
            className="w-full mb-3 p-3 border rounded-lg"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full mb-3 p-3 border rounded-lg"
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {isLogin ? (
            <button
              className="w-full bg-red-500 text-white py-3 rounded-lg mt-4"
              onClick={login}
            >
              Entrar
            </button>
          ) : (
            <button
              className="w-full bg-blue-500 text-white py-3 rounded-lg mt-4"
              onClick={registrar}
            >
              Registrarse
            </button>
          )}

          <button
            className="mt-4 text-sm text-blue-600 w-full text-center"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin
              ? "¿No tienes cuenta? Crear una nueva"
              : "¿Ya tienes cuenta? Iniciar sesión"}
          </button>
        </div>
      ) : (
        <>
          {/* ============================
              SI EL USUARIO ESTÁ LOGEADO
          ============================ */}
          <div className="mt-10 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Bienvenido(a)
            </h2>

            <p className="text-gray-700">
              <strong>Correo:</strong> {user.email}
            </p>

            <button
              className="w-full bg-red-500 text-white py-3 rounded-lg mt-6"
              onClick={salir}
            >
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      <Navbar />
    </div>
  );
}
