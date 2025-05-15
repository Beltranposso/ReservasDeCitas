import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { PlusCircle } from "lucide-react"
import EventTypesList from "../../components/event-types-list"
import CreateEventForm from "./components/create-event-form"
import { FadeIn } from "../../components/animations/fade-in"

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <Button className="gap-2 bg-pastel-pink text-acent-foreground hover:bg-pastel-pink/90">
          <PlusCircle className="h-4 w-4" />
          Crear Evento
        </Button>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Tabs defaultValue="types">
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
                <CreateEventForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
