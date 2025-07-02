
// Feactures/Agendacion/AgendacionPageWrapper.tsx
import { useParams } from "react-router-dom";
import AgendacionPage from "./AgendacionPage";

export default function AgendacionPageWrapper() {
  const { eventId } = useParams<{ eventId: string }>();
    console.log("Parámetros de la URL:", eventId);
  if (!eventId) {
    return <div>No se proporcionó un ID de evento válido</div>;
  }
  console.log("ID del evento:", eventId);
  return <AgendacionPage eventId={parseInt(eventId)} />;
}
