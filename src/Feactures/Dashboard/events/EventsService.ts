// src/features/dashboard/events/EventsService.ts
// VERSIÓN COMPLETA CON MANEJO DE PREGUNTAS


export interface EventType {
  id?: number;
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
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventQuestion {
  id?: number;
  event_type_id: number;
  question: string;
  is_required: boolean;
  question_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventTypeData {
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

export interface CreateEventQuestionData {
  question: string;
  is_required: boolean;
  question_order?: number;
}

export interface EventDependencies {
  questions: number;
  bookings: number;
  reminders: number;
  total_dependencies: number;
}

export interface EventStats {
  total: number;
  active: number;
  inactive: number;
  thisMonth: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class EventsService {
  private readonly API_BASE_URL = 'https://vsw8xr61-3000.use2.devtunnels.ms'; // Cambia esto a tu URL base real
  private readonly baseUrl = '/api/events';
  

  // ========== MÉTODOS DE GOOGLE ==========

  // Definición de la interfaz para los eventos de Google


  async createGoogleMeeting(eventData: {
    title: string;
    description?: string;
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    timeZone?: string;
    attendees?: string[];
  }): Promise<GoogleEvent> {
    try {
      console.log('📹 Preparando evento con Google Meet:', eventData);

      const response = await fetch(`${this.API_BASE_URL}/api/integrations/google/meetings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear evento');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      console.error('❌ Error al crear evento con Google Meet:', error);
      throw new Error(error.message || 'No se pudo crear el evento con Google Meet');
    }
  }
  
  // Método auxiliar para obtener headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Método auxiliar para manejar respuestas HTTP
  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    console.log(`📡 HTTP ${response.status}:`, {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      data
    });

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!data.success) {
      throw new Error(data.message || 'La operación no fue exitosa');
    }

    return data.data;
  }

  // ========== MÉTODOS DE EVENTOS ==========

  // Crear un nuevo tipo de evento
  async createEventType(eventData: CreateEventTypeData): Promise<EventType> {
    try {
      console.log('🚀 EventsService: Creando nuevo evento');
      console.log('📝 Datos del evento:', eventData);

      // Validaciones básicas del cliente
      if (!eventData.name?.trim()) {
        throw new Error('El nombre del evento es requerido');
      }

      if (!eventData.duration_minutes || eventData.duration_minutes < 5) {
        throw new Error('La duración debe ser de al menos 5 minutos');
      }

      if (!eventData.custom_url?.trim()) {
        throw new Error('La URL personalizada es requerida');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData)
      });

      const result = await this.handleResponse<EventType>(response);
      
      console.log('✅ EventsService: Evento creado exitosamente:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error creando evento:', error);
      
      // Mejorar mensajes de error
      if (error.message.includes('custom_url')) {
        throw new Error('La URL personalizada ya está en uso. Prueba con otra.');
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      
      throw new Error(error.message || 'Error inesperado al crear el evento');
    }
  }

  // Obtener mis eventos (del usuario autenticado)
  async getMyEvents(): Promise<EventType[]> {
    try {
      console.log('🔍 EventsService: Obteniendo mis eventos');
      
      const response = await fetch(`${this.API_BASE_URL}/api/events/my-events`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<EventType[]>(response);
      
      console.log(`✅ EventsService: ${result.length} eventos propios obtenidos`);
      return Array.isArray(result) ? result : [];

    } catch (error: any) {
      console.error('❌ EventsService: Error obteniendo mis eventos:', error);
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Error de conexión al obtener tus eventos');
      }
      
      throw new Error(error.message || 'Error al obtener tus eventos');
    }
  }

  // Obtener detalles completos de un evento (incluyendo preguntas)
  async getEventDetails(id: number): Promise<EventType & { questions?: EventQuestion[] }> {
    try {
      console.log('🔍 EventsService: Obteniendo detalles completos del evento', id);
      
      if (!id || id <= 0) {
        throw new Error('ID de evento inválido');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${id}/details`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<EventType & { questions?: EventQuestion[] }>(response);
      
      console.log('✅ EventsService: Detalles completos obtenidos:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error obteniendo detalles del evento:', error);
      throw new Error(error.message || 'Error al obtener los detalles del evento');
    }
  }

  // Obtener todos los tipos de evento
  async getAllEventTypes(): Promise<EventType[]> {
    try {
      console.log('🔍 EventsService: Obteniendo lista de eventos');
      
      const response = await fetch(`${this.API_BASE_URL}/api/events`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      const result = await this.handleResponse<EventType[]>(response);
      
      console.log(`✅ EventsService: ${result.length} eventos obtenidos`);
      return Array.isArray(result) ? result : [];

    } catch (error: any) {
      console.error('❌ EventsService: Error obteniendo eventos:', error);
      
      // En caso de error, retornar array vacío para no romper la UI
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Error de conexión al obtener eventos');
      }
      
      throw new Error(error.message || 'Error al obtener la lista de eventos');
    }
  }

  // Obtener un tipo de evento por ID
  async getEventType(id: number): Promise<EventType> {
    try {
      console.log('🔍 EventsService: Obteniendo evento por ID:', id);
      
      if (!id || id <= 0) {
        throw new Error('ID de evento inválido');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<EventType>(response);
      
      console.log('✅ EventsService: Evento obtenido:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error obteniendo evento:', error);
      throw new Error(error.message || 'Error al obtener el evento');
    }
  }

  // Actualizar un tipo de evento
  async updateEventType(id: number, eventData: Partial<CreateEventTypeData>): Promise<EventType> {
    try {
      console.log('🔄 EventsService: Actualizando evento', id, eventData);
      
      if (!id || id <= 0) {
        throw new Error('ID de evento inválido');
      }

      // Validaciones básicas
      if (eventData.duration_minutes && eventData.duration_minutes < 5) {
        throw new Error('La duración debe ser de al menos 5 minutos');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData)
      });

      const result = await this.handleResponse<EventType>(response);
      
      console.log('✅ EventsService: Evento actualizado:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error actualizando evento:', error);
      
      if (error.message.includes('custom_url')) {
        throw new Error('La URL personalizada ya está en uso');
      }
      
      throw new Error(error.message || 'Error al actualizar el evento');
    }
  }

  // Eliminar un tipo de evento
  async deleteEventType(id: number): Promise<{ success: boolean; dependencies?: EventDependencies }> {
    try {
      console.log('🗑️ EventsService: Eliminando evento', id);
      
      if (!id || id <= 0) {
        throw new Error('ID de evento inválido');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      console.log('📡 Respuesta de eliminación:', {
        status: response.status,
        data
      });

      if (!response.ok) {
        const errorMessage = data.message || `Error HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.success) {
        console.log('✅ EventsService: Evento eliminado exitosamente');
        return {
          success: true,
          dependencies: data.dependencies
        };
      } else {
        throw new Error(data.message || 'Error al eliminar evento');
      }

    } catch (error: any) {
      console.error('❌ EventsService: Error eliminando evento:', error);
      
      if (error.message.includes('datos relacionados') || error.message.includes('constraint')) {
        throw new Error('No se puede eliminar: el evento tiene reservas o datos relacionados');
      }
      
      throw new Error(error.message || 'Error al eliminar el evento');
    }
  }

  // Verificar dependencias antes de eliminar
  async checkEventDependencies(id: number): Promise<EventDependencies> {
    try {
      console.log('🔍 EventsService: Verificando dependencias del evento', id);
      
      if (!id || id <= 0) {
        throw new Error('ID de evento inválido');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${id}/dependencies`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<EventDependencies>(response);
      
      console.log('✅ EventsService: Dependencias verificadas:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error verificando dependencias:', error);
      
      // Retornar valores por defecto en caso de error
      return { 
        questions: 0, 
        bookings: 0, 
        reminders: 0,
        total_dependencies: 0
      };
    }
  }

  // ========== MÉTODOS DE PREGUNTAS ==========

  // ========== MÉTODOS CORRESPONDIENTES A RUTAS BACKEND ==========

  // GET /api/events/:id/questions - Obtener preguntas de un evento
  async getEventQuestions(eventId: number): Promise<EventQuestion[]> {
    try {
      console.log('❓ EventsService: Obteniendo preguntas del evento', eventId);
      
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${eventId}/questions`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<EventQuestion[]>(response);
      
      console.log(`✅ EventsService: ${result.length} preguntas obtenidas`);
      return Array.isArray(result) ? result : [];

    } catch (error: any) {
      console.error('❌ EventsService: Error obteniendo preguntas:', error);
      
      // En caso de error, retornar array vacío
      return [];
    }
  }

  // POST /api/events/:id/questions - Agregar pregunta a evento
  async addEventQuestion(eventId: number, questionData: CreateEventQuestionData): Promise<EventQuestion> {
    try {
      console.log('❓ EventsService: Agregando pregunta al evento', eventId, questionData);
      
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      if (!questionData.question?.trim()) {
        throw new Error('El texto de la pregunta es requerido');
      }

      // Si no se especifica orden, obtener el siguiente disponible
      if (!questionData.question_order) {
        const existingQuestions = await this.getEventQuestions(eventId);
        questionData.question_order = existingQuestions.length + 1;
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${eventId}/questions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(questionData)
      });

      const result = await this.handleResponse<EventQuestion>(response);
      
      console.log('✅ EventsService: Pregunta agregada:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error agregando pregunta:', error);
      throw new Error(error.message || 'Error al agregar la pregunta');
    }
  }

  // ========== MÉTODOS ADICIONALES PARA COMPLETAR LA API ==========

  // Métodos que podrías necesitar agregar al backend más adelante:

  // PATCH /api/events/:id/questions/:questionId - Actualizar pregunta específica
  async updateEventQuestion(eventId: number, questionId: number, questionData: Partial<CreateEventQuestionData>): Promise<EventQuestion> {
    try {
      console.log('❓ EventsService: Actualizando pregunta', questionId, questionData);
      
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      if (!questionId || questionId <= 0) {
        throw new Error('ID de pregunta inválido');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${eventId}/questions/${questionId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(questionData)
      });

      const result = await this.handleResponse<EventQuestion>(response);
      
      console.log('✅ EventsService: Pregunta actualizada:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error actualizando pregunta:', error);
      throw new Error(error.message || 'Error al actualizar la pregunta');
    }
  }

  // DELETE /api/events/:id/questions/:questionId - Eliminar pregunta específica
  async deleteEventQuestion(eventId: number, questionId: number): Promise<void> {
    try {
      console.log('❓ EventsService: Eliminando pregunta', questionId);
      
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      if (!questionId || questionId <= 0) {
        throw new Error('ID de pregunta inválido');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${eventId}/questions/${questionId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.message || `Error HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      console.log('✅ EventsService: Pregunta eliminada exitosamente');

    } catch (error: any) {
      console.error('❌ EventsService: Error eliminando pregunta:', error);
      throw new Error(error.message || 'Error al eliminar la pregunta');
    }
  }

  // PATCH /api/events/:id/questions/reorder - Reordenar preguntas
  async reorderEventQuestions(eventId: number, questionIds: number[]): Promise<EventQuestion[]> {
    try {
      console.log('❓ EventsService: Reordenando preguntas', eventId, questionIds);
      
      if (!eventId || eventId <= 0) {
        throw new Error('ID de evento inválido');
      }

      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        throw new Error('Lista de IDs de preguntas inválida');
      }

      const response = await fetch(`${this.API_BASE_URL}/api/events/${eventId}/questions/reorder`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ questionIds })
      });

      const result = await this.handleResponse<EventQuestion[]>(response);
      
      console.log('✅ EventsService: Preguntas reordenadas:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error reordenando preguntas:', error);
      throw new Error(error.message || 'Error al reordenar las preguntas');
    }
  }

  // Método auxiliar para guardar múltiples preguntas
  async saveEventQuestions(eventId: number, questions: EventQuestion[]): Promise<EventQuestion[]> {
    try {
      console.log('💾 EventsService: Guardando preguntas del evento', eventId, questions);
      
      const savedQuestions: EventQuestion[] = [];
      
      for (const question of questions) {
        if (question.id) {
          // Actualizar pregunta existente
          const updated = await this.updateEventQuestion(eventId, question.id, {
            question: question.question,
            is_required: question.is_required,
            question_order: question.question_order
          });
          savedQuestions.push(updated);
        } else {
          // Crear nueva pregunta
          const created = await this.addEventQuestion(eventId, {
            question: question.question,
            is_required: question.is_required,
            question_order: question.question_order
          });
          savedQuestions.push(created);
        }
      }
      
      console.log('✅ EventsService: Preguntas guardadas exitosamente');
      return savedQuestions;
      
    } catch (error: any) {
      console.error('❌ EventsService: Error guardando preguntas:', error);
      throw new Error(error.message || 'Error al guardar las preguntas');
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  // Generar URL sugerida a partir del nombre
  generateSuggestedUrl(name: string): string {
    if (!name?.trim()) {
      return '';
    }

    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s\-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Evitar múltiples guiones seguidos
      .replace(/^-|-$/g, '') // Remover guiones al inicio y final
      .substring(0, 50); // Limitar longitud
  }

  // Validar URL personalizada
  async validateCustomUrl(url: string, excludeId?: number): Promise<{ valid: boolean; message?: string }> {
    try {
      if (!url?.trim()) {
        return { valid: false, message: 'La URL no puede estar vacía' };
      }

      // Validaciones básicas
      if (url.length < 3) {
        return { valid: false, message: 'La URL debe tener al menos 3 caracteres' };
      }

      if (url.length > 50) {
        return { valid: false, message: 'La URL no puede exceder 50 caracteres' };
      }

      // URLs reservadas
      const reservedUrls = ['admin', 'api', 'www', 'test', 'root', 'system', 'app', 'book', 'calendar'];
      if (reservedUrls.includes(url.toLowerCase())) {
        return { valid: false, message: 'Esta URL está reservada' };
      }

      // Caracteres válidos
      if (!/^[a-z0-9\-]+$/.test(url)) {
        return { valid: false, message: 'Solo se permiten letras minúsculas, números y guiones' };
      }

      return { valid: true };

    } catch (error: any) {
      console.error('❌ Error validando URL:', error);
      return { valid: false, message: 'Error al validar la URL' };
    }
  }

  // Obtener estadísticas de eventos
  async getEventStats(): Promise<EventStats> {
    try {
      console.log('📊 EventsService: Obteniendo estadísticas');
      
      const response = await fetch(`${this.API_BASE_URL}/api/events/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const result = await this.handleResponse<EventStats>(response);
      
      console.log('✅ EventsService: Estadísticas obtenidas:', result);
      return result;

    } catch (error: any) {
      console.error('❌ EventsService: Error obteniendo estadísticas:', error);
      return { total: 0, active: 0, inactive: 0, thisMonth: 0 };
    }
  }

  // Duplicar un evento existente
  async duplicateEvent(id: number, newName?: string): Promise<EventType> {
    try {
      console.log('📋 EventsService: Duplicando evento', id);
      
      if (!id || id <= 0) {
        throw new Error('ID de evento inválido');
      }

      const originalEvent = await this.getEventType(id);
      
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const defaultNewName = `${originalEvent.name} (Copia ${timestamp})`;
      
      const duplicatedEventData: CreateEventTypeData = {
        name: newName?.trim() || defaultNewName,
        description: originalEvent.description,
        duration_minutes: originalEvent.duration_minutes,
        location_type: originalEvent.location_type,
        custom_url: this.generateSuggestedUrl(newName || `${originalEvent.custom_url}-copia-${Date.now()}`),
        requires_confirmation: originalEvent.requires_confirmation,
        min_booking_notice: originalEvent.min_booking_notice,
        buffer_time: originalEvent.buffer_time,
        daily_limit: originalEvent.daily_limit,
        notifications_enabled: originalEvent.notifications_enabled,
      };
      
      const duplicatedEvent = await this.createEventType(duplicatedEventData);
      
      // Duplicar preguntas si existen
      try {
        const originalQuestions = await this.getEventQuestions(id);
        for (const question of originalQuestions) {
          await this.addEventQuestion(duplicatedEvent.id!, {
            question: question.question,
            is_required: question.is_required,
            question_order: question.question_order
          });
        }
      } catch (questionsError) {
        console.warn('⚠️ No se pudieron duplicar las preguntas:', questionsError);
      }
      
      console.log('✅ EventsService: Evento duplicado exitosamente:', duplicatedEvent);
      return duplicatedEvent;

    } catch (error: any) {
      console.error('❌ EventsService: Error duplicando evento:', error);
      throw new Error(error.message || 'Error al duplicar el evento');
    }
  }

  // Método para refrescar la lista después de cambios
  async refreshEventsList(): Promise<EventType[]> {
    try {
      console.log('🔄 EventsService: Refrescando lista de eventos');
      
      // Pequeña pausa para asegurar que los cambios se hayan procesado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return await this.getAllEventTypes();
    } catch (error: any) {
      console.error('❌ EventsService: Error refrescando lista:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const eventsService = new EventsService();
export default eventsService;