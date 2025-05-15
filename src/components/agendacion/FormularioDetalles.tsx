import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Globe } from 'lucide-react';

interface FormularioDetallesProps {
  anfitrion: string;
  evento: string;
  duracion: string;
  fechaHora: string;
  ubicacion: string;
  onVolver: () => void;
}

const FormularioDetalles: React.FC<FormularioDetallesProps> = ({
  anfitrion,
  evento,
  duracion,
  fechaHora,
  ubicacion,
  onVolver
}) => {
  const [mostrarInvitados, setMostrarInvitados] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg flex w-full max-w-4xl min-h-[700px] overflow-hidden relative">
        {/* Banner superior derecho */}
        <div className="absolute right-0 -top-2">
          <div className="bg-gray-700 text-white text-xs px-4 py-1 rounded-bl-lg rotate-45 origin-top-right select-none" style={{width: '170px', right: '-50px', top: '16px', position: 'absolute'}}>Desarrollado por Calendly</div>
        </div>
        
        {/* Columna izquierda */}
        <div className="w-1/2 p-10 flex flex-col justify-between border-r border-gray-200">
          <div>
            <button 
              onClick={onVolver}
              className="mb-6 text-[#44a58c] hover:text-[#33806c] inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
            </button>
            
            <div className="text-gray-500 font-semibold mb-1">{anfitrion}</div>
            <div className="text-3xl font-bold text-black mb-4">{evento}</div>
            
            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span>{duracion}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>{fechaHora}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <span>{ubicacion}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-black mt-10">
            <a href="#" className="hover:underline">Configuración de cookies</a>
            <a href="#" className="hover:underline">Denunciar abuso</a>
          </div>
        </div>
        
        {/* Columna derecha: formulario */}
        <div className="w-1/2 p-10 flex flex-col">
          <div className="text-2xl font-bold text-black mb-6">Introduzca los detalles</div>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#44a58c]"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#44a58c]"
                required
              />
            </div>
            
            <div>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-[#44a58c] text-[#44a58c] rounded-md hover:bg-[#d0f9eb]"
                onClick={() => setMostrarInvitados(!mostrarInvitados)}
              >
                {mostrarInvitados ? 'Ocultar invitados' : 'Añadir invitados'}
              </button>
            </div>

            {mostrarInvitados && (
              <div>
                <label htmlFor="invitados" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo(s) electrónico(s) de los invitados
                </label>
                <textarea
                  id="invitados"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#44a58c]"
                  placeholder="Ejemplo: correo1@email.com, correo2@email.com"
                ></textarea>
                <div className="text-xs text-gray-500 mt-1">Notifique hasta a 10 invitados adicionales.</div>
              </div>
            )}
            
            <div>
              <label htmlFor="comentarios" className="block text-sm font-medium text-gray-700 mb-1">
                Cuéntenos algo que nos ayude a prepararnos para la reunión.
              </label>
              <textarea
                id="comentarios"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#44a58c]"
              ></textarea>
            </div>
            
            <div className="text-sm text-gray-600">
              Al continuar, confirma que ha leído y está de acuerdo con las{' '}
              <a href="#" className="text-black hover:underline">Condiciones de uso de Calendly</a> y{' '}
              <a href="#" className="text-black hover:underline">Aviso de privacidad</a>.
            </div>
            
            <div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#44a58c] text-white rounded-md hover:bg-[#33806c] focus:outline-none focus:ring-2 focus:ring-[#44a58c] focus:ring-offset-2"
              >
                Programar evento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormularioDetalles; 