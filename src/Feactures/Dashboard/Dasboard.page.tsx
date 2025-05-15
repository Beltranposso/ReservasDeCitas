import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Calendar, Clock, Users, Video, PlusCircle } from "lucide-react"
import UpcomingEvents from "../../components/upcoming-events"
import EventTypesList from "../../components/event-types-list"
import { AnimatedCard } from "../../components/animations/animated-card"
import { FadeIn } from "../../components/animations/fade-in"
import { StaggerContainer } from "../../components/animations/stagger-container"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button className="gap-2 bg-pastel-pink text-acent-foreground hover:bg-pastel-pink/90">
          <PlusCircle className="h-4 w-4" />
          Crear Evento
        </Button>
      </FadeIn>

      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard className="bg-pastel-pink/20 h-full ">
          <Card className="border-none bg-transparent h-full ">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Eventos Totales</CardTitle>
              <Calendar className="h-4 w-4 text-pastel-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+10% desde el mes pasado</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard className="bg-pastel-blue/20 h-full">
          <Card className="border-none bg-transparent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Reuniones Programadas</CardTitle>
              <Clock className="h-4 w-4 text-pastel-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">4 pendientes para hoy</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard className="bg-pastel-mint/20">
          <Card className="border-none bg-transparent h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Contactos</CardTitle>
              <Users className="h-4 w-4 text-pastel-mint" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+5 nuevos esta semana</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard className="bg-pastel-lavender/20">
          <Card className="border-none bg-transparent h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Integraciones Activas</CardTitle>
              <Video className="h-4 w-4 text-pastel-lavender" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Google Meet, Zoom</p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </StaggerContainer>

      <FadeIn delay={0.3}>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Próximas Reuniones</TabsTrigger>
            <TabsTrigger value="types">Tipos de Eventos</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-4">
            <UpcomingEvents />
          </TabsContent>
          <TabsContent value="types" className="mt-4">
            <EventTypesList />
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
