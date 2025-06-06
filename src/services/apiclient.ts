// src/services/apiclient.ts
import axios, { type AxiosInstance, AxiosError, type AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Constantes para nombres de cookies (deben coincidir con authUtils.ts)
const ACCESS_TOKEN = 'calendly_access_token';
const REFRESH_TOKEN = 'calendly_refresh_token';

// Configuración base
const API_BASE_URL =  'http://localhost:3000';

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
    const token = Cookies.get(ACCESS_TOKEN);
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
      Cookies.remove(ACCESS_TOKEN, { path: '/' });
      Cookies.remove(REFRESH_TOKEN, { path: '/' });
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

// 📌 ENDPOINTS DE LA API
export const API_ENDPOINTS = {
  // 🏠 Rutas Base
  root: '/',
  health: '/health',
  apiInfo: '/api',
  
  // 📌 USUARIOS (/api/users)
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
  
  // 📅 EVENTOS (/api/events)
  events: {
    create: '/api/events/',
    getAll: '/api/events/',
    getMyEvents: '/api/events/my-events',
    getById: (id: number) => `/api/events/${id}`,
    getDetails: (id: number) => `/api/events/${id}/details`,
    getDependencies: (id: number) => `/api/events/${id}/dependencies`,
    update: (id: number) => `/api/events/${id}`,
    delete: (id: number) => `/api/events/${id}`,
    addQuestion: (id: number) => `/api/events/${id}/questions`,
  },
  
  // 📋 RESERVAS (/api/bookings)
  bookings: {
    create: '/api/bookings/',
    getAll: '/api/bookings/',
    getUserBookings: '/api/bookings/user',
    getByEventType: (eventTypeId: number) => `/api/bookings/event/${eventTypeId}`,
    getById: (id: number) => `/api/bookings/${id}`,
    updateStatus: (id: number) => `/api/bookings/${id}/status`,
  },
  
  // 🕐 DISPONIBILIDAD (/api/availability)
  availability: {
    set: '/api/availability/',
    get: '/api/availability/',
    update: (id: number) => `/api/availability/${id}`,
    delete: (id: number) => `/api/availability/${id}`,
  },
  
  // 🔗 INTEGRACIONES GOOGLE (/api/integrations/google)
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

// 🏥 Verificar salud del servidor
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get<{ status: string }>(API_ENDPOINTS.health);
    return response.status === 200 && response.data.success !== false;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

// 📝 Obtener información de la API
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