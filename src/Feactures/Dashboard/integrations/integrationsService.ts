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
      console.log('📡 Llamando a getIntegrationsStatus...');
      const response = await fetch(`${this.baseUrl}/integrations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('authToken') && {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          })
        }
      });
      console.log('📥 Respuesta HTTP:', response.status);
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);

      if (!response.ok) {
        console.warn('⚠️ Error HTTP:', response.status, data.message);
        return [];
      }

      if (!data.success) {
        console.warn('⚠️ La API no devolvió éxito:', data.message);
        return [];
      }

      if (!Array.isArray(data.data)) {
        console.warn('⚠️ data.data no es un array:', data.data);
        return [];
      }

      return data.data;
    } catch (error: any) {
      console.error('❌ Error crítico al obtener integraciones:', error);
      throw new Error('Error cargando estado de integraciones');
    }
  }

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

  // Manejar callback de Google
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

  // Verificar si una integración está activa
  isIntegrationActive(integrations: Integration[], provider: string): boolean {
    const integration = integrations.find(i => i.provider === provider);
    return !!integration && !!integration.is_active;
  }

  // Obtener información de una integración específica
  getIntegrationInfo(integrations: Integration[], provider: string): Integration | null {
    return integrations.find(i => i.provider === provider) || null;
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
}

// Exportamos una única instancia del servicio
const integrationsService = new IntegrationsService();
export default integrationsService;

// Exportamos tipos por conveniencia
export type {
  Integration,
  GoogleCalendar,
  GoogleEvent,
  AvailabilityCheck
};