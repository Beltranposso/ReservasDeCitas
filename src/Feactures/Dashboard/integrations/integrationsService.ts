// src/features/dashboard/integrations/integrationsService.ts
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
  private readonly baseUrl = 'http://localhost:3000/api/integrations/google';

  // Obtener estado de integraciones
  async getIntegrationsStatus(): Promise<Integration[]> {
    try {
      const response = await fetch(`${this.baseUrl}/integrations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const data = await response.json();
      console.log('📊 Estado de integraciones:', data);

      if (response.ok && data.success) {
        return data.data || [];
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor:', data);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo integraciones:', error);
      return [];
    }
  }

  // GOOGLE CALENDAR/MEET INTEGRATION

  // Iniciar proceso de autorización con Google
  async startGoogleAuth(): Promise<{ auth_url: string; state: string }> {
    try {
      console.log('🚀 Iniciando autorización con Google...');
      
      const response = await fetch(`${this.baseUrl}/auth/start`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const data = await response.json();
      console.log('📡 Respuesta de auth/start:', data);

      if (!response.ok) {
        throw new Error(data.message || `Error HTTP ${response.status}`);
      }

      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error iniciando autorización:', error);
      throw new Error(error.message || 'Error al iniciar autorización con Google');
    }
  }

  // Manejar callback de Google (llamado desde el componente después de redirigir)
  async handleGoogleCallback(code: string, state: string): Promise<Integration> {
    try {
      console.log('🔄 Procesando callback de Google...', { code: !!code, state: !!state });
      
      const response = await fetch(`${this.baseUrl}/auth/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const data = await response.json();
      console.log('📡 Respuesta del callback:', data);

      if (!response.ok) {
        throw new Error(data.message || `Error HTTP ${response.status}`);
      }

      if (data.success && data.data && data.data.integration) {
        return data.data.integration;
      } else {
        throw new Error(data.message || 'Error procesando autorización');
      }
    } catch (error: any) {
      console.error('❌ Error en callback:', error);
      throw new Error(error.message || 'Error al procesar autorización de Google');
    }
  }

  // Obtener calendarios de Google
  async getGoogleCalendars(): Promise<GoogleCalendar[]> {
    try {
      const response = await fetch(`${this.baseUrl}/calendars`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener calendarios');
      }
      
      return data.data || [];
    } catch (error: any) {
      console.error('❌ Error obteniendo calendarios:', error);
      throw new Error(error.message || 'Error al obtener calendarios de Google');
    }
  }

  // Verificar disponibilidad en Google Calendar
  async checkGoogleAvailability(
    startTime: string, 
    endTime: string,
    calendars?: string[]
  ): Promise<AvailabilityCheck> {
    try {
      const response = await fetch(`${this.baseUrl}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify({
          start_time: startTime,
          end_time: endTime,
          calendars
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.warn('⚠️ Error verificando disponibilidad:', data);
        // En caso de error, asumir disponible
        return { available: true };
      }
    } catch (error: any) {
      console.error('❌ Error verificando disponibilidad:', error);
      // En caso de error, asumir disponible
      return { available: true };
    }
  }

  // Crear evento en Google Calendar con Google Meet
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
      console.log('📅 Creando evento en Google Calendar:', eventData);
      
      const response = await fetch(`${this.baseUrl}/create-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear evento');
      }
      
      return data.data;
    } catch (error: any) {
      console.error('❌ Error creando evento:', error);
      throw new Error(error.message || 'Error al crear evento en Google Calendar');
    }
  }

  // Crear reunión de Google Meet (wrapper para createGoogleEvent)
  async createGoogleMeeting(meetingData: {
    title: string;
    startTime: string;
    endTime: string;
    attendees?: string[];
    description?: string;
  }): Promise<any> {
    try {
      console.log('📹 Creando reunión de Google Meet:', meetingData);
      
      // Crear evento con Google Meet habilitado
      const eventData = {
        title: meetingData.title,
        description: meetingData.description,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        attendees: meetingData.attendees,
        meetingLink: true // Habilitar Google Meet
      };

      return await this.createGoogleEvent(eventData);
    } catch (error: any) {
      console.error('❌ Error creando reunión de Google Meet:', error);
      throw new Error(error.message || 'Error al crear reunión de Google Meet');
    }
  }

  // Desconectar Google Calendar/Meet
  async disconnectGoogle(integrationId?: number): Promise<void> {
    try {
      console.log('🔌 Desconectando Google...', { integrationId });
      
      const response = await fetch(`${this.baseUrl}/disconnect`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        },
        body: integrationId ? JSON.stringify({ integration_id: integrationId }) : undefined
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al desconectar');
      }
      
      console.log('✅ Google desconectado exitosamente');
    } catch (error: any) {
      console.error('❌ Error desconectando Google:', error);
      throw new Error(error.message || 'Error al desconectar Google Calendar');
    }
  }

  // Test de integración
  async testGoogleIntegration(): Promise<{ 
    status: 'healthy' | 'unhealthy'; 
    calendars_count?: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        return { 
          status: 'unhealthy', 
          error: data.message || 'Error al probar integración' 
        };
      }
    } catch (error: any) {
      console.error('❌ Error probando integración:', error);
      return { 
        status: 'unhealthy', 
        error: error.message || 'Error al probar integración' 
      };
    }
  }

  // Obtener información de integración de Google
  async getGoogleIntegrationInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.warn('⚠️ No se pudo obtener info de integración:', data);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo información de integración:', error);
      return null;
    }
  }

  // Obtener estado de Google Meet
  async getGoogleMeetStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return data.data;
      } else {
        console.warn('⚠️ No se pudo obtener estado de Google Meet:', data);
        return null;
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo estado de Google Meet:', error);
      return null;
    }
  }

  // ZOOM INTEGRATION (placeholder para futuro)
  async startZoomAuth(): Promise<{ auth_url: string }> {
    throw new Error('Integración con Zoom no disponible aún');
  }

  // MICROSOFT TEAMS/OUTLOOK (placeholder para futuro)
  async startOutlookAuth(): Promise<{ auth_url: string }> {
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
}

export default new IntegrationsService();