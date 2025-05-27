import { useState } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { PlusCircle } from "lucide-react"
import EventTypesList from "../../../components/event-types-list"
import CreateEventForm from "./components/create-event-form"
import { FadeIn } from "../../../components/animations/fade-in"
import apiClient, { API_ROUTES } from "../../../services/apiclient"
import {toast }  from "sonner"

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState("types")


  // Función para cambiar a la pestaña de creación
  const handleCreateClick = () => {
    setActiveTab("create")
  }

  // Función para manejar la creación exitosa de un evento
  const handleEventCreated = (eventData: any) => {
    toast({
      title: "Evento creado",
      description: `El evento "${eventData.title}" ha sido creado exitosamente.`,
      variant: "default",
    })
    setActiveTab("types") // Volver a la lista después de crear
  }

  // Función para crear un nuevo evento
  const createEvent = async (eventData: any) => {
    try {
      const response = await apiClient.post(API_ROUTES.eventTypes, eventData)
      handleEventCreated(response)
      return response
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo crear el evento",
        variant: "destructive",
      })
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Button 
          className="gap-2 bg-pastel-pink text-acent-foreground hover:bg-pastel-pink/90"
          onClick={handleCreateClick}
        >
          <PlusCircle className="h-4 w-4" />
          Crear Evento
        </Button>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="types">Tipos de Eventos</TabsTrigger>
            <TabsTrigger value="create">Crear Evento</TabsTrigger>
          </TabsList>
          <TabsContent value="types" className="mt-4">
            <EventTypesList />
          </TabsContent>
          <TabsContent value="create" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Crear Nuevo Tipo de Evento</CardTitle>
                <CardDescription>Define los detalles para tu nuevo tipo de evento</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateEventForm onSubmit={createEvent} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
