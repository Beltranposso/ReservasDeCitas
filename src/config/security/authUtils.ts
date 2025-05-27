// authUtils.ts - Utilidades para gestión de autenticación (corregido)
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

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
    
    // Nota: El refresh se hará en otro momento, no dentro de esta función
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
};

// Refresca el token de forma silenciosa
export const refreshTokenSilently = async (): Promise<boolean> => {
  const refreshToken = Cookies.get(REFRESH_TOKEN);
  if (!refreshToken) return false;
  
  try {
    // Llama a tu API para renovar el token
    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) throw new Error('Error al refrescar el token');
    
    const data = await response.json();
    setAuthTokens(data.accessToken, data.refreshToken);
    return true;
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    // Si hay error, limpia las cookies
    logout();
    return false;
  }
};

// Cierra la sesión eliminando las cookies
export const logout = () => {
  Cookies.remove(ACCESS_TOKEN, { path: '/' });
  Cookies.remove(REFRESH_TOKEN, { path: '/' });
  // Redirigir a la página de inicio de sesión
  window.location.href = '/login';
};