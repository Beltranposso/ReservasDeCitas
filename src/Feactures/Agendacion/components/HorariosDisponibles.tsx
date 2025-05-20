import React, { useState } from 'react';

interface HorariosDisponiblesProps {
  diaSeleccionado: number;
  mes: number;
  anio: number;
  onSelectHora: (hora: string) => void;
  onVolver: () => void;
  onSiguiente: () => void;
}

const diasCompletos = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const meses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const horasDisponibles = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

const HorariosDisponibles: React.FC<HorariosDisponiblesProps> = ({ 
  diaSeleccionado, 
  mes, 
  anio, 
  onSelectHora, 
  onVolver,
  onSiguiente
}) => {
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

  const obtenerFechaFormateada = () => {
    const fecha = new Date(anio, mes, diaSeleccionado);
    const diaSemana = fecha.getDay(); // 0 para domingo, 6 para sábado
    
    return `${diasCompletos[diaSemana]}, ${diaSeleccionado} de ${meses[mes]}`;
  };

  const handleSelectHora = (hora: string) => {
    setHoraSeleccionada(hora);
    onSelectHora(hora);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button 
          className="text-[#44a58c] hover:text-[#33806c] flex items-center"
          onClick={onVolver}
        >
          &#60; Volver
        </button>
      </div>
      <div className="text-xl text-gray-700 mb-4">
        {obtenerFechaFormateada()}
      </div>
      <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto">
        {horasDisponibles.map((hora) => (
          horaSeleccionada === hora ? (
            <div key={hora} className="grid grid-cols-2 gap-2">
              <button
                className="border rounded-md text-center py-4 transition-colors bg-gray-600 text-white"
                onClick={() => handleSelectHora(hora)}
              >
                {hora}
              </button>
              <button
                className="border rounded-md text-center py-4 transition-colors bg-[#44a58c] text-white hover:bg-[#33806c]"
                onClick={onSiguiente}
              >
                Siguiente
              </button>
            </div>
          ) : (
            <button
              key={hora}
              className="border rounded-md text-center py-4 transition-colors border-gray-300 hover:border-[#44a58c] hover:bg-[#d0f9eb]"
              onClick={() => handleSelectHora(hora)}
            >
              {hora}
            </button>
          )
        ))}
      </div>
    </>
  );
};

export default HorariosDisponibles; 