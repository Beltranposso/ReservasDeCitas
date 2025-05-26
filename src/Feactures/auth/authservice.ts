// src/features/auth/authService.ts
import apiClient, { API_ENDPOINTS, setAuthToken, type ApiResponse } from '../../services/apiclient';

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

class AuthService {
  private tokenKey = 'authToken';
  private userKey = 'currentUser';

  // Login de usuario
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.users.login, credentials);
      
      if (response.data.success && response.data.data.token) {
        // Guardar token y usuario
        this.setToken(response.data.data.token);
        this.setUser(response.data.data.user);
        
        // Configurar token en apiClient
        setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  // Registro de usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.users.register, userData);
      
      if (response.data.success && response.data.data.token) {
        // Guardar token y usuario
        this.setToken(response.data.data.token);
        this.setUser(response.data.data.user);
        
        // Configurar token en apiClient
        setAuthToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  // Obtener perfil del usuario actual
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserProfile }>(API_ENDPOINTS.users.profile);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  }

  // Actualizar perfil
  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.patch<{ success: boolean; data: UserProfile }>(
        API_ENDPOINTS.users.updateProfile, 
        userData
      );
      
      // Actualizar usuario en localStorage
      if (response.data.success) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          this.setUser({ ...currentUser, ...response.data.data });
        }
      }
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  }

  // Cambiar contraseña
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.patch(API_ENDPOINTS.users.updatePassword, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar contraseña');
    }
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    setAuthToken(null);
    
    // Redirigir al login
    window.location.href = '/login';
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Guardar token
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obtener usuario actual
  getCurrentUser(): UserProfile | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Guardar usuario
  private setUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Recuperar contraseña
  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/api/users/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al enviar correo de recuperación');
    }
  }

  // Restablecer contraseña
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/api/users/reset-password', { token, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al restablecer contraseña');
    }
  }

  // Eliminar cuenta
  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.users.deleteAccount);
      this.logout();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar cuenta');
    }
  }

  // Verificar disponibilidad de email
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
        `${API_ENDPOINTS.users.checkEmail}?email=${encodeURIComponent(email)}`
      );
      return response.data.data?.available || false;
    } catch (error: any) {
      return false;
    }
  }

  // Validar token
  async validateToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      const response = await apiClient.post<ApiResponse>(API_ENDPOINTS.users.validateToken);
      return response.data.success || false;
    } catch (error) {
      return false;
    }
  }

  // Verificar estado de autenticación
  async checkAuthStatus(): Promise<{ authenticated: boolean; user?: UserProfile }> {
    try {
      const response = await apiClient.get<ApiResponse<{ authenticated: boolean; user?: UserProfile }>>(
        API_ENDPOINTS.users.authStatus
      );
      return response.data.data || { authenticated: false };
    } catch (error) {
      return { authenticated: false };
    }
  }

  // Actualizar configuraciones
  async updateSettings(settings: any): Promise<any> {
    try {
      const response = await apiClient.patch<ApiResponse>(API_ENDPOINTS.users.updateSettings, settings);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar configuraciones');
    }
  }

  // Buscar usuarios
  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile[]>>(
        `${API_ENDPOINTS.users.search}?q=${encodeURIComponent(query)}`
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error buscando usuarios:', error);
      return [];
    }
  }

  // Obtener perfil público de usuario
  async getPublicProfile(userId: number): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfile>>(
        API_ENDPOINTS.users.publicProfile(userId)
      );
      return response.data.data || null;
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();