import axios from 'axios';

// URL base para todas las peticiones
const BASE_URL = process.env.REACT_APP_API_URL || ' http://localhost:3000/api';

// Rutas de la API
const API_ROUTES = {
  // Usuarios
  users: '/users',
  userById: (id: string) => `/users/${id}`,
  
  // Eventos
  events: '/events',
  eventById: (id: string) => `/events/${id}`,
  
  // Citas
  appointments: '/appointments',
  appointmentById: (id: string) => `/appointments/${id}`,
  
  // Disponibilidad
  availability: (userId: string) => `/availability/${userId}`,
  
  // Autenticación
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
};

// Cliente axios configurado
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('Error en la petición:', error.response?.status || error.message);
    return Promise.reject(error);
  }
);

// Función para establecer token de autenticación
const setAuthToken = (token: string) => {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Función para eliminar token de autenticación
const removeAuthToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};

export { API_ROUTES, setAuthToken, removeAuthToken };
export default apiClient;