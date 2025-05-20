import React from 'react';
import { Clock } from "lucide-react";

interface InfoReunionProps {
  anfitrion: string;
  duracion: string;
  evento: string;
  descripcion: string;
}

const InfoReunion: React.FC<InfoReunionProps> = ({ anfitrion, duracion, evento, descripcion }) => {
  return (
    <div className="w-1/2 p-10 flex flex-col justify-between border-r border-gray-200">
      <div>
        <div className="text-gray-500 font-semibold mb-1">{anfitrion}</div>
        <div className="text-3xl font-bold text-black mb-2">{evento}</div>
        <div className="flex items-center gap-2 text-gray-600 text-base mb-2">
          <Clock className="w-5 h-5" />
          <span>{duracion}</span>
        </div>
        <div className="text-black text-base mt-2">
          <span className="hover:underline cursor-pointer">{descripcion}</span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-black mt-10">
        <a href="#" className="hover:underline">Configuración de cookies</a>
        <a href="#" className="hover:underline">Denunciar abuso</a>
      </div>
    </div>
  );
};

export default InfoReunion; 