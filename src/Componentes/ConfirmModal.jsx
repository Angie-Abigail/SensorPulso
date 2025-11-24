import { Save, X, Loader2 } from "lucide-react";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  isLoading 
}) {
  
  // Si no está abierto, no renderizamos nada (return null)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      
      {/* Backdrop (Fondo oscuro borroso) */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={!isLoading ? onClose : undefined} // Evita cerrar si está cargando
      ></div>

      {/* Contenido de la Tarjeta */}
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Botón X de cerrar */}
        {!isLoading && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center text-center">
          {/* Icono Decorativo */}
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mb-4">
            <Save className="w-7 h-7 text-rose-500" />
          </div>

          <h3 className="text-lg font-bold text-slate-800">
            {title || "¿Estás seguro?"}
          </h3>
          
          <p className="text-slate-500 text-sm mt-2 mb-6 leading-relaxed">
            {message || "Esta acción no se puede deshacer."}
          </p>

          {/* Botones de Acción */}
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 shadow-md shadow-rose-200 transition active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Guardando...
                </>
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}