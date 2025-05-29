// src/features/dashboard/integrations/integrationsService.ts
import apiClient, { API_ENDPOINTS, type ApiResponse } from '../../../services/apiclient';

export interface Integration {
  id: number;
  user_id: number;
  provider: string;
  provider_email?: string;
  provider_name?: string;
  created_at: string;
  updated_at: string;
  token_expiry?: string;
  is_active?: boolean;
  profile_info?: any;
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  selected?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole: string;
}

export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  hangoutLink?: string;
  htmlLink: string;
}

export interface AvailabilityCheck {
  available: boolean;
  busyPeriods?: Array<{
    start: string;
    end: string;
  }>;
}

class IntegrationsService {
  // Obtener estado de integraciones
  async getIntegrationsStatus(): Promise<Integration[]> {
    try {
      const response = await apiClient.get<ApiResponse<Integration[]>>(
        API_ENDPOINTS.integrations.google.getIntegrations
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error obteniendo integraciones:', error);
      return [];
    }
  }

  // GOOGLE CALENDAR INTEGRATION

  // Iniciar proceso de autorización con Google
  async startGoogleAuth(): Promise<{ auth_url: string; state: string }> {
    try {
      const response = await apiClient.get<ApiResponse<{ auth_url: string; state: string }>>(
        API_ENDPOINTS.integrations.google.authStart
      );
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar autorización con Google');
    }
  }

  // Manejar callback de Google (llamado desde el componente después de redirigir)
  async handleGoogleCallback(code: string, state: string): Promise<Integration> {
    try {
      const response = await apiClient.get<ApiResponse<{ integration: Integration }>>(
        `${API_ENDPOINTS.integrations.google.authCallback}?code=${code}&state=${state}`
      );
      
      return response.data.data.integration;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al procesar autorización de Google');
    }
  }

  // Obtener calendarios de Google
  async getGoogleCalendars(): Promise<GoogleCalendar[]> {
    try {
      const response = await apiClient.get<ApiResponse<GoogleCalendar[]>>(
        '/api/integrations/google/calendars'
      );
      
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener calendarios de Google');
    }
  }

  // Verificar disponibilidad en Google Calendar
  async checkGoogleAvailability(
    startTime: string, 
    endTime: string,
    calendars?: string[]
  ): Promise<AvailabilityCheck> {
    try {
      const response = await apiClient.post<ApiResponse<AvailabilityCheck>>(
        '/api/integrations/google/check-availability', 
        {
          start_time: startTime,
          end_time: endTime,
          calendars
        }
      );
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error verificando disponibilidad:', error);
      // En caso de error, asumir disponible
      return { available: true };
    }
  }

  // Crear evento en Google Calendar
  async createGoogleEvent(eventData: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    timeZone?: string;
    attendees?: string[];
    meetingLink?: boolean;
  }): Promise<GoogleEvent> {
    try {
      const response = await apiClient.post<ApiResponse<GoogleEvent>>(
        '/api/integrations/google/events', 
        eventData
      );
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear evento en Google Calendar');
    }
  }

  // Desconectar Google Calendar
  async disconnectGoogle(integrationId?: number): Promise<void> {
    try {
      if (integrationId) {
        await apiClient.delete(API_ENDPOINTS.integrations.google.disconnect(integrationId));
      } else {
        // Si no se proporciona ID, usar endpoint genérico
        await apiClient.delete('/api/integrations/google/disconnect');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al desconectar Google Calendar');
    }
  }

  // Test de integración
  async testGoogleIntegration(): Promise<{ 
    status: 'healthy' | 'unhealthy'; 
    calendars_count?: number;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<{ 
        status: 'healthy' | 'unhealthy';
        calendars_count?: number;
        error?: string;
      }>>(API_ENDPOINTS.integrations.google.healthCheck);
      
      return response.data.data;
    } catch (error: any) {
      return { 
        status: 'unhealthy', 
        error: error.response?.data?.message || 'Error al probar integración' 
      };
    }
  }

  // ZOOM INTEGRATION (placeholder para futuro)

  async startZoomAuth(): Promise<{ auth_url: string }> {
    // Implementar cuando se agregue Zoom
    throw new Error('Integración con Zoom no disponible aún');
  }

  // MICROSOFT TEAMS/OUTLOOK (placeholder para futuro)

  async startOutlookAuth(): Promise<{ auth_url: string }> {
    // Implementar cuando se agregue Outlook
    throw new Error('Integración con Outlook no disponible aún');
  }

  // FUNCIONES HELPER

  // Verificar si una integración está activa
  isIntegrationActive(integrations: Integration[], provider: string): boolean {
    const integration = integrations.find(i => i.provider === provider);
    return !!integration && !!integration.is_active;
  }

  // Obtener información de una integración específica
  getIntegrationInfo(integrations: Integration[], provider: string): Integration | null {
    return integrations.find(i => i.provider === provider) || null;
  }

  // Formatear fecha de expiración de token
  formatTokenExpiry(expiry?: string): string {
    if (!expiry) return 'Sin información';
    
    const expiryDate = new Date(expiry);
    const now = new Date();
    
    if (expiryDate < now) {
      return 'Expirado';
    }
    
    const diffInHours = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `Expira en ${diffInHours} horas`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Expira en ${diffInDays} días`;
  }

  // GOOGLE MEET INTEGRATION

  // Crear reunión de Google Meet
  async createGoogleMeeting(meetingData: {
    title: string;
    startTime: string;
    endTime: string;
    attendees?: string[];
    description?: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post<ApiResponse<any>>(
        API_ENDPOINTS.integrations.google.createMeeting,
        meetingData
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear reunión de Google Meet');
    }
  }

  // Obtener información de integración de Google
  async getGoogleIntegrationInfo(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.integrations.google.getInfo
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error obteniendo información de integración:', error);
      return null;
    }
  }

  // Obtener estado de Google Meet
  async getGoogleMeetStatus(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        API_ENDPOINTS.integrations.google.getStatus
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error obteniendo estado de Google Meet:', error);
      return null;
    }
  }
}

export default new IntegrationsService();