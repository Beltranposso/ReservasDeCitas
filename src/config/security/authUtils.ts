// authUtils.ts - Utilidades para gestión de autenticación (integrado con AuthService)
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import apiClient, { API_ENDPOINTS, setAuthToken, type ApiResponse } from '../../services/apiclient';

// Constantes para nombres de cookies
const ACCESS_TOKEN = 'calendly_access_token';
const REFRESH_TOKEN = 'calendly_refresh_token';

// Interfaz para el token decodificado
interface DecodedToken {
  exp: number;
  user_id: string;
  role: string;
  // Otros campos que pueda tener tu token
}

// Interfaces para las funciones de autenticación
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      timezone: string;
      is_active: boolean;
    };
    token: string;
  };
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  timezone: string;
  is_active: boolean;
  settings?: {
    theme_color?: string;
    profile_image_url?: string;
    default_event_duration?: string;
  };
}

// Helper para sincronizar token con apiClient
const syncTokenWithApiClient = () => {
  const token = Cookies.get(ACCESS_TOKEN);
  setAuthToken(token);
};

// ============== FUNCIONES DE VERIFICACIÓN ============== 

// Verifica si el usuario está autenticado (versión sincrónica)
export const isAuthenticated = (): boolean => {
  const token = Cookies.get(ACCESS_TOKEN);
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Si el token no ha expirado, el usuario está autenticado
    if (decodedToken.exp > currentTime) {
      return true;
    }
    
    // Si el token ha expirado pero hay refresh token, consideramos
    // que aún hay una sesión válida que será refrescada
    const refreshToken = Cookies.get(REFRESH_TOKEN);
    return !!refreshToken;
    
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return false;
  }
};

// Verifica la autenticación y refresca el token si es necesario (versión asíncrona)
export const checkAndRefreshAuth = async (): Promise<boolean> => {
  const token = Cookies.get(ACCESS_TOKEN);
  
  // Si no hay token de acceso, no hay autenticación
  if (!token) return false;
  
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Si el token no ha expirado, todo está bien
    if (decodedToken.exp > currentTime) {
      return true;
    }
    
    // Si ha expirado, intentamos refrescarlo
    return await refreshTokenSilently();
  } catch (error) {
    console.error('Error al verificar o refrescar el token:', error);
    return false;
  }
};

// ============== FUNCIONES DE OBTENCIÓN DE DATOS ============== 

// Obtiene el rol del usuario desde el token
export const getUserRole = (): string | null => {
  const token = Cookies.get(ACCESS_TOKEN);
  if (!token) return null;
  
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    return decodedToken.role;
  } catch {
    return null;
  }
};

// Obtiene el ID del usuario desde el token
export const getUserId = (): string | null => {
  const token = Cookies.get(ACCESS_TOKEN);
  if (!token) return null;
  
  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    return decodedToken.user_id;
  } catch {
    return null;
  }
};

// Obtiene el token de acceso
export const getToken = (): string | null => {
  return Cookies.get(ACCESS_TOKEN);
};

// ============== FUNCIONES DE AUTENTICACIÓN ============== 

// Login de usuario
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.users.login, credentials);
    
    if (response.data.success && response.data.data.token) {
      // Guardar tokens (usando el token como accessToken y refreshToken si existe)
      const refreshToken = (response.data.data as any).refreshToken || '';
      setAuthTokens(response.data.data.token, refreshToken);
      
      // Sincronizar con apiClient
      syncTokenWithApiClient();
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al iniciar sesión');
  }
};

// Registro de usuario
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.users.register, userData);
    
    if (response.data.success && response.data.data.token) {
      // Guardar tokens
      const refreshToken = (response.data.data as any).refreshToken || '';
      setAuthTokens(response.data.data.token, refreshToken);
      
      // Sincronizar con apiClient
      syncTokenWithApiClient();
    }
    
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al registrar usuario');
  }
};

// Obtener perfil del usuario actual
export const getProfile = async (): Promise<UserProfile> => {
  try {
    syncTokenWithApiClient(); // Asegurar que el token esté sincronizado
    const response = await apiClient.get<{ success: boolean; data: UserProfile }>(API_ENDPOINTS.users.profile);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al obtener perfil');
  }
};

// Actualizar perfil
export const updateProfile = async (userData: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    syncTokenWithApiClient();
    const response = await apiClient.patch<{ success: boolean; data: UserProfile }>(
      API_ENDPOINTS.users.updateProfile, 
      userData
    );
    
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al actualizar perfil');
  }
};

// Cambiar contraseña
export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    syncTokenWithApiClient();
    await apiClient.patch(API_ENDPOINTS.users.updatePassword, {
      currentPassword,
      newPassword
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al actualizar contraseña');
  }
};

// Verificar disponibilidad de email
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
      `${API_ENDPOINTS.users.checkEmail}?email=${encodeURIComponent(email)}`
    );
    return response.data.data?.available || false;
  } catch (error: any) {
    return false;
  }
};

// Validar token
export const validateToken = async (): Promise<boolean> => {
  try {
    syncTokenWithApiClient();
    const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.users.validateToken);
    return response.data.success || false;
  } catch (error) {
    return false;
  }
};

// Verificar estado de autenticación
export const checkAuthStatus = async (): Promise<{ authenticated: boolean; user?: UserProfile }> => {
  try {
    syncTokenWithApiClient();
    const response = await apiClient.get<ApiResponse<{ authenticated: boolean; user?: UserProfile }>>(
      API_ENDPOINTS.users.authStatus
    );
    return response.data.data || { authenticated: false };
  } catch (error) {
    return { authenticated: false };
  }
};

// Recuperar contraseña - Nota: Este endpoint no está en tu API_ENDPOINTS, ajústalo según necesites
export const forgotPassword = async (email: string): Promise<void> => {
  try {
    // Usando un endpoint genérico ya que no está definido en tu API_ENDPOINTS
    await apiClient.post('/api/users/forgot-password', { email });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al enviar correo de recuperación');
  }
};

// Restablecer contraseña - Nota: Este endpoint no está en tu API_ENDPOINTS, ajústalo según necesites
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  try {
    // Usando un endpoint genérico ya que no está definido en tu API_ENDPOINTS
    await apiClient.post('/api/users/reset-password', { token, newPassword });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Error al restablecer contraseña');
  }
};

// Buscar usuarios
export const searchUsers = async (query: string): Promise<UserProfile[]> => {
  try {
    syncTokenWithApiClient();
    const response = await apiClient.get<ApiResponse<UserProfile[]>>(
      `${API_ENDPOINTS.users.search}?q=${encodeURIComponent(query)}`
    );
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error buscando usuarios:', error);
    return [];
  }
};

// Obtener perfil público de usuario
export const getPublicProfile = async (userId: number): Promise<UserProfile | null> => {
  try {
    const response = await apiClient.get<ApiResponse<UserProfile>>(
      API_ENDPOINTS.users.publicProfile(userId)
    );
    return response.data.data || null;
  } catch (error) {
    return null;
  }
};

// ============== FUNCIONES DE GESTIÓN DE TOKENS ============== 

// Almacena los tokens en cookies seguras
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  // Configuración para cookies seguras
  const secureOptions = {
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: 'strict' as const, // Previene CSRF
    expires: 30, // 30 días para refresh token
    path: '/' 
  };
  
  // Configuración para el token de acceso (corta duración)
  const accessOptions = {
    ...secureOptions,
    expires: 1/24, // 1 hora
  };
  
  Cookies.set(ACCESS_TOKEN, accessToken, accessOptions);
  Cookies.set(REFRESH_TOKEN, refreshToken, secureOptions);
  
  // Sincronizar con apiClient
  setAuthToken(accessToken);
};

// Refresca el token de forma silenciosa
export const refreshTokenSilently = async (): Promise<boolean> => {
  const refreshToken = Cookies.get(REFRESH_TOKEN);
  if (!refreshToken) return false;
  
  try {
    // Usando el endpoint de refreshToken de tu API
    const response = await apiClient.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>(
      API_ENDPOINTS.users.refreshToken, 
      { refreshToken }
    );
    
    if (response.data.success) {
      setAuthTokens(response.data.data.accessToken, response.data.data.refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    // Si hay error, limpia las cookies
    logout();
    return false;
  }
};

// ============== FUNCIÓN DE LOGOUT ============== 

// Cierra la sesión eliminando las cookies
export const logout = () => {
  Cookies.remove(ACCESS_TOKEN, { path: '/' });
  Cookies.remove(REFRESH_TOKEN, { path: '/' });
  
  // Limpiar token del apiClient
  setAuthToken(null);
  
  // Redirigir a la página de inicio de sesión
  window.location.href = '/login';
};