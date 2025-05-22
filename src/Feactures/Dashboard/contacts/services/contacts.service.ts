import { API_CONFIG } from "../../../../config/api"
import type { Contact } from "../components/ContactsTable"

interface ApiResponse<T> {
  success: boolean
  data: T
}

interface ContactData {
  name: string
  email: string
  timezone: string
  phone: string
}

export const contactsService = {
  async getAll(): Promise<Contact[]> {
    const response = await fetch(`${API_CONFIG.baseURL}/contacts`, {
      headers: API_CONFIG.headers
    })

    if (!response.ok) {
      throw new Error("Error al obtener los contactos")
    }

    const result: ApiResponse<Contact[]> = await response.json()
    return result.data
  },

  async create(contact: Omit<Contact, "id">): Promise<Contact> {
    const response = await fetch(`${API_CONFIG.baseURL}/contacts`, {
      method: "POST",
      headers: API_CONFIG.headers,
      body: JSON.stringify(contact)
    })

    if (!response.ok) {
      throw new Error("Error al crear el contacto")
    }

    const result: ApiResponse<Contact> = await response.json()
    return result.data
  },

  async update(id: number, contact: Omit<Contact, "id">): Promise<Contact> {
    try {
      // Validar que todos los campos requeridos estén presentes
      const requiredFields: (keyof ContactData)[] = ['name', 'email', 'timezone', 'phone'];
      const missingFields = requiredFields.filter(field => !contact[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        throw new Error('El formato del email no es válido');
      }

      console.log('Enviando solicitud de actualización:', {
        url: `${API_CONFIG.baseURL}/contacts/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [TOKEN]' // Ocultamos el token por seguridad
        },
        body: contact
      });
      
      const response = await fetch(`${API_CONFIG.baseURL}/contacts/${id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': API_CONFIG.headers.Authorization
        },
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          timezone: contact.timezone,
          phone: contact.phone
        })
      });

      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Contacto con ID ${id} no encontrado`);
        } else if (response.status === 401) {
          throw new Error('No autorizado. Por favor, verifica tu token de autenticación');
        } else {
          throw new Error(responseData.error?.message || `Error al actualizar el contacto (${response.status})`);
        }
      }

      if (!responseData.success) {
        throw new Error(responseData.error?.message || 'Error en la respuesta del servidor');
      }

      return responseData.data;
    } catch (error) {
      console.error("Error en la actualización del contacto:", error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseURL}/contacts/${id}`, {
      method: "DELETE",
      headers: API_CONFIG.headers
    })

    if (!response.ok) {
      throw new Error("Error al eliminar el contacto")
    }
  }
} 