// Token de autenticación para la API
export const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzQ3NzU5MjAxLCJleHAiOjE3NDgzNjQwMDF9.D1SsxKEHkCyqE9mCbZImbWvYI-jcjBNOVUFCcJP1zUs" // Reemplaza esto con tu token real

// Configuración base de la API
export const API_CONFIG = {
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${API_TOKEN}`
  }
} 