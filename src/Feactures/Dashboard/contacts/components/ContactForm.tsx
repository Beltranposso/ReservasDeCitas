import { useState } from "react"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Label } from "../../../../components/ui/label"
import { DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog"

interface ContactFormData {
  name: string
  email: string
  timezone: string
  phone: string
}

interface ContactFormProps {
  onSubmit: (contact: ContactFormData) => void
  onCancel: () => void
  initialData?: ContactFormData
}

export function ContactForm({ onSubmit, onCancel, initialData }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    timezone: initialData?.timezone || "America/Mexico_City",
    phone: initialData?.phone || ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initialData ? "Editar Contacto" : "Nuevo Contacto"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Input
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            required
            maxLength={50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            maxLength={50}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? "Guardar Cambios" : "Crear Contacto"}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
} 