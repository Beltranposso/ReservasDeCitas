// src/services/apiclient.ts
import axios, { type AxiosInstance, AxiosError, type AxiosResponse } from 'axios';

// Configuración base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función para establecer el token de autorización
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// ENDPOINTS DE LA API
export const API_ENDPOINTS = {
  // Rutas Base
  root: '/',
  health: '/health',
  apiInfo: '/api',
  
  // USUARIOS (/api/users)
  users: {
    // Rutas Públicas
    register: '/api/users/register',
    login: '/api/users/login',
    checkEmail: '/api/users/check-email',
    publicProfile: (id: number) => `/api/users/public/${id}`,
    validateToken: '/api/users/validate-token',
    
    // Rutas Autenticadas
    logout: '/api/users/logout',
    refreshToken: '/api/users/refresh-token',
    authStatus: '/api/users/auth-status',
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    updatePassword: '/api/users/password',
    updateSettings: '/api/users/settings',
    deleteAccount: '/api/users/account',
    search: '/api/users/search',
    getById: (id: number) => `/api/users/${id}`,
    
    // Rutas Admin
    getAll: '/api/users/',
    stats: '/api/users/stats/overview',
    updateUserById: (id: number) => `/api/users/${id}/profile`,
    toggleUserStatus: (id: number) => `/api/users/${id}/toggle-status`,
    
    // Rutas Owner/Admin
    teamMembers: '/api/users/team/members',
  },
  
  // EVENTOS (/api/event-types - corregido para coincidir con tu backend)
  events: {
    create: '/api/event-types/',
    getAll: '/api/event-types/',
    getMyEvents: '/api/event-types/my-events',
    stats: '/api/event-types/stats',
    checkCustomUrl: (url: string) => `/api/event-types/check-url/${url}`,
    getByUser: (userId: number) => `/api/event-types/user/${userId}`,
    getById: (id: number) => `/api/event-types/${id}`,
    getDetails: (id: number) => `/api/event-types/${id}/details`,
    getDependencies: (id: number) => `/api/event-types/${id}/dependencies`,
    update: (id: number) => `/api/event-types/${id}`,
    delete: (id: number) => `/api/event-types/${id}`,
    duplicate: (id: number) => `/api/event-types/${id}/duplicate`,
    
    // Gestión de preguntas
    getQuestions: (id: number) => `/api/event-types/${id}/questions`,
    addQuestion: (id: number) => `/api/event-types/${id}/questions`,
    updateQuestion: (id: number, questionId: number) => `/api/event-types/${id}/questions/${questionId}`,
    deleteQuestion: (id: number, questionId: number) => `/api/event-types/${id}/questions/${questionId}`,
    reorderQuestions: (id: number) => `/api/event-types/${id}/questions/reorder`,
    
    // EMBED - Nuevas rutas para embeds
    embed: (eventId: number) => `/api/event-types/embed/${eventId}`,
    
    // Para generar URLs de embed con parámetros
    getEmbedUrl: (eventId: number, options: {
      theme?: 'light' | 'dark' | 'auto';
      brandColor?: string;
      hideDetails?: boolean;
      primaryColor?: string;
    } = {}) => {
      const params = new URLSearchParams();
      if (options.theme) params.set('theme', options.theme);
      if (options.brandColor) params.set('brandColor', options.brandColor);
      if (options.hideDetails) params.set('hideEventTypeDetails', 'true');
      if (options.primaryColor) params.set('primaryColor', options.primaryColor);
      
      const baseUrl = `${API_BASE_URL}/api/event-types/embed/${eventId}`;
      const queryString = params.toString();
      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    }
  },
  
  // CONTACTOS (/api/contacts)
  contacts: {
    create: '/api/contacts/',
    getAll: '/api/contacts/',
    embed: '/api/bookings/embed',
    search: '/api/contacts/search',
    getById: (id: number) => `/api/contacts/${id}`,
    update: (id: number) => `/api/contacts/${id}`,
    delete: (id: number) => `/api/contacts/${id}`,
    getByEmail: (email: string) => `/api/contacts/email/${email}`,
    
    // Asociaciones con tipos de eventos
    getEventTypes: (contactId: number) => `/api/contacts/${contactId}/event-types`,
    associateWithEventType: (contactId: number) => `/api/contacts/${contactId}/event-types`,
    dissociateFromEventType: (contactId: number, eventTypeId: number) => `/api/contacts/${contactId}/event-types/${eventTypeId}`,
    
    // Estadísticas del contacto
    getStats: (contactId: number) => `/api/contacts/${contactId}/stats`,
  },
  
  // RESERVAS (/api/bookings)
  bookings: {
    create: '/api/bookings/',
    getAll: '/api/bookings/',
    getUserBookings: '/api/bookings/user',
    getByEventType: (eventTypeId: number) => `/api/bookings/event/${eventTypeId}`,
    getById: (id: number) => `/api/bookings/${id}`,
    updateStatus: (id: number) => `/api/bookings/${id}/status`,
  },
  
  // DISPONIBILIDAD (/api/availability)
  availability: {
    set: '/api/availability/',
    get: '/api/availability/',
    update: (id: number) => `/api/availability/${id}`,
    delete: (id: number) => `/api/availability/${id}`,
  },
  
  // INTEGRACIONES GOOGLE (/api/integrations/google)
  integrations: {
    google: {
      // Autenticación OAuth
      authStart: '/api/integrations/google/auth/start',
      authCallback: '/api/integrations/google/auth/callback',
      callbackAlt: '/api/integrations/google/callback',
      
      // Gestión de Google Meet
      createMeeting: '/api/integrations/google/meetings',
      
      // Información y Gestión
      getInfo: '/api/integrations/google/info',
      getStatus: '/api/integrations/google/status',
      getIntegrations: '/api/integrations/google/integrations',
      disconnect: (integrationId: number) => `/api/integrations/google/disconnect/${integrationId}`,
      healthCheck: '/api/integrations/google/health',
    },
  },
};

// Tipos de respuesta estándar
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

// Funciones helper para peticiones comunes
export const api = {
  // GET request
  get: async <T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get<ApiResponse<T>>(url, config);
  },
  
  // POST request
  post: async <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post<ApiResponse<T>>(url, data, config);
  },
  
  // PUT request
  put: async <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put<ApiResponse<T>>(url, data, config);
  },
  
  // PATCH request
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch<ApiResponse<T>>(url, data, config);
  },
  
  // DELETE request
  delete: async <T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete<ApiResponse<T>>(url, config);
  },
};

// FUNCIONES HELPER PARA EMBEDS
export const embedHelpers = {
  // Generar URL del embed
  getEmbedUrl: (eventId: number, options = {}) => {
    return API_ENDPOINTS.events.getEmbedUrl(eventId, options);
  },
  
  // Generar código de iframe
  generateIframeCode: (eventId: number, options: {
    theme?: 'light' | 'dark' | 'auto';
    brandColor?: string;
    hideDetails?: boolean;
    height?: number;
    width?: string;
  } = {}) => {
    const src = API_ENDPOINTS.events.getEmbedUrl(eventId, options);
    const height = options.height || 600;
    const width = options.width || '100%';
    
    return `<iframe
  src="${src}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border:0;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.1);"
  allowtransparency="true"
  title="Reservar cita">
</iframe>`;
  },
  
  // Generar código React
  generateReactCode: (eventId: number, options: {
    theme?: 'light' | 'dark' | 'auto';
    brandColor?: string;
    hideDetails?: boolean;
    height?: number;
  } = {}) => {
    const src = API_ENDPOINTS.events.getEmbedUrl(eventId, options);
    const height = options.height || 600;
    
    return `import React from "react";

export default function BookingEmbed() {
  return (
    <iframe
      src="${src}"
      width="100%"
      height="${height}"
      style={{ 
        border: 0, 
        borderRadius: 12, 
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)" 
      }}
      frameBorder={0}
      title="Reserva tu cita"
      allowTransparency
    />
  );
}`;
  },
  
  // Generar enlace directo
  getBookingUrl: (eventId: number) => {
    return `${window.location.origin}/book/${eventId}`;
  }
};

// Verificar salud del servidor
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get<{ status: string }>(API_ENDPOINTS.health);
    return response.status === 200 && response.data.success !== false;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

// Obtener información de la API
export const getApiInfo = async (): Promise<any> => {
  try {
    const response = await api.get(API_ENDPOINTS.apiInfo);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get API info:', error);
    return null;
  }
};

export default apiClient;