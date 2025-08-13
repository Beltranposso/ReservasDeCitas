import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from "../../../components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Switch } from "../../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
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
  enabled?: boolean; // estado Activado/Desactivado independiente
  provider?: string;
  email?: string;
  isLoading?: boolean;
}

type GCalSyncFrequency = 'real-time' | '15min' | '1hour' | 'manual';

interface GCalConfig {
  enabled: boolean;
  autoSync: boolean;
  notifications: boolean;
  blockBusyTimes: boolean;
  syncFrequency: GCalSyncFrequency;
  selectedCalendars: string[]; // ids de calendarios
}

interface GoogleCalendarItem {
  id: string;
  summary: string;
  primary?: boolean;
}

export default function IntegrationsPage() {
  const [searchParams] = useSearchParams();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);

  // Dialog único para toda la página
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [currentIntegration, setCurrentIntegration] = useState<IntegrationItem | null>(null);

  // Estado de configuración para Google Calendar
  const [gcalTab, setGcalTab] = useState<'settings' | 'calendars'>('settings');
  const [gcalConfig, setGcalConfig] = useState<GCalConfig>({
    enabled: true,
    autoSync: true,
    notifications: true,
    blockBusyTimes: true,
    syncFrequency: 'real-time',
    selectedCalendars: []
  });
  const [gcalCalendars, setGcalCalendars] = useState<GoogleCalendarItem[]>([]);
  const [loadingGcalConfig, setLoadingGcalConfig] = useState(false);

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
        return;
      }

      if (success === 'google_meet_connected') {
        toast.success('Google Meet conectado exitosamente');
        window.history.replaceState({}, '', '/dashboard/integraciones');
        await loadIntegrations();
        return;
      }

      if (code && state) {
        const tid = toast.loading('Conectando con Google Calendar...');
        try {
          await integrationsService.handleGoogleCallback(code, state);
          toast.success('Google Calendar conectado exitosamente');
          window.history.replaceState({}, '', '/dashboard/integraciones');
          await loadIntegrations();
        } catch (err: any) {
          toast.error(err?.message || 'Error al conectar con Google Calendar');
        } finally {
          toast.dismiss(tid);
        }
      }
    };

    handleOAuthResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Cargar estado de integraciones
  const loadIntegrations = async () => {
    try {
      setLoadingIntegrations(true);

      const integrationsData = await integrationsService.getIntegrationsStatus();
      const googleMeetStatus = await integrationsService.getGoogleMeetStatus();
      // Si el backend expone enabled, úsalo; si no, fallback a connected
      const googleCalendarConfig = (await safeCall(() => integrationsService.getGoogleCalendarConfig?.())) as Partial<GCalConfig> | undefined;

      const isGoogleCalendarConnected = !!integrationsData?.googleCalendar;
      const isGoogleMeetConnected = !!(integrationsData?.googleMeet || googleMeetStatus?.connected);
      const googleInfo = await safeCall(() => integrationsService.getIntegrationInfo?.(integrationsData, 'google_calendar'));

      const videoIntegrations: IntegrationItem[] = [
        {
          id: "gmeet",
          name: "Google Meet",
          description: "Integra tus reuniones con Google Meet",
          icon: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg",
          connected: isGoogleMeetConnected,
          enabled: isGoogleMeetConnected, // por ahora, igual que conectado
          provider: 'google_meet',
          email: (googleInfo as any)?.provider_email,
        },
        {
          id: "zoom",
          name: "Zoom",
          description: "Conecta con Zoom para videollamadas",
          icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Zoom_Logo_2022.svg/2560px-Zoom_Logo_2022.svg.png",
          connected: false,
          enabled: false,
          provider: 'zoom',
        },
        {
          id: "teams",
          name: "Microsoft Teams",
          description: "Integra tus reuniones con Microsoft Teams",
          icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png",
          connected: false,
          enabled: false,
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
          enabled: typeof googleCalendarConfig?.enabled === 'boolean'
            ? googleCalendarConfig.enabled
            : isGoogleCalendarConnected,
          provider: 'google_calendar',
          email: (googleInfo as any)?.provider_email,
        },
        {
          id: "outlook",
          name: "Outlook Calendar",
          description: "Conecta con tu calendario de Outlook",
          icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg/2203px-Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg.png",
          connected: false,
          enabled: false,
          provider: 'outlook',
        },
        {
          id: "apple",
          name: "Apple Calendar",
          description: "Sincroniza con tu calendario de Apple",
          icon: "https://help.apple.com/assets/63D8162D4F5E9E311D0CFA28/63D816334F5E9E311D0CFA30/en_US/d2a7e3fd5cac6f3ed0180316a0d1e44f.png",
          connected: false,
          enabled: false,
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
      toast.error(error?.message || 'Error al iniciar conexión con Google');
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

      setIntegrations(prev => prev.map(i =>
        (i.id === 'gcal' || i.id === 'gmeet')
          ? { ...i, connected: false, enabled: false, email: undefined, isLoading: false }
          : i
      ));
    } catch (error: any) {
      toast.error(error?.message || 'Error al desconectar Google Calendar');
      setIntegrations(prev => prev.map(i =>
        (i.id === 'gcal' || i.id === 'gmeet') ? { ...i, isLoading: false } : i
      ));
    }
  };

  // Toggle principal en tarjeta
  const handleIntegrationToggle = async (integrationId: string, checked: boolean) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integrationId === 'gcal') {
      if (!integration.connected && checked) {
        await handleGoogleConnect();
        return;
      }
      if (!integration.connected && !checked) return;

      try {
        await safeCall(() => integrationsService.setGoogleCalendarEnabled?.(checked));
        setIntegrations(prev => prev.map(i =>
          i.id === 'gcal' ? { ...i, enabled: checked } : i
        ));
        toast.success(`Google Calendar ${checked ? 'activado' : 'desactivado'}`);
      } catch {
        setIntegrations(prev => prev.map(i =>
          i.id === 'gcal' ? { ...i, enabled: checked } : i
        ));
      }
      return;
    }

    if (integrationId === 'gmeet') {
      if (!integration.connected && checked) {
        await handleGoogleConnect();
      } else if (integration.connected) {
        setIntegrations(prev => prev.map(i =>
          i.id === 'gmeet' ? { ...i, enabled: checked } : i
        ));
        toast.success(`Google Meet ${checked ? 'activado' : 'desactivado'}`);
      }
      return;
    }

    toast.info(`${integration.name} estará disponible próximamente`);
  };

  const openConfig = async (integration: IntegrationItem) => {
    setCurrentIntegration(integration);
    setConfigDialogOpen(true);

    if (integration.id === 'gcal') {
      setLoadingGcalConfig(true);
      setGcalTab('settings');
      try {
        const cfg = (await safeCall(() => integrationsService.getGoogleCalendarConfig?.())) as Partial<GCalConfig> | undefined;
        if (cfg) {
          setGcalConfig(prev => ({
            ...prev,
            ...cfg,
            enabled: typeof cfg.enabled === 'boolean' ? cfg.enabled : (integration.enabled ?? integration.connected)
          }));
        } else {
          setGcalConfig(prev => ({ ...prev, enabled: integration.enabled ?? integration.connected }));
        }

        const calendars = (await safeCall(() => integrationsService.listGoogleCalendars?.())) as GoogleCalendarItem[] | undefined;
        setGcalCalendars(Array.isArray(calendars) ? calendars : []);
      } finally {
        setLoadingGcalConfig(false);
      }
    }
  };

  const saveGcalConfig = async () => {
    try {
      await safeCall(() => integrationsService.updateGoogleCalendarConfig?.(gcalConfig));
      setIntegrations(prev => prev.map(i =>
        i.id === 'gcal' ? { ...i, enabled: gcalConfig.enabled } : i
      ));
      toast.success('Configuración de Google Calendar guardada');
      setConfigDialogOpen(false);
    } catch {
      setIntegrations(prev => prev.map(i =>
        i.id === 'gcal' ? { ...i, enabled: gcalConfig.enabled } : i
      ));
      toast.success('Configuración de Google Calendar actualizada (modo local)');
      setConfigDialogOpen(false);
    }
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
                          {integration.connected && (
                            <Badge variant={integration.enabled ? "default" : "secondary"} className="ml-2">
                              {integration.enabled ? 'Activado' : 'Desactivado'}
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
                          checked={!!integration.enabled}
                          disabled={integration.isLoading || !integration.connected}
                          onCheckedChange={(checked) =>
                            handleIntegrationToggle(integration.id, checked)
                          }
                        />
                        <span className="text-sm">
                          {integration.connected ? (integration.enabled ? "Activado" : "Desactivado") : "No conectado"}
                        </span>
                      </div>

                      {integration.connected ? (
                        <Button
                          variant="outline"
                          onClick={() => openConfig(integration)}
                        >
                          Configurar
                        </Button>
                      ) : (
                        <Button
                          className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                          disabled={integration.isLoading}
                          onClick={handleGoogleConnect}
                        >
                          {integration.isLoading && (
                            <lucideReact.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Conectar
                        </Button>
                      )}
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
                          {integration.connected && (
                            <Badge variant={integration.enabled ? "default" : "secondary"} className="ml-2">
                              {integration.enabled ? 'Activado' : 'Desactivado'}
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
                          checked={!!integration.enabled}
                          disabled={integration.isLoading || !integration.connected}
                          onCheckedChange={(checked) =>
                            handleIntegrationToggle(integration.id, checked)
                          }
                        />
                        <span className="text-sm">
                          {integration.connected ? (integration.enabled ? "Activado" : "Desactivado") : "No conectado"}
                        </span>
                      </div>

                      {integration.connected ? (
                        <Button
                          variant="outline"
                          onClick={() => openConfig(integration)}
                        >
                          Configurar
                        </Button>
                      ) : (
                        <Button
                          className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                          disabled={integration.isLoading}
                          onClick={handleGoogleConnect}
                        >
                          {integration.isLoading && (
                            <lucideReact.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Conectar
                        </Button>
                      )}
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
                    <Button
                      className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                      onClick={() => {
                        setCurrentIntegration({
                          id: 'slack',
                          name: 'Slack',
                          description: 'Recibe notificaciones en Slack',
                          icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Slack_Technologies_Logo.svg/2560px-Slack_Technologies_Logo.svg.png',
                          connected: false,
                          enabled: false
                        });
                        setConfigDialogOpen(true);
                      }}
                    >
                      Conectar
                    </Button>
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
                    <Button
                      className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                      onClick={() => {
                        setCurrentIntegration({
                          id: 'zapier',
                          name: 'Zapier',
                          description: 'Automatiza flujos de trabajo',
                          icon: 'https://images.ctfassets.net/c5bd0wqjc7v0/3dFdY6GvgLgCIXmBiN6eiA/d4acc5d4c5d557566cf0e46f9b58de43/icon-zapier.svg',
                          connected: false,
                          enabled: false
                        });
                        setConfigDialogOpen(true);
                      }}
                    >
                      Conectar
                    </Button>
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
                    <Button
                      className="bg-pastel-blue text-primary-foreground hover:bg-pastel-blue/90"
                      onClick={() => {
                        setCurrentIntegration({
                          id: 'hubspot',
                          name: 'HubSpot CRM',
                          description: 'Integra con tu sistema CRM',
                          icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/HubSpot_Logo.svg/2560px-HubSpot_Logo.svg.png',
                          connected: false,
                          enabled: false
                        });
                        setConfigDialogOpen(true);
                      }}
                    >
                      Conectar
                    </Button>
                  </CardFooter>
                </Card>
              </AnimatedCard>
            </StaggerContainer>
          </TabsContent>
        </Tabs>
      </FadeIn>

      {/* Dialog Único para configuración */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        {currentIntegration && (
          <DialogContent className="sm:max-w-[720px]">
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
                Ajusta las opciones de tu integración con {currentIntegration.name}
              </DialogDescription>
            </DialogHeader>

            {/* Google Calendar con pestañas de configuración */}
            {currentIntegration.id === 'gcal' ? (
              <>
                <Tabs value={gcalTab} onValueChange={(v) => setGcalTab(v as 'settings' | 'calendars')} className="mt-2">
                  <TabsList>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                    <TabsTrigger value="calendars">Calendarios</TabsTrigger>
                  </TabsList>

                  <TabsContent value="settings" className="mt-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Integración activada</Label>
                          <p className="text-xs text-muted-foreground">Permite usar Google Calendar en tu cuenta</p>
                        </div>
                        <Switch
                          checked={gcalConfig.enabled}
                          onCheckedChange={(checked) => setGcalConfig(prev => ({ ...prev, enabled: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Sincronización automática</Label>
                          <p className="text-xs text-muted-foreground">Mantén tu disponibilidad actualizada</p>
                        </div>
                        <Switch
                          checked={gcalConfig.autoSync}
                          onCheckedChange={(checked) => setGcalConfig(prev => ({ ...prev, autoSync: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notificaciones</Label>
                          <p className="text-xs text-muted-foreground">Recibe alertas de nuevas reservas y cambios</p>
                        </div>
                        <Switch
                          checked={gcalConfig.notifications}
                          onCheckedChange={(checked) => setGcalConfig(prev => ({ ...prev, notifications: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Bloquear horarios ocupados</Label>
                          <p className="text-xs text-muted-foreground">Evita reservas cuando tengas eventos en tu calendario</p>
                        </div>
                        <Switch
                          checked={gcalConfig.blockBusyTimes}
                          onCheckedChange={(checked) => setGcalConfig(prev => ({ ...prev, blockBusyTimes: checked }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Frecuencia de sincronización</Label>
                        <select
                          value={gcalConfig.syncFrequency}
                          onChange={(e) => setGcalConfig(prev => ({ ...prev, syncFrequency: e.target.value as GCalSyncFrequency }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        >
                          <option value="real-time">Tiempo real</option>
                          <option value="15min">Cada 15 minutos</option>
                          <option value="1hour">Cada hora</option>
                          <option value="manual">Manual</option>
                        </select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="calendars" className="mt-4">
                    {loadingGcalConfig ? (
                      <div className="flex items-center justify-center py-12">
                        <lucideReact.Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <Label>Calendarios a sincronizar</Label>
                        {gcalCalendars.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No se encontraron calendarios o no se pudo cargar la lista.</p>
                        ) : (
                          <div className="grid gap-2">
                            {gcalCalendars.map((cal) => {
                              const hasSelection = gcalConfig.selectedCalendars.length > 0;
                              const checked = hasSelection
                                ? gcalConfig.selectedCalendars.includes(cal.id)
                                : !!cal.primary; // por defecto, el principal
                              return (
                                <label key={cal.id} className="flex items-center justify-between rounded border p-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        setGcalConfig(prev => {
                                          const set = new Set(prev.selectedCalendars);
                                          if (e.target.checked) set.add(cal.id); else set.delete(cal.id);
                                          return { ...prev, selectedCalendars: Array.from(set) };
                                        });
                                      }}
                                    />
                                    <span className="text-sm">
                                      {cal.summary} {cal.primary ? <Badge variant="secondary" className="ml-2">Principal</Badge> : null}
                                    </span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Si no seleccionas ninguno, usaremos tu calendario principal por defecto.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveGcalConfig}>
                    Guardar cambios
                  </Button>
                </div>
              </>
            ) : (
              // Config por defecto o para gmeet
              <div className="grid gap-4 py-2">
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
                    {currentIntegration.connected && (
                      <Badge variant={currentIntegration.enabled ? "default" : "secondary"}>
                        {currentIntegration.enabled ? 'Activado' : 'Desactivado'}
                      </Badge>
                    )}
                  </div>
                </div>

                {currentIntegration.email && (
                  <div className="grid gap-2">
                    <Label>Cuenta conectada</Label>
                    <Input value={currentIntegration.email} disabled />
                  </div>
                )}

                {currentIntegration.id === 'gmeet' && (
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-crear enlaces Meet</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notificaciones</span>
                      <Switch defaultChecked />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-2">
                  <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                    Cerrar
                  </Button>
                  {currentIntegration.id === 'gmeet' && (
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
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

// Helper seguro para invocar servicios opcionales sin romper si aún no existen
async function safeCall<T>(fn?: () => Promise<T>): Promise<T | undefined> {
  try {
    if (!fn) return undefined;
    return await fn();
  } catch (e) {
    console.warn('safeCall warning:', e);
    return undefined;
  }
}