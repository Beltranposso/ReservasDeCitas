import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { FadeIn } from "../../../components/animations/fade-in"
import { Dialog, DialogTrigger } from "../../../components/ui/dialog"
import { Search, UserPlus, Calendar, Share2, MoreVertical, X, Mail, Globe, Phone, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { ContactForm } from "./components/ContactForm"
import { ContactsTable, type Contact } from "./components/ContactsTable"
import { contactsService } from "./services/contacts.service" 
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../../components/ui/sheet.tsx"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../../../components/ui/dropdown-menu"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "../../../components/ui/alert-dialog"

export default function ContactsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  const fetchContacts = async () => {
    try {
      const data = await contactsService.getAll()
      setContacts(data)
    } catch (error) {
      console.error("Error:", error)
      alert("Error al cargar los contactos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleCreateContact = async (contactData: Omit<Contact, "id">) => {
    try {
      await contactsService.create(contactData)
      setIsDialogOpen(false)
      fetchContacts()
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear el contacto")
    }
  }

  const handleEditContact = async (contact: Contact) => {
    console.log('Editando contacto:', contact);
    setSelectedContact(contact)
    setIsDialogOpen(true)
  }

  const handleUpdateContact = async (contactData: Omit<Contact, "id">) => {
    if (!selectedContact) return

    try {
      console.log('Intentando actualizar contacto:', {
        id: selectedContact.id,
        currentData: selectedContact,
        newData: contactData
      });

      const updatedContact = await contactsService.update(selectedContact.id, contactData)
      console.log('Contacto actualizado exitosamente:', updatedContact);

      setIsDialogOpen(false)
      setSelectedContact(null)
      await fetchContacts()
    } catch (error) {
      console.error("Error al actualizar el contacto:", error)
      alert(error instanceof Error ? error.message : "Error al actualizar el contacto. Por favor, intente nuevamente.")
    }
  }

  const handleDeleteContact = async (contact: Contact) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este contacto?")) return

    try {
      await contactsService.delete(contact.id)
      fetchContacts()
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar el contacto")
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedContact(null)
  }

  const [isContactDetailsOpen, setIsContactDetailsOpen] = useState(false)
  const [contactDetails, setContactDetails] = useState<Contact | null>(null)

  const handleViewContactDetails = (contact: Contact) => {
    setContactDetails(contact)
    setIsContactDetailsOpen(true)
  }

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null)

  const handleDeleteClick = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  }

  const confirmDelete = async () => {
    if (!contactToDelete) return;
    
    try {
      await contactsService.delete(contactToDelete.id);
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
      fetchContacts();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el contacto");
    }
  }

  const handleDropdownOpen = (contactId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(contactId);
  };

  const handleDropdownClose = () => {
    setOpenDropdownId(null);
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Añadir Contacto
            </Button>
          </DialogTrigger>
          <ContactForm
            onSubmit={selectedContact ? handleUpdateContact : handleCreateContact}
            onCancel={handleCloseDialog}
            initialData={selectedContact || undefined}
          />
        </Dialog>
      </FadeIn>

      <FadeIn delay={0.1} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar contactos..." className="pl-8" />
        </div>
        <Button variant="outline">Filtrar</Button>
        <Button variant="outline">Exportar</Button>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando contactos...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">No hay contactos disponibles</div>
          ) : (
            contacts.map((contact) => (
              <div 
                key={contact.id} 
                className="border rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                onClick={() => handleViewContactDetails(contact)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-medium">
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-sm text-muted-foreground">{contact.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                    e.stopPropagation();
                    // Lógica para reservar reunión
                  }}>
                    <Calendar className="h-4 w-4" />
                    Reservar reunión
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={(e) => {
                    e.stopPropagation();
                    // Lógica para compartir disponibilidad
                  }}>
                    <Share2 className="h-4 w-4" />
                    Compartir disponibilidad
                  </Button>
                  <DropdownMenu open={openDropdownId === contact.id} onOpenChange={(open) => {
                    if (!open) handleDropdownClose();
                  }}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => handleDropdownOpen(contact.id, e)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditContact(contact);
                          handleDropdownClose();
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(contact, e);
                          handleDropdownClose();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Quitar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </FadeIn>

      {/* Panel deslizante de detalles del contacto */}
      <Sheet open={isContactDetailsOpen} onOpenChange={setIsContactDetailsOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-auto border-l border-gray-200 shadow-lg p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsContactDetailsOpen(false)}
                className="rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            {contactDetails && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-medium shadow-sm">
                    {getInitials(contactDetails.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-800">{contactDetails.name}</h2>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="rounded-full hover:bg-blue-50"
                        >
                          <div className="text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          </div>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="h-5 w-5 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-500">Contacto</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700">
                    <Calendar className="h-4 w-4" />
                    Reservar reunión
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700">
                    <Share2 className="h-4 w-4" />
                    Compartir disponibilidad
                  </Button>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-gray-800">Detalles</h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">{contactDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">América/Adak</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-700">Número de contacto</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Reuniones</h3>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-100 p-4 rounded-full shadow-sm">
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2 text-gray-800">Sin reuniones</h4>
                    <p className="text-gray-500 mb-4">No hay historial de reuniones</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Diálogo de confirmación para eliminar contacto */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Quitar a {contactToDelete?.name} de su lista de contactos?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Si completa esta acción, se eliminará este contacto de su lista de contactos. 
              En caso de que dicho contacto intente programar algo con usted, no se volverá a añadir a la lista. 
              El historial de reuniones con él seguirá apareciendo en sus eventos programados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Función para obtener las iniciales del nombre
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

