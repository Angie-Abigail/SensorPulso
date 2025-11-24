import { useState, useEffect } from "react";
import Navbar from "../Componentes/Navbar";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { User, Mail, Lock, LogOut, ChevronRight, Settings, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Nuevo estado de carga

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Opcional: Podrías loguear automáticamente o pedir verificación
      }
    } catch (err) {
      console.error(err);
      if(err.code === 'auth/invalid-email') setError("El correo no es válido.");
      else if(err.code === 'auth/user-not-found') setError("Usuario no encontrado.");
      else if(err.code === 'auth/wrong-password') setError("Contraseña incorrecta.");
      else if(err.code === 'auth/email-already-in-use') setError("El correo ya está registrado.");
      else setError("Ocurrió un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const salir = async () => {
    await signOut(auth);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans relative">
      
      {/* Header Decorativo (Solo fondo superior) */}
      <div className="h-48 bg-rose-500 rounded-b-[40px] absolute top-0 w-full z-0 shadow-lg"></div>

      <div className="relative z-10 px-6 pt-12">
        
        {/* Título de Página */}
        <div className="text-center mb-8">
           <h1 className="text-2xl font-bold text-white tracking-wide">
             {user ? "Mi Cuenta" : "Bienvenido a HeartCare+"}
           </h1>
           <p className="text-rose-100 text-sm mt-1 opacity-90">
             {user ? "Gestiona tu información personal" : "Monitoreo de salud en tiempo real"}
           </p>
        </div>

        {/* ============================
             SI EL USUARIO NO ESTÁ LOGEADO (LOGIN CARD)
           ============================ */}
        {!user ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 transition-all duration-300">
            
            {/* Tabs Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button 
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${!isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}
              >
                Registrarse
              </button>
            </div>

            <div className="space-y-4">
              {/* Input Correo */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-700"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Input Contraseña */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all text-slate-700"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <p className="text-sm text-rose-600 font-medium">{error}</p>
              </div>
            )}

            {/* Botón de Acción */}
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Procesando...
                </>
              ) : (
                isLogin ? "Ingresar" : "Crear cuenta"
              )}
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4">
               Protegido por seguridad médica estándar
            </p>
          </div>
        ) : (
          
          /* ============================
               SI EL USUARIO ESTÁ LOGEADO (PROFILE DASHBOARD)
             ============================ */
          <div className="space-y-6">
            
            {/* Tarjeta de Perfil Principal */}
            <div className="bg-white rounded-3xl p-6 shadow-lg flex flex-col items-center relative overflow-hidden">
                {/* Fondo decorativo sutil */}
                <div className="absolute top-0 w-full h-20 bg-gradient-to-b from-rose-50 to-transparent"></div>
                
                <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-md bg-slate-100 flex items-center justify-center mb-3">
                    <User className="w-10 h-10 text-slate-400" />
                </div>
                
                <h2 className="text-xl font-bold text-slate-800">Paciente</h2>
                <p className="text-sm text-slate-500 mb-2">{user.email}</p>
                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <ShieldCheck size={12} /> Cuenta Verificada
                </span>
            </div>

            {/* Menú de Opciones (Simulado para estética) */}
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-100 p-2 rounded-lg text-rose-500 group-hover:bg-rose-200 transition">
                            <User size={20} />
                        </div>
                        <span className="text-slate-600 font-medium">Editar Datos Personales</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                </div>

                <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex justify-between items-center cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-500 group-hover:bg-blue-200 transition">
                            <Settings size={20} />
                        </div>
                        <span className="text-slate-600 font-medium">Configuración del Sensor</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                </div>
            </div>

            {/* Botón de Cerrar Sesión */}
            <button
              onClick={salir}
              className="w-full bg-white border border-rose-100 text-rose-500 font-semibold py-4 rounded-2xl shadow-sm hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>

            <p className="text-center text-xs text-slate-400 pt-4">
                Versión 1.0.0 • MediHealth App
            </p>
          </div>
        )}

      </div>
      <Navbar />
    </div>
  );
}