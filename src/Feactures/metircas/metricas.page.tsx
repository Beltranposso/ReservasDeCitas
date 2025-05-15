import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Button } from "../../components/ui/button"
import { Calendar, Download } from "lucide-react"
import { FadeIn } from "../../components/animations/fade-in"
import { StaggerContainer } from "../../components/animations/stagger-container"
import { AnimatedCard } from "../../components/animations/animated-card"

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Métricas</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Últimos 30 días
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </FadeIn>

      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard className="bg-pastel-pink/20">
          <Card className="border-0 bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+12% desde el mes pasado</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard className="bg-pastel-blue/20">
          <Card className="border-0 bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">+5% desde el mes pasado</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard className="bg-pastel-mint/20">
          <Card className="border-0 bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42 min</div>
              <p className="text-xs text-muted-foreground">-3 min desde el mes pasado</p>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard className="bg-pastel-lavender/20">
          <Card className="border-0 bg-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78</div>
              <p className="text-xs text-muted-foreground">+15% desde el mes pasado</p>
            </CardContent>
          </Card>
        </AnimatedCard>
      </StaggerContainer>

      <FadeIn delay={0.3}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="contacts">Contactos</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad de Eventos</CardTitle>
                <CardDescription>Número de eventos programados en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Gráfico de Actividad de Eventos]</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Tipo de Evento</CardTitle>
                <CardDescription>Comparación de los diferentes tipos de eventos</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Gráfico de Rendimiento por Tipo de Evento]</div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Contactos</CardTitle>
                <CardDescription>Nuevos contactos agregados en los últimos 30 días</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">[Gráfico de Crecimiento de Contactos]</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>

      <StaggerContainer className="grid gap-6 md:grid-cols-2" initialDelay={0.4}>
        <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle>Eventos Populares</CardTitle>
              <CardDescription>Los tipos de eventos más reservados</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">[Gráfico de Eventos Populares]</div>
            </CardContent>
          </Card>
        </AnimatedCard>

        <AnimatedCard>
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Hora</CardTitle>
              <CardDescription>Horas más populares para reuniones</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">[Gráfico de Distribución por Hora]</div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </StaggerContainer>
    </div>  
  )
}
