import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Calendar, MoreHorizontal, Search, UserPlus } from "lucide-react"
import { FadeIn } from "../../components/animations/fade-in"
import { StaggerContainer } from "../../components/animations/stagger-container"

export default function ContactsPage() {
  const contacts = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@example.com",
      company: "Acme Inc",
      lastEvent: "10 Mayo, 2025",
      status: "active",
    },
    {
      id: 2,
      name: "María López",
      email: "maria@example.com",
      company: "XYZ Corp",
      lastEvent: "5 Mayo, 2025",
      status: "active",
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      company: "ABC Ltd",
      lastEvent: "12 Mayo, 2025",
      status: "pending",
    },
    {
      id: 4,
      name: "Ana Martínez",
      email: "ana@example.com",
      company: "Tech Solutions",
      lastEvent: "1 Mayo, 2025",
      status: "active",
    },
    {
      id: 5,
      name: "Pedro Sánchez",
      email: "pedro@example.com",
      company: "Global Services",
      lastEvent: "30 Abril, 2025",
      status: "inactive",
    },
  ]

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contactos</h1>
        <Button className="gap-2 hover: bg-pastel-mint  hover:scale-105 hover:bg-green-700 transition-all duration-150  text-acent-foreground hover:bg-pastel-mint/90">
          <UserPlus className="h-4 w-4" />
          Añadir Contacto
        </Button>
      </FadeIn>

      <FadeIn delay={0.1} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar contactos..." className="pl-8" />
        </div>
        <Button variant="outline">Filtrar</Button>
        <Button variant="outline">Exportar</Button>
      </FadeIn>

      <FadeIn delay={0.3} className="rounded-md border w-aut ">
  <Table >
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
   
        {contacts.map((contact) => (
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
            <TableCell>{contact.company}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{contact.lastEvent}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  contact.status === "active" 
                    ? "default" 
                    : contact.status === "pending" 
                      ? "outline" 
                      : "secondary"
                }
                className={
                  contact.status === "active"
                    ? "bg-pastel-mint text-acent-foreground"
                    : contact.status === "pending"
                      ? "border-primary/20 text-muted-foreground"
                      : "bg-pastel-lavender/30"
                }
              >
                {contact.status === "active" ? "Activo" : contact.status === "pending" ? "Pendiente" : "Inactivo"}
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
                  <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
     
    </TableBody>
  </StaggerContainer>
  </Table>
</FadeIn> 
    </div>
  )
}
