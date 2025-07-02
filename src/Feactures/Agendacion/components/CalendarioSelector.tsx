import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { DateTime } from 'luxon';

interface ZonaHoraria {
  id: string;
  nombre: string;
  offset: number;
}

interface CalendarioSelectorProps {
  onSelectDay: (day: number) => void;
  onCambioZonaHoraria: (zona: ZonaHoraria) => void;
}

const meses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const diasSemana = ['DOM.', 'LUN.', 'MAR.', 'MIÉ.', 'JUE.', 'VIE.', 'SÁB.'];

// Lista simplificada de zonas horarias comunes para una mejor experiencia de usuario
const zonasHorariasComunes = [
  { nombre: 'America/Bogota', etiqueta: 'Bogotá, Lima, Quito' },
  { nombre: 'America/Mexico_City', etiqueta: 'Ciudad de México' },
  { nombre: 'America/Santiago', etiqueta: 'Santiago de Chile' },
  { nombre: 'America/Argentina/Buenos_Aires', etiqueta: 'Buenos Aires' },
  { nombre: 'Europe/Madrid', etiqueta: 'Madrid' },
  { nombre: 'Europe/Paris', etiqueta: 'París, Roma, Berlín' },
  { nombre: 'Europe/London', etiqueta: 'Londres' },
  { nombre: 'America/New_York', etiqueta: 'Nueva York' },
  { nombre: 'America/Los_Angeles', etiqueta: 'Los Ángeles' },
  { nombre: 'Asia/Tokyo', etiqueta: 'Tokio' },
  { nombre: 'Asia/Shanghai', etiqueta: 'Shanghái, Beijing' },
];

function getDiasDelMes(mes: number, anio: number) {
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const dias = [];
  for (let i = 0; i < primerDia; i++) dias.push(null);
  for (let d = 1; d <= diasEnMes; d++) dias.push(d);
  return dias;
}

const CalendarioSelector: React.FC<CalendarioSelectorProps> = ({ onSelectDay, onCambioZonaHoraria }) => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [mostrarZonas, setMostrarZonas] = useState(false);
  const [zonasHorarias, setZonasHorarias] = useState<ZonaHoraria[]>([]);
  const [zonaHoraria, setZonaHoraria] = useState<ZonaHoraria>({
    id: 'America/Bogota',
    nombre: 'Bogotá, Lima, Quito (GMT-5)',
    offset: -5
  });

  useEffect(() => {
    // Crear lista de zonas horarias con información de offset
    const zonasFormateadas = zonasHorariasComunes.map(zona => {
      try {
        const ahora = DateTime.now().setZone(zona.nombre);
        const offset = ahora.toFormat("Z");
        return {
          id: zona.nombre,
          nombre: `${zona.etiqueta} (${offset})`,
          offset: ahora.offset / 60,
        };
      } catch (error) {
        console.error(`Error al procesar zona ${zona.nombre}:`, error);
        return {
          id: zona.nombre,
          nombre: `${zona.etiqueta} (error)`,
          offset: 0,
        };
      }
    });
    setZonasHorarias(zonasFormateadas);
  }, []);

  const dias = getDiasDelMes(mes, anio);

  const handlePrevMonth = () => {
    if (mes === 0) {
      setMes(11);
      setAnio(anio - 1);
    } else {
      setMes(mes - 1);
    }
    setDiaSeleccionado(null);
  };
  
  const handleNextMonth = () => {
    if (mes === 11) {
      setMes(0);
      setAnio(anio + 1);
    } else {
      setMes(mes + 1);
    }
    setDiaSeleccionado(null);
  };

  const handleSelectDay = (day: number) => {
    setDiaSeleccionado(day);
    onSelectDay(day);
  };

  const handleSelectZona = (zona: ZonaHoraria) => {
    setZonaHoraria(zona);
    setMostrarZonas(false);
    onCambioZonaHoraria(zona);
  };

  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  return (
    <>
      <div className="text-2xl font-bold text-black mb-6 leading-tight">Selecciona una fecha y hora</div>
      <div className="bg-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <button className="text-gray-400 hover:text-gray-600" onClick={handlePrevMonth}>&#60;</button>
            <span className="font-medium capitalize">{meses[mes]} {anio}</span>
            <button className="text-gray-400 hover:text-gray-600" onClick={handleNextMonth}>&#62;</button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
            {diasSemana.map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-base">
            {dias.map((d, idx) => d === null ? <div key={idx}></div> : (
              <button
                key={idx}
                className={`rounded-full w-10 h-10 transition-colors
                  ${diaSeleccionado === d 
                    ? 'bg-[#44a58c] text-white font-bold' 
                    : 'bg-[#d0f9eb] text-[#2a6657] hover:bg-[#a6ebda] hover:text-[#1d4b3e]'}
                `}
                onClick={() => handleSelectDay(d as number)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-700">
          <div className="font-bold mb-2">Zona horaria</div>
          <div className="relative">
            <button
              className="w-full flex items-center justify-between border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#44a58c] focus:outline-none"
              onClick={() => setMostrarZonas(!mostrarZonas)}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span>{zonaHoraria.nombre}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            
            {mostrarZonas && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {zonasHorarias.map((zona) => (
                  <button
                    key={zona.id}
                    className="w-full text-left px-4 py-2 hover:bg-[#d0f9eb] focus:outline-none focus:bg-[#d0f9eb]"
                    onClick={() => handleSelectZona(zona)}
                  >
                    {zona.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalendarioSelector; 