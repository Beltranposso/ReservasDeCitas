import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { Button } from "../../../../components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { StaggerContainer } from "../../../../components/animations/stagger-container"

export interface Contact {
  id: number
  name: string
  email: string
  timezone: string
  phone: string
}

interface ContactsTableProps {
  contacts: Contact[]
  isLoading: boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onViewDetails?: (contact: Contact) => void
  onScheduleEvent?: (contact: Contact) => void
}

export function ContactsTable({
  contacts,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
  onScheduleEvent
}: ContactsTableProps) {
  return (
    <Table>
      <StaggerContainer>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Nombre</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[180px]">Teléfono</TableHead>
            <TableHead className="w-[180px]">Zona Horaria</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Cargando contactos...
              </TableCell>
            </TableRow>
          ) : contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No hay contactos disponibles
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-user.jpg" alt={contact.name} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.timezone}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onViewDetails && (
                        <DropdownMenuItem onClick={() => onViewDetails(contact)}>
                          Ver Detalles
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(contact)}>
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onScheduleEvent && (
                        <DropdownMenuItem onClick={() => onScheduleEvent(contact)}>
                          Programar Evento
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => onDelete(contact)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </StaggerContainer>
    </Table>
  )
} 