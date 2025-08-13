import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useMemo, useState } from "react";

type ThemeOpt = "light" | "dark" | "auto";

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: {
    eventId: number;
    eventName: string;
    bookingUrl: string;
    embedUrl?: string; // embedUrl puede venir vacío y no debe romper
  } | null;
  selectedTab?: string;
  onTabChange?: (tab: string) => void;
  embedConfig?: {
    theme: string;
    setTheme: (theme: string) => void;
    hideDetails: boolean;
    setHideDetails: (hide: boolean) => void;
    brandColor: string;
    setBrandColor: (color: string) => void;
    buttonText: string;
    setButtonText: (text: string) => void;
    buttonPosition: string;
    setButtonPosition: (pos: string) => void;
    buttonColor: string;
    setButtonColor: (color: string) => void;
    textColor: string;
    setTextColor: (color: string) => void;
  };
  onCopyToClipboard?: (text: string, msg: string) => void;
  generateCodes?: {
    iframe: () => string;
    floating: () => string;
    react: () => string;
  };
}

const TAB_CONFIGS = [
  { key: "link", label: "Link" },
  { key: "iframe", label: "Iframe" },
  { key: "floating", label: "Botón flotante" },
  { key: "react", label: "React" },
];

// No-op para setters no provistos
const noop = (..._args: any[]) => {};

function buildSafeEmbedConfig(embedConfig?: ShareModalProps["embedConfig"]) {
  const theme = (embedConfig?.theme as ThemeOpt) || "auto";
  return {
    theme,
    setTheme: embedConfig?.setTheme || noop,
    hideDetails: embedConfig?.hideDetails ?? false,
    setHideDetails: embedConfig?.setHideDetails || noop,
    brandColor: embedConfig?.brandColor || "#0069ff",
    setBrandColor: embedConfig?.setBrandColor || noop,
    buttonText: embedConfig?.buttonText || "Reservar",
    setButtonText: embedConfig?.setButtonText || noop,
    buttonPosition: embedConfig?.buttonPosition || "bottom-right",
    setButtonPosition: embedConfig?.setButtonPosition || noop,
    buttonColor: embedConfig?.buttonColor || "#000000",
    setButtonColor: embedConfig?.setButtonColor || noop,
    textColor: embedConfig?.textColor || "#ffffff",
    setTextColor: embedConfig?.setTextColor || noop,
  };
}

export default function ShareModal({
  isOpen,
  onOpenChange,
  shareData,
  selectedTab = "link",
  onTabChange = noop,
  embedConfig,
  onCopyToClipboard = noop,
  generateCodes,
}: ShareModalProps) {
  // Hooks SIEMPRE al inicio (evita errores por orden de hooks)
  const [previewHeight, setPreviewHeight] = useState<number>(360);

  // Construye un objeto seguro de configuración aunque embedConfig venga undefined
  const safeEmbed = buildSafeEmbedConfig(embedConfig);

  // URL de vista previa del iframe (se actualiza con el estado del configurador)
  const previewSrc = useMemo(() => {
    if (!shareData?.embedUrl) return "";
    try {
      const params = new URLSearchParams({
        theme: safeEmbed.theme,
        brandColor: safeEmbed.brandColor.replace("#", ""),
        hideEventTypeDetails: String(!!safeEmbed.hideDetails),
      });
      return `${shareData.embedUrl}?${params.toString()}`;
    } catch {
      return shareData.embedUrl || "";
    }
  }, [shareData?.embedUrl, safeEmbed.theme, safeEmbed.brandColor, safeEmbed.hideDetails]);

  if (!shareData) return null;

  const showConfigurator = selectedTab === "iframe" || selectedTab === "floating" || selectedTab === "react";

  const FloatingPreview = () => {
    const containerBg =
      safeEmbed.theme === "dark" ? "#0f172a" : safeEmbed.theme === "light" ? "#ffffff" : "linear-gradient(180deg,#fff,#f8fafc)";
    const textCol = safeEmbed.textColor || "#ffffff";
    const btnCol = safeEmbed.buttonColor || "#000000";
    const pos = safeEmbed.buttonPosition || "bottom-right";

    const posStyle: React.CSSProperties = {
      position: "absolute",
      ...(pos.includes("bottom") ? { bottom: 16 } : { top: 16 }),
      ...(pos.includes("right") ? { right: 16 } : { left: 16 }),
    };

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: previewHeight,
          borderRadius: 12,
          overflow: "hidden",
          background: containerBg,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 16,
            color: safeEmbed.theme === "dark" ? "#e2e8f0" : "#0f172a",
            fontSize: 12,
          }}
        >
          <div style={{ opacity: 0.7 }}>
            Vista previa de tu sitio con botón flotante. Este es un mock visual para que veas el tamaño, color y posición.
          </div>
        </div>

        <button
          type="button"
          style={{
            ...posStyle,
            background: btnCol,
            color: textCol,
            border: 0,
            padding: "10px 14px",
            borderRadius: 999,
            fontSize: 14,
            boxShadow: "0 6px 18px rgba(0,0,0,.15)",
            cursor: "default",
          }}
        >
          {safeEmbed.buttonText || "Reservar"}
        </button>
      </div>
    );
  };

  const CodeSection = () => {
    if (selectedTab === "link") {
      return (
        <div className="space-y-2">
          <div>
            <span>Enlace de reservación:</span>
            <code className="block bg-muted p-2 rounded break-all">{shareData.bookingUrl}</code>
          </div>
          <Button onClick={() => onCopyToClipboard(shareData.bookingUrl, "Link copiado!")} size="sm">
            Copiar
          </Button>
        </div>
      );
    }

    if (!generateCodes) {
      return (
        <div className="space-y-2 text-xs text-muted-foreground">
          No hay generadores de código disponibles en este contexto.
        </div>
      );
    }

    if (selectedTab === "iframe") {
      const code = generateCodes.iframe();
      return (
        <div className="space-y-2">
          <div>
            <span>Iframe para embebido:</span>
            <code className="block bg-muted p-2 rounded whitespace-pre break-all">{code}</code>
          </div>
          <Button onClick={() => onCopyToClipboard(code, "Iframe copiado!")} size="sm">
            Copiar
          </Button>
        </div>
      );
    }

    if (selectedTab === "floating") {
      const code = generateCodes.floating();
      return (
        <div className="space-y-2">
          <div>
            <span>Botón flotante (script):</span>
            <code className="block bg-muted p-2 rounded whitespace-pre break-all">{code}</code>
          </div>
          <Button onClick={() => onCopyToClipboard(code, "Código copiado!")} size="sm">
            Copiar
          </Button>
        </div>
      );
    }

    const code = generateCodes.react();
    return (
      <div className="space-y-2">
        <div>
          <span>React embed:</span>
          <code className="block bg-muted p-2 rounded whitespace-pre break-all">{code}</code>
        </div>
        <Button onClick={() => onCopyToClipboard(code, "Código copiado!")} size="sm">
          Copiar
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[96vw] max-w-[980px] max-h-[85vh]
          overflow-hidden rounded-2xl shadow-2xl p-0
          bg-background
        "
      >
        <div className="max-h-[85vh] overflow-y-auto px-5 py-4">
          <DialogHeader className="mb-2">
            <DialogTitle>Compartir evento: {shareData.eventName}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 mb-4">
            {TAB_CONFIGS.map((tab) => (
              <Button
                key={tab.key}
                variant={selectedTab === tab.key ? "default" : "outline"}
                onClick={() => onTabChange(tab.key)}
                size="sm"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {showConfigurator && (
                <div className="mb-1 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Color de marca:</label>
                    <Input
                      type="color"
                      value={safeEmbed.brandColor}
                      onChange={(e) => safeEmbed.setBrandColor(e.target.value)}
                      className="w-12 h-8 p-0 border-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Tema:</label>
                      <select
                        value={safeEmbed.theme}
                        onChange={(e) => safeEmbed.setTheme(e.target.value)}
                        className="border rounded px-2 py-1 text-xs"
                      >
                        <option value="auto">Auto</option>
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold">Ocultar detalles:</label>
                      <input
                        type="checkbox"
                        checked={safeEmbed.hideDetails}
                        onChange={(e) => safeEmbed.setHideDetails(e.target.checked)}
                        className="mr-1"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="block text-xs font-semibold">Alto vista previa:</label>
                      <input
                        type="range"
                        min={240}
                        max={640}
                        value={previewHeight}
                        onChange={(e) => setPreviewHeight(parseInt(e.target.value, 10))}
                      />
                      <span className="text-[10px] text-muted-foreground w-10">{previewHeight}px</span>
                    </div>
                  </div>

                  {selectedTab === "floating" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Texto del botón:</label>
                        <Input
                          value={safeEmbed.buttonText}
                          onChange={(e) => safeEmbed.setButtonText(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Posición del botón:</label>
                        <select
                          value={safeEmbed.buttonPosition}
                          onChange={(e) => safeEmbed.setButtonPosition(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-full"
                        >
                          <option value="bottom-right">Abajo derecha</option>
                          <option value="bottom-left">Abajo izquierda</option>
                          <option value="top-right">Arriba derecha</option>
                          <option value="top-left">Arriba izquierda</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Color del botón:</label>
                        <Input
                          type="color"
                          value={safeEmbed.buttonColor}
                          onChange={(e) => safeEmbed.setButtonColor(e.target.value)}
                          className="w-12 h-8 p-0 border-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Color del texto:</label>
                        <Input
                          type="color"
                          value={safeEmbed.textColor}
                          onChange={(e) => safeEmbed.setTextColor(e.target.value)}
                          className="w-12 h-8 p-0 border-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <CodeSection />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold opacity-70">Vista previa</div>

              {selectedTab === "iframe" && (
                <div
                  style={{
                    width: "100%",
                    height: previewHeight,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.06)",
                    background: safeEmbed.theme === "dark" ? "#0b1220" : "#ffffff",
                  }}
                >
                  {previewSrc ? (
                    <iframe
                      src={previewSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      title="Vista previa del embed"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">
                      Configura el iframe para ver la vista previa
                    </div>
                  )}
                </div>
              )}

              {selectedTab === "floating" && <FloatingPreview />}

              {selectedTab === "react" && (
                <div
                  style={{
                    width: "100%",
                    height: previewHeight,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.06)",
                    background: safeEmbed.theme === "dark" ? "#0b1220" : "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    color: safeEmbed.theme === "dark" ? "#e2e8f0" : "#0f172a",
                    padding: 12,
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  La previsualización de React se muestra como iframe del embed real en la pestaña "Iframe".
                </div>
              )}

              {selectedTab === "link" && (
                <div
                  style={{
                    width: "100%",
                    height: previewHeight,
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.06)",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(180deg,#fff,#f8fafc)",
                  }}
                >
                  <a
                    href={shareData.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: safeEmbed.brandColor || "#0069ff",
                      color: "#fff",
                      padding: "10px 16px",
                      borderRadius: 8,
                      textDecoration: "none",
                      boxShadow: "0 6px 18px rgba(0,0,0,.12)",
                      fontSize: 14,
                    }}
                  >
                    Abrir página de reserva
                  </a>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}