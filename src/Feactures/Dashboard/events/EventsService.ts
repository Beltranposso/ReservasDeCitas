// src/features/dashboard/events/EventsService.ts
import apiClient, { API_ENDPOINTS, type ApiResponse } from '../../../services/apiclient';

export interface EventType {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  location_type: string;
  custom_url: string;
  requires_confirmation: boolean;
  min_booking_notice?: number;
  buffer_time?: number;
  daily_limit?: number;
  notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventData {
  name: string;
  description?: string;
  duration_minutes: number;
  location_type: string;
  custom_url: string;
  requires_confirmation?: boolean;
  min_booking_notice?: number;
  buffer_time?: number;
  daily_limit?: number;
  notifications_enabled?: boolean;
}

export interface EventQuestion {
  id?: number;
  event_type_id?: number;
  question: string;
  is_required: boolean;
  question_order: number;
}

export interface EventDependencies {
  questions: number;
  bookings: number;
  reminders: number;
}

class EventsService {
  // Crear nuevo tipo de evento
  validateCustomUrl(custom_url: string) {
    throw new Error("Method not implemented.");
  }
  // Obtener todos los tipos de eventos del usuario
  async getEventTypes(): Promise<EventType[]> {
    try {
      const response = await apiClient.get<ApiResponse<EventType[]>>(API_ENDPOINTS.events.getAll);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error obteniendo eventos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener tipos de eventos');
    }
  }

  // Obtener un tipo de evento específico
  async getEventType(eventId: number): Promise<EventType> {
    try {
      const response = await apiClient.get<ApiResponse<EventType>>(API_ENDPOINTS.events.getById(eventId));
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener tipo de evento');
    }
  }

  // Crear nuevo tipo de evento
  async createEventType(eventData: CreateEventData): Promise<EventType> {
    try {
      const response = await apiClient.post<ApiResponse<EventType>>(API_ENDPOINTS.events.create, eventData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear tipo de evento');
    }
  }

  // Actualizar tipo de evento
  async updateEventType(eventId: number, eventData: Partial<CreateEventData>): Promise<EventType> {
    try {
      const response = await apiClient.patch<ApiResponse<EventType>>(
        API_ENDPOINTS.events.update(eventId), 
        eventData
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar tipo de evento');
    }
  }

  // Eliminar tipo de evento
  async deleteEventType(eventId: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.events.delete(eventId));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar tipo de evento');
    }
  }

  // Obtener dependencias de un evento
  async getEventDependencies(eventId: number): Promise<EventDependencies> {
    try {
      const response = await apiClient.get<ApiResponse<EventDependencies>>(
        API_ENDPOINTS.events.getDependencies(eventId)
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error obteniendo dependencias:', error);
      // Si falla, retornar valores por defecto
      return { questions: 0, bookings: 0, reminders: 0 };
    }
  }

  // Obtener preguntas de un tipo de evento
  async getEventQuestions(eventId: number): Promise<EventQuestion[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: EventQuestion[] }>(
        `/api/events/${eventId}/questions`
      );
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener preguntas del evento');
    }
  }

  // Crear pregunta para evento
  async createEventQuestion(eventId: number, question: EventQuestion): Promise<EventQuestion> {
    try {
      const response = await apiClient.post<{ success: boolean; data: EventQuestion }>(
        `/api/events/${eventId}/questions`, 
        question
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear pregunta');
    }
  }

  // Actualizar pregunta
  async updateEventQuestion(eventId: number, questionId: number, question: Partial<EventQuestion>): Promise<EventQuestion> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: EventQuestion }>(
        `/api/events/${eventId}/questions/${questionId}`, 
        question
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar pregunta');
    }
  }

  // Eliminar pregunta
  async deleteEventQuestion(eventId: number, questionId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/events/${eventId}/questions/${questionId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar pregunta');
    }
  }

  // Validar disponibilidad de URL personalizada
  // async validateCustomUrl(url: string): Promise<boolean> {
  //   try {
  //     const response = await apiClient.post<{ success: boolean; data: { available: boolean } }>(
  //       '/api/events/validate-url', 
  //       { url }
  //     );
  //     return response.data.data.available;
  //   } catch (error: any) {
  //     return false;
  //   }
  // }

  // Generar URL sugerida basada en el nombre
  generateSuggestedUrl(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  }

  // Duplicar tipo de evento
  async duplicateEventType(eventId: number, newName: string): Promise<EventType> {
    try {
      const response = await apiClient.post<{ success: boolean; data: EventType }>(
        `/api/events/${eventId}/duplicate`, 
        { name: newName }
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al duplicar tipo de evento');
    }
  }

  // Obtener estadísticas de un tipo de evento
  async getEventStats(eventId: number): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/api/events/${eventId}/stats`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }

  // Obtener mis eventos
  async getMyEventTypes(): Promise<EventType[]> {
    try {
      const response = await apiClient.get<ApiResponse<EventType[]>>(API_ENDPOINTS.events.getMyEvents);
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error obteniendo mis eventos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener mis tipos de eventos');
    }
  }

  // Obtener detalles completos de un evento
  async getEventDetails(eventId: number): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(API_ENDPOINTS.events.getDetails(eventId));
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener detalles del evento');
    }
  }
}

export default new EventsService();