import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Calendar, MoreHorizontal, Search, UserPlus, Loader2, AlertCircle } from "lucide-react"
import { FadeIn } from "../../../components/animations/fade-in"
import { StaggerContainer } from "../../../components/animations/stagger-container"
import { api, API_ENDPOINTS } from "../../../services/apiclient"
import { toast } from "sonner" // Asumiendo que usas sonner para notifications

// Tipos para TypeScript basados en la estructura de la API
interface Contact {
  id: number
  name: string
  email: string
  company?: string
  phone?: string
  notes?: string
  created_at: string
  updated_at: string
  last_event_date?: string
  status?: 'active' | 'inactive' | 'pending'
}

// Respuesta flexible que puede manejar diferentes estructuras del endpoint getAll
interface ContactsResponse {
  contacts?: Contact[]  // Por si viene en un objeto con propiedad contacts
  total?: number
  page?: number
  limit?: number
}

export default function ContactsPage() {
  // Estados
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])

  // Cargar contactos al montar el componente
  useEffect(() => {
    fetchContacts()
  }, [])

  // Filtrar contactos cuando cambie el término de búsqueda (solo filtrado local)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContacts(contacts)
    } else {
      filterContactsLocally(searchTerm)
    }
  }, [contacts, searchTerm])

  // Función para obtener todos los contactos
  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get<ContactsResponse>(API_ENDPOINTS.contacts.getAll)
      
      if (response.data.success) {
        // El endpoint getAll devuelve directamente el array de contactos
        const contactsData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data?.contacts || []
        
        setContacts(contactsData)
      } else {
        setError(response.data.message || 'Error al cargar contactos')
      }
    } catch (err: any) {
      console.error('Error fetching contacts:', err)
      
      // Manejo específico de errores HTTP
      if (err.response) {
        const status = err.response.status
        const errorMessage = err.response.data?.message || err.response.data?.error
        
        switch (status) {
          case 401:
            setError('No autorizado. Por favor, inicia sesión nuevamente.')
            break
          case 403:
            setError('No tienes permisos para ver los contactos.')
            break
          case 404:
            setError('Endpoint de contactos no encontrado.')
            break
          case 500:
            setError('Error interno del servidor.')
            break
          default:
            setError(errorMessage || `Error del servidor (${status})`)
        }
      } else if (err.request) {
        setError('Error de conexión al servidor. Verifica tu conexión a internet.')
      } else {
        setError('Error inesperado al cargar contactos')
      }
      
      toast.error('No se pudieron cargar los contactos')
    } finally {
      setLoading(false)
    }
  }

  // Función para buscar contactos
  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    
    if (term.trim() === "") {
      setFilteredContacts(contacts)
      return
    }

    try {
      // Intentar búsqueda en el servidor si el endpoint está disponible
      const response = await api.get(`${API_ENDPOINTS.contacts.search}?q=${encodeURIComponent(term)}`)
      
      if (response.data.success) {
        const searchResults = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data?.contacts || []
        setFilteredContacts(searchResults)
      } else {
        // Si el servidor no devuelve éxito, usar filtrado local
        filterContactsLocally(term)
      }
    } catch (err) {
      console.log('Server search not available, using local filter')
      // Si falla la búsqueda en el servidor, usar filtrado local
      filterContactsLocally(term)
    }
  }

  // Función auxiliar para filtrado local
  const filterContactsLocally = (term: string) => {
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(term.toLowerCase()) ||
      contact.email.toLowerCase().includes(term.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(term.toLowerCase()))
    )
    setFilteredContacts(filtered)
  }

  // Función para eliminar contacto
  const handleDeleteContact = async (contactId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      return
    }

    try {
      const response = await api.delete(API_ENDPOINTS.contacts.delete(contactId))
      
      if (response.data.success) {
        setContacts(contacts.filter(contact => contact.id !== contactId))
        toast.success('Contacto eliminado correctamente')
      } else {
        toast.error(response.data.message || 'Error al eliminar contacto')
      }
    } catch (err) {
      console.error('Error deleting contact:', err)
      toast.error('Error al eliminar contacto')
    }
  }

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sin eventos'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Función para obtener el estilo del badge según el estado
  const getBadgeProps = (status: string) => {
    switch (status) {
      case 'active':
        return {
          variant: "default" as const,
          className: "bg-pastel-mint text-acent-foreground"
        }
      case 'pending':
        return {
          variant: "outline" as const,
          className: "border-primary/20 text-muted-foreground"
        }
      case 'inactive':
        return {
          variant: "secondary" as const,
          className: "bg-pastel-lavender/30"
        }
      default:
        return {
          variant: "secondary" as const,
          className: ""
        }
    }
  }

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'pending': return 'Pendiente'
      case 'inactive': return 'Inactivo'
      default: return 'Desconocido'
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Error al cargar contactos</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchContacts} variant="outline">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contactos</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? 'Cargando...' : `${filteredContacts.length} contacto${filteredContacts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button className="gap-2 hover:bg-pastel-mint hover:scale-105 hover:bg-green-700 transition-all duration-150 text-acent-foreground hover:bg-pastel-mint/90">
          <UserPlus className="h-4 w-4" />
          Añadir Contacto
        </Button>
      </FadeIn>

      <FadeIn delay={0.1} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar contactos..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Button variant="outline">Filtrar</Button>
        <Button variant="outline">Exportar</Button>
      </FadeIn>

      <FadeIn delay={0.3} className="rounded-md border w-auto">
        <Table>
          <StaggerContainer>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nombre</TableHead>
                <TableHead className="w-[200px]">Email</TableHead>
                <TableHead className="w-[180px]">Empresa</TableHead>
                <TableHead className="w-[180px]">Último Evento</TableHead>
                <TableHead className="w-[120px]">Estado</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Cargando contactos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium">No se encontraron contactos</p>
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Intenta con un término de búsqueda diferente' : 'Comienza añadiendo tu primer contacto'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" alt={contact.name} />
                          <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{contact.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.company || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formatDate(contact.last_event_date || '')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        {...getBadgeProps(contact.status || 'inactive')}
                      >
                        {getStatusText(contact.status || 'inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Programar Evento</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </StaggerContainer>
        </Table>
      </FadeIn>
    </div>
  )
}