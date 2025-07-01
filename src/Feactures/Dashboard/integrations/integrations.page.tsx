// src/features/dashboard/integrations/integrations.page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import * as lucideReact from "lucide-react";
import { FadeIn } from "../../../components/animations/fade-in";
import { StaggerContainer } from "../../../components/animations/stagger-container";
import { AnimatedCard } from "../../../components/animations/animated-card";
import integrationsService from './integrationsService';
import { toast } from 'sonner';

interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  provider?: string;
  email?: string;
  isLoading?: boolean;
}

export default function IntegrationsPage() {
  const [searchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<IntegrationItem | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Manejar respuesta de OAuth callbacks
  useEffect(() => {
    const handleOAuthResponse = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const success = searchParams.get('success');

      if (error) {
        toast.error(`Error de autorización: ${error}`);
        window.history.replaceState({}, '', '/dashboard/integraciones');
      } else if (success === 'google_meet_connected') {
        setShowSuccessToast(true);
        setTimeout(() => {
          toast.success('Google Meet conectado exitosamente');
        }, 100);
        window.history.replaceState({}, '', '/dashboard/integraciones');
        loadIntegrations(); // Recargar integraciones
      } else if (code && state) {
        try {
          toast.loading('Conectando con Google Calendar...');
          await integrationsService.handleGoogleCallback(code, state);
          setShowSuccessToast(true);
          setTimeout(() => {
            toast.success('Google Calendar conectado exitosamente');
          }, 100);
          window.history.replaceState({}, '', '/dashboard/integraciones');
          loadIntegrations();
        } catch (error: any) {
          toast.error(error.message || 'Error al conectar con Google Calendar');
        }
      }
    };

    handleOAuthResponse();
  }, [searchParams]);

  // Cargar estado de integraciones
  const loadIntegrations = async () => {
    try {
      setLoadingIntegrations(true);
      console.log('🔄 Cargando estado de integraciones...');

      const integrationsData = await integrationsService.getIntegrationsStatus();
      const googleMeetStatus = await integrationsService.getGoogleMeetStatus();
      
      // Verificar estados de Google
      const isGoogleCalendarConnected = integrationsData?.googleCalendar || false;
      const isGoogleMeetConnected = integrationsData?.googleMeet || googleMeetStatus?.connected || false;
      const googleInfo = integrationsService.getIntegrationInfo(integrationsData, 'google_calendar');

      console.log('📊 Estados de integración:', {
        googleCalendar: isGoogleCalendarConnected,
        googleMeet: isGoogleMeetConnected,
        googleInfo
      });

      const videoIntegrations: IntegrationItem[] = [
        {
          id: "gmeet",
          name: "Google Meet",
          description: "Integra tus reuniones con Google Meet",
          icon: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg", 
          connected: isGoogleMeetConnected,
          provider: 'google_meet',
          email: googleInfo?.provider_email,
        },
        {
          id: "zoom",
          name: "Zoom",
          description: "Conecta con Zoom para videollamadas",
          icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Zoom_Logo_2022.svg/2560px-Zoom_Logo_2022.svg.png", 
          connected: false,
          provider: 'zoom',
        },
        {
          id: "teams",
          name: "Microsoft Teams",
          description: "Integra tus reuniones con Microsoft Teams",
          icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png", 
          connected: false,
          provider: 'teams',
        },
      ];

      const calendarIntegrations: IntegrationItem[] = [
        {
          id: "gcal",
          name: "Google Calendar",
          description: "Sincroniza con tu calendario de Google",
          icon: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg", 
          connected: isGoogleCalendarConnected,
          provider: 'google_calendar',
          email: googleInfo?.provider_email,
        },
        {
          id: "outlook",
          name: "Outlook Calendar",
          description: "Conecta con tu calendario de Outlook",
          icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png", 
          connected: false,
          provider: 'outlook',
        },
        {
          id: "apple",
          name: "Apple Calendar",
          description: "Sincroniza con tu calendario de Apple",
          icon: "https://help.apple.com/assets/63D8162D4F5E9E311D0CFA28/63D816334F5E9E311D0CFA30/en_US/d2a7e3fd5cac6f3ed0180316a0d1e44f.png", 
          connected: false,
          provider: 'apple',
        },
      ];

      setIntegrations([...videoIntegrations, ...calendarIntegrations]);
    } catch (error) {
      console.error('❌ Error cargando integraciones:', error);
      toast.error('Error al cargar el estado de las integraciones');
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleGoogleConnect = async () => {
    try {
      setIntegrations(prev => prev.map(i =>
        (i.id === 'gcal' || i.id === 'gmeet') ? { ...i, isLoading: true } : i
      ));
      const { auth_url } = await integrationsService.startGoogleAuth();
      window.location.href = auth_url;
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar conexión con Google');
      setIntegrations(prev => prev.map(i =>
        (i.id === 'gcal' || i.id === 'gmeet') ? { ...i, isLoading: false } : i
      ));
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que deseas desconectar Google Calendar? Esto también desconectará Google Meet.')) return;

    try {
      setIntegrations(prev => prev.map(i =>
        (i.id === 'gcal' || i.id === 'gmeet') ? { ...i, isLoading: true } : i
      ));
      await integrationsService.disconnectGoogle();
      toast.success('Google Calendar y Google Meet desconectados');
      
      // Actualizar estado local inmediatamente
      setIntegrations(prev => prev.map(i =>
        (i.id === 'gcal' || i.id === 'gmeet') ? {
          ...i,
          connected: false,
          email: undefined,
          isLoading: false
        } : i
      ));
    } catch (error: any) {
      toast.error(error.message || 'Error al desconectar Google Calendar');
      setIntegrations(prev => prev.map(i =>
        (i.id === 'gcal' || i.id === 'gmeet') ? { ...i, isLoading: false } : i
      ));
    }
  };

  const handleGoogleMeetToggle = async (enabled: boolean) => {
    const googleCalendarIntegration = integrations.find(i => i.id === 'gcal');
    
    if (enabled) {
      // Para activar Google Meet, necesitamos que Google Calendar esté conectado
      if (!googleCalendarIntegration?.connected) {
        toast.info('Conectando con Google Calendar para habilitar Google Meet...');
        await handleGoogleConnect();
        return;
      }
      
      // Si Google Calendar ya está conectado, solo actualizar el estado de Meet
      setIntegrations(prev => prev.map(i =>
        i.id === 'gmeet' ? { ...i, connected: true } : i
      ));
      toast.success('Google Meet activado');
    } else {
      // Desactivar solo Google Meet
      setIntegrations(prev => prev.map(i =>
        i.id === 'gmeet' ? { ...i, connected: false } : i
      ));
      toast.success('Google Meet desactivado');
    }
  };

  const handleGoogleMeetAction = async (action: 'connect' | 'disconnect' | 'configure') => {
    const meetIntegration = integrations.find(i => i.id === 'gmeet');
    const googleCalendarIntegration = integrations.find(i => i.id === 'gcal');
    
    if (action === 'connect') {
      if (!googleCalendarIntegration?.connected) {
        toast.info('Conectando con Google Calendar para habilitar Google Meet...');
        await handleGoogleConnect();
      } else {
        // Google Calendar ya está conectado, solo activar Meet
        setIntegrations(prev => prev.map(i =>
          i.id === 'gmeet' ? { ...i, connected: true } : i
        ));
        toast.success('Google Meet activado');
      }
    } else if (action === 'disconnect') {
      await handleGoogleDisconnect();
    } else if (action === 'configure') {
      setCurrentIntegration(meetIntegration || null);
      setConfigDialogOpen(true);
    }
  };

  const handleIntegrationToggle = async (integrationId: string, checked: boolean) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integrationId === 'gcal') {
      if (checked) {
        await handleGoogleConnect();
      } else {
        await handleGoogleDisconnect();
      }
    } else if (integrationId === 'gmeet') {
      await handleGoogleMeetToggle(checked);
    } else {
      toast.info(`${integration.name} estará disponible próximamente`);
    }
  };

  const handleIntegrationAction = async (
    integrationId: string,
    action: 'connect' | 'disconnect' | 'configure'
  ) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integrationId === 'gcal') {
      if (action === 'connect') {
        await handleGoogleConnect();
      } else if (action === 'disconnect') {
        await handleGoogleDisconnect();
      } else if (action === 'configure') {
        setCurrentIntegration(integration);
        setConfigDialogOpen(true);
      }
      return;
    }

    if (integrationId === 'gmeet') {
      await handleGoogleMeetAction(action);
      return;
    }

    if (action === 'configure') {
      setCurrentIntegration(integration);
      setConfigDialogOpen(true);
    } else {
      toast.info(`${integration.name} estará disponible próximamente`);
    }
  };

  const renderConfigurationModal = () => {
    if (!currentIntegration) return null;

    const isGoogleIntegration = currentIntegration.id === 'gcal' || currentIntegration.id === 'gmeet';

    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src={currentIntegration.icon}
              alt={currentIntegration.name}
              className="h-6 w-6"
            />
            Configuración de {currentIntegration.name}
          </DialogTitle>
          <DialogDescription>
            Configura las opciones de tu integración con {currentIntegration.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Estado de la conexión</Label>
            <div className="flex items-center gap-2">
              <Badge variant={currentIntegration.connected ? "default" : "secondary"}>
                {currentIntegration.connected ? (
                  <>
                    <lucideReact.CheckCircle className="h-3 w-3 mr-1" />
                    Conectado
                  </>
                ) : (
                  <>
                    <lucideReact.XCircle className="h-3 w-3 mr-1" />
                    Desconectado
                  </>
                )}
              </Badge>
            </div>
          </div>

          {currentIntegration.email && (
            <div className="grid gap-2">
              <Label>Cuenta conectada</Label>
              <Input value={currentIntegration.email} disabled />
            </div>
          )}

          <div className="border-t my-4"></div>

          {isGoogleIntegration ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Configuración de sincronización</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sincronización automática</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificaciones</span>
                    <Switch defaultChecked />
                  </div>
                  {currentIntegration.id === 'gmeet' && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-crear enlaces Meet</span>
                      <Switch defaultChecked />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Frecuencia de sincronización</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="real-time">Tiempo real</option>
                  <option value="15min">Cada 15 minutos</option>
                  <option value="1hour">Cada hora</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <lucideReact.Settings className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                La configuración para {currentIntegration.name} estará disponible próximamente.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
            Cancelar
          </Button>
          {isGoogleIntegration && (
            <Button 
              onClick={() => {
                toast.success('Configuración guardada');
                setConfigDialogOpen(false);
              }}
            >
              Guardar cambios
            </Button>
          )}
        </div>
      </DialogContent>
    );
  };

  const videoIntegrations = integrations.filter(i => ['gmeet', 'zoom', 'teams'].includes(i.id));
  const calendarIntegrations = integrations.filter(i => ['gcal', 'outlook', 'apple'].includes(i.id));

  if (loadingIntegrations) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <lucideReact.Loader2 className="h-8 w-8 animate-spin text-pastel-pink" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Integraciones</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Tabs defaultValue="video">
          <TabsList>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <lucideReact.Video className="h-4 w-4" /> Videollamadas
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <lucideReact.Calendar className="h-4 w-4" /> Calendarios
            </TabsTrigger>
            <TabsTrigger value="other" className="flex items-center gap-2">
              <lucideReact.Link2 className="h-4 w-4" /> Otras Integraciones
            </TabsTrigger>
          </TabsList>

          {/* VIDEOLLAMADAS */}
          <TabsContent value="video" className="mt-6">
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videoIntegrations.map((integration, index) => (
                <AnimatedCard key={integration.id} index={index}>
                  <Card>
                    <CardHeader className="flex flex-row items-start gap-4">
                      <img
                        src={integration.icon}
                        alt={integration.name}
                        className="h-12 w-12 rounded-md object-contain"
                      />
                      <div className="grid gap-1">
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {integration.connected && (
                            <Badge variant="outline" className="ml-2">
                              <lucideReact.CheckCircle className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {integration.description}
                          {integration.email && (
                            <span className="block text-xs mt-1 text-muted-foreground">
                              {integration.email}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.connected}
                          disabled={integration.isLoading}
                          onCheckedChange={(checked) =>
                            handleIntegrationToggle(integration.id, checked)
                          }
                        />
                        <span className="text-sm">{integration.connected ? "Activado" : "Desactivado"}</span>
                      </div>
                      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant={integration.connected ? "outline" : "default"}
                            className={
                              integration.connected ? "" : "bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                            }
                            disabled={integration.isLoading}
                            onClick={() => handleIntegrationAction(
                              integration.id,
                              integration.connected ? 'configure' : 'connect'
                            )}
                          >
                            {integration.isLoading && <lucideReact.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {integration.connected ? "Configurar" : "Conectar"}
                          </Button>
                        </DialogTrigger>
                        {renderConfigurationModal()}
                      </Dialog>
                    </CardFooter>
                  </Card>
                </AnimatedCard>
              ))}
            </StaggerContainer>
          </TabsContent>

          {/* CALENDARIOS */}
          <TabsContent value="calendar" className="mt-6">
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {calendarIntegrations.map((integration, index) => (
                <AnimatedCard key={integration.id} index={index}>
                  <Card>
                    <CardHeader className="flex flex-row items-start gap-4">
                      <img
                        src={integration.icon || "/placeholder.svg"}
                        alt={integration.name}
                        className="h-12 w-12 rounded-md object-contain"
                      />
                      <div className="grid gap-1">
                        <CardTitle className="flex items-center gap-2">
                          {integration.name}
                          {integration.connected && (
                            <Badge variant="outline" className="ml-2">
                              <lucideReact.CheckCircle className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {integration.description}
                          {integration.email && (
                            <span className="block text-xs mt-1">
                              {integration.email}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={integration.connected}
                          disabled={integration.isLoading}
                          onCheckedChange={(checked) =>
                            handleIntegrationToggle(integration.id, checked)
                          }
                        />
                        <span className="text-sm">{integration.connected ? "Activado" : "Desactivado"}</span>
                      </div>
                      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant={integration.connected ? "outline" : "default"}
                            className={
                              integration.connected ? "" : "bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                            }
                            disabled={integration.isLoading}
                            onClick={() => handleIntegrationAction(
                              integration.id,
                              integration.connected ? 'configure' : 'connect'
                            )}
                          >
                            {integration.isLoading && <lucideReact.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {integration.connected ? "Configurar" : "Conectar"}
                          </Button>
                        </DialogTrigger>
                        {renderConfigurationModal()}
                      </Dialog>
                    </CardFooter>
                  </Card>
                </AnimatedCard>
              ))}
            </StaggerContainer>
          </TabsContent>

          {/* OTRAS INTEGRACIONES */}
          <TabsContent value="other" className="mt-6">
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatedCard index={0}>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/2560px-Slack_Technologies_Logo.svg.png" 
                      alt="Slack"
                      className="h-12 w-12 rounded-md object-contain"
                    />
                    <div className="grid gap-1">
                      <CardTitle>Slack</CardTitle>
                      <CardDescription>Recibe notificaciones en Slack</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={false} 
                        onCheckedChange={() => toast.info('Slack estará disponible próximamente')}
                      />
                      <span className="text-sm">Desactivado</span>
                    </div>
                    <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                          onClick={() => {
                            setCurrentIntegration({
                              id: 'slack',
                              name: 'Slack',
                              description: 'Recibe notificaciones en Slack',
                              icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/2560px-Slack_Technologies_Logo.svg.png',
                              connected: false
                            });
                          }}
                        >
                          Conectar
                        </Button>
                      </DialogTrigger>
                      {renderConfigurationModal()}
                    </Dialog>
                  </CardFooter>
                </Card>
              </AnimatedCard>
              <AnimatedCard index={1}>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <img
                      src="https://images.ctfassets.net/c5bd0wqjc7v0/3dFdY6GvgLgCIXmBiN6eiA/d4acc5d4c5d557566cf0e46f9b58de43/icon-zapier.svg" 
                      alt="Zapier"
                      className="h-12 w-12 rounded-md object-contain"
                    />
                    <div className="grid gap-1">
                      <CardTitle>Zapier</CardTitle>
                      <CardDescription>Automatiza flujos de trabajo</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={false}
                        onCheckedChange={() => toast.info('Zapier estará disponible próximamente')}
                      />
                      <span className="text-sm">Desactivado</span>
                    </div>
                    <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                          onClick={() => {
                            setCurrentIntegration({
                              id: 'zapier',
                              name: 'Zapier',
                              description: 'Automatiza flujos de trabajo',
                              icon: 'https://images.ctfassets.net/c5bd0wqjc7v0/3dFdY6GvgLgCIXmBiN6eiA/d4acc5d4c5d557566cf0e46f9b58de43/icon-zapier.svg',
                              connected: false
                            });
                          }}
                        >
                          Conectar
                        </Button>
                      </DialogTrigger>
                      {renderConfigurationModal()}
                    </Dialog>
                  </CardFooter>
                </Card>
              </AnimatedCard>
              <AnimatedCard index={2}>
                <Card>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/HubSpot_Logo.svg/2560px-HubSpot_Logo.svg.png" 
                      alt="CRM"
                      className="h-12 w-12 rounded-md object-contain"
                    />
                    <div className="grid gap-1">
                      <CardTitle>HubSpot CRM</CardTitle>
                      <CardDescription>Integra con tu sistema CRM</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={false}
                        onCheckedChange={() => toast.info('HubSpot estará disponible próximamente')}
                      />
                      <span className="text-sm">Desactivado</span>
                    </div>
                    <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                          onClick={() => {
                            setCurrentIntegration({
                              id: 'hubspot',
                              name: 'HubSpot CRM',
                              description: 'Integra con tu sistema CRM',
                              icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/HubSpot_Logo.svg/2560px-HubSpot_Logo.svg.png',
                              connected: false
                            });
                          }}
                        >
                          Conectar
                        </Button>
                      </DialogTrigger>
                      {renderConfigurationModal()}
                    </Dialog>
                  </CardFooter>
                </Card>
              </AnimatedCard>
            </StaggerContainer>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}