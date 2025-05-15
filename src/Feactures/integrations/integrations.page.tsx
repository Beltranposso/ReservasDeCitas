import { Button } from "../../components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Switch } from "../../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Calendar, Link2, Video } from "lucide-react"
import { FadeIn } from "../../components/animations/fade-in"
import { StaggerContainer } from "../../components/animations/stagger-container"
import { AnimatedCard } from "../../components/animations/animated-card"

export default function IntegrationsPage() {
  const videoIntegrations = [
    {
      id: "gmeet",
      name: "Google Meet",
      description: "Integra tus reuniones con Google Meet",
      icon: "https://files.svgcdn.io/logos/google-meet.svg",
      connected: true,
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Conecta con Zoom para videollamadas",
      icon: "https://files.svgcdn.io/logos/zoom.svg",
      connected: true,
    },
    {
      id: "teams",
      name: "Microsoft Teams",
      description: "Integra tus reuniones con Microsoft Teams",
      icon: "https://files.svgcdn.io/logos/microsoft-teams.svg",
      connected: false,
    },
  ]

  const calendarIntegrations = [
    {
      id: "gcal",
      name: "Google Calendar",
      description: "Sincroniza con tu calendario de Google",
      icon: "https://files.svgcdn.io/logos/google-calendar.svg",
      connected: true,
    },
    {
      id: "outlook",
      name: "Outlook Calendar",
      description: "Conecta con tu calendario de Outlook",
      icon: "https://files.svgcdn.io/vscode-icons/file-type-outlook.svg",
      connected: false,
    },
    {
      id: "apple",
      name: "Apple Calendar",
      description: "Sincroniza con tu calendario de Apple",
      icon: "https://files.svgcdn.io/zmdi/apple.svg",
      connected: false,
    },
  ]

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Integraciones</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Tabs defaultValue="video">
          <TabsList>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Videollamadas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendarios
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Otras Integraciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="mt-6">
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videoIntegrations.map((integration, index) => (
                <AnimatedCard key={integration.id} index={index}>
                  <Card>
                    <CardHeader className="flex flex-row items-start gap-4">
                      <img
                        src={integration.icon}
                        alt={integration.name}
                        className="h-12 w-12 rounded-md"
                      />
                      <div className="grid gap-1">
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {integration.connected && (
                            <Badge variant="outline" className="ml-2">
                              Conectado
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={integration.connected} />
                        <span className="text-sm">{integration.connected ? "Activado" : "Desactivado"}</span>
                      </div>
                      <Button
                        variant={integration.connected ? "outline" : "default"}
                        className={
                          integration.connected ? "" : "bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                        }
                      >
                        {integration.connected ? "Configurar" : "Conectar"}
                      </Button>
                    </CardFooter>
                  </Card>
                </AnimatedCard>
              ))}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {calendarIntegrations.map((integration, index) => (
                <AnimatedCard key={integration.id} index={index}>
                  <Card>
                    <CardHeader className="flex flex-row items-start gap-4">
                      <img
                        src={integration.icon || "/placeholder.svg"}
                        alt={integration.name}
                        className="h-12 w-12 rounded-md"
                      />
                      <div className="grid gap-1">
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {integration.connected && (
                            <Badge variant="outline" className="ml-2">
                              Conectado
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={integration.connected} />
                        <span className="text-sm">{integration.connected ? "Activado" : "Desactivado"}</span>
                      </div>
                      <Button
                        variant={integration.connected ? "outline" : "default"}
                        className={
                          integration.connected ? "" : "bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                        }
                      >
                        {integration.connected ? "Configurar" : "Conectar"}
                      </Button>
                    </CardFooter>
                  </Card>
                </AnimatedCard>
              ))}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="other" className="mt-6">
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatedCard index={0}>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <img src="https://files.svgcdn.io/devicon/slack.svg" alt="Slack" className="h-12 w-12 rounded-md" />
                    <div className="grid gap-1">
                      <CardTitle>Slack</CardTitle>
                      <CardDescription>Recibe notificaciones en Slack</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={false} />
                      <span className="text-sm">Desactivado</span>
                    </div>
                    <Button className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90">Conectar</Button>
                  </CardFooter>
                </Card>
              </AnimatedCard>

              <AnimatedCard index={1}>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <img src="https://files.svgcdn.io/logos/zapier.svg" alt="Zapier" className="h-12 w-12 rounded-md" />
                    <div className="grid gap-1">
                      <CardTitle>Zapier</CardTitle>
                      <CardDescription>Automatiza flujos de trabajo</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={false} />
                      <span className="text-sm">Desactivado</span>
                    </div>
                    <Button className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90">Conectar</Button>
                  </CardFooter>
                </Card>
              </AnimatedCard>

              <AnimatedCard index={2}>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <img src="https://files.svgcdn.io/arcticons/zoho-crm.svg" alt="CRM" className="h-12 w-12 rounded-md" />
                    <div className="grid gap-1">
                      <CardTitle>CRM</CardTitle>
                      <CardDescription>Integra con tu sistema CRM</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={false} />
                      <span className="text-sm">Desactivado</span>
                    </div>
                    <Button className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90">Conectar</Button>
                  </CardFooter>
                </Card>
              </AnimatedCard>
            </StaggerContainer>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
