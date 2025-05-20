import React, { useState } from 'react';
import InfoReunion from './components/InfoReunion';
import CalendarioSelector from './components/CalendarioSelector';
import HorariosDisponibles from './components/HorariosDisponibles';
import FormularioDetalles from './components/FormularioDetalles';

interface ZonaHoraria {
  id: string;
  nombre: string;
  offset: number;
}

interface AgendacionPageProps {
  anfitrion: string;
  duracion: string;
  evento: string;
  descripcion: string;
}

const meses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const diasCompletos = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const AgendacionPage: React.FC<AgendacionPageProps> = ({ anfitrion, duracion, evento, descripcion }) => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [zonaHoraria, setZonaHoraria] = useState<ZonaHoraria>({
    id: 'america_bogota',
    nombre: 'Bogotá, Jamaica, Lima (GMT-5)',
    offset: -5
  });

  const handleSelectDay = (day: number) => {
    setDiaSeleccionado(day);
  };

  const handleSelectHora = (hora: string) => {
    setHoraSeleccionada(hora);
  };

  const handleVolver = () => {
    setDiaSeleccionado(null);
    setHoraSeleccionada(null);
    setMostrarFormulario(false);
  };

  const handleSiguiente = () => {
    setMostrarFormulario(true);
  };

  const handleVolverAHorarios = () => {
    setMostrarFormulario(false);
  };

  const handleCambioZonaHoraria = (zona: ZonaHoraria) => {
    setZonaHoraria(zona);
  };

  // Obtener el nombre del día de la semana para la fecha seleccionada
  const obtenerFechaFormateada = () => {
    if (!diaSeleccionado) return null;
    
    const fecha = new Date(anio, mes, diaSeleccionado);
    const diaSemana = fecha.getDay(); // 0 para domingo, 6 para sábado
    
    return `${diasCompletos[diaSemana]}, ${diaSeleccionado} de ${meses[mes]}`;
  };

  // Formatear la fecha y hora para mostrar en el componente de formulario
  const obtenerFechaHoraFormateada = () => {
    if (!diaSeleccionado || !horaSeleccionada) return '';
    
    const fecha = new Date(anio, mes, diaSeleccionado);
    const diaSemana = fecha.getDay();
    
    // Calcular la hora final sumando la duración (asumiendo que es "30 min")
    const horaInicio = horaSeleccionada;
    const [horaInicioStr, minInicioStr] = horaInicio.split(':');
    const horaInicioNum = parseInt(horaInicioStr);
    const minInicioNum = parseInt(minInicioStr);
    
    // Calcular hora final (asumiendo 30 min)
    let horaFinNum = horaInicioNum;
    let minFinNum = minInicioNum + 30;
    
    if (minFinNum >= 60) {
      minFinNum -= 60;
      horaFinNum += 1;
    }
    
    const horaFin = `${horaFinNum.toString().padStart(2, '0')}:${minFinNum.toString().padStart(2, '0')}`;
    
    return `${horaInicio} - ${horaFin}, ${diasCompletos[diaSemana]}, ${diaSeleccionado} de ${meses[mes]} de ${anio}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {!mostrarFormulario ? (
        <div className="bg-white rounded-xl shadow-lg flex w-full max-w-4xl min-h-[700px] overflow-hidden relative">
          {/* Banner superior derecho */}
          <div className="absolute right-0 -top-2">
            <div className="bg-gray-700 text-white text-xs px-4 py-1 rounded-bl-lg rotate-45 origin-top-right select-none" style={{width: '170px', right: '-50px', top: '16px', position: 'absolute'}}>Desarrollado por Calendly</div>
          </div>
          
          {/* Columna izquierda */}
          <InfoReunion 
            anfitrion={anfitrion}
            duracion={duracion}
            evento={evento}
            descripcion={descripcion}
          />
          
          {/* Columna derecha: calendario y horarios */}
          <div className="w-1/2 p-10 flex flex-col">
            {!diaSeleccionado ? (
              <CalendarioSelector 
                onSelectDay={handleSelectDay} 
                onCambioZonaHoraria={handleCambioZonaHoraria}
              />
            ) : (
              <HorariosDisponibles 
                diaSeleccionado={diaSeleccionado}
                mes={mes}
                anio={anio}
                onSelectHora={handleSelectHora}
                onVolver={handleVolver}
                onSiguiente={handleSiguiente}
              />
            )}
          </div>
        </div>
      ) : (
        <FormularioDetalles
          anfitrion={anfitrion}
          evento={evento}
          duracion={duracion}
          fechaHora={obtenerFechaHoraFormateada()}
          ubicacion={zonaHoraria.nombre}
          onVolver={handleVolverAHorarios}
        />
      )}
    </div>
  );
};

export default AgendacionPage; 