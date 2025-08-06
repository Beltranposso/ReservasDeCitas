import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useState } from "react";

interface ShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: {
    eventId: number;
    eventName: string;
    bookingUrl: string;
    embedUrl: string;
  } | null;
  selectedTab: string;
  onTabChange: (tab: string) => void;
  embedConfig: {
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
  onCopyToClipboard: (text: string, msg: string) => void;
  generateCodes: {
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

export default function ShareModal({
  isOpen,
  onOpenChange,
  shareData,
  selectedTab,
  onTabChange,
  embedConfig,
  onCopyToClipboard,
  generateCodes
}: ShareModalProps) {
  if (!shareData) return null;

  // Modal dimensions and centering
  // DialogContent receives a style override for centering and sizing
  // Internal content has scroll if needed
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          maxWidth: 600,
          minWidth: 360,
          width: "100%",
          height: 540,
          maxHeight: 540,
          position: "fixed",
          left: "70%",
          top: "80%",
          transform: "translate(-50%, -50%)",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,.15)",
          borderRadius: "1rem",
          background: "var(--background, #fff)"
        }}
        className="relative"
      >
        <div
          style={{
            height: 540,
            maxHeight: 540,
            overflowY: "auto",
            padding: "1.25rem"
          }}
        >
          <DialogHeader>
            <DialogTitle>Compartir evento: {shareData.eventName}</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-2 mb-4">
            {TAB_CONFIGS.map(tab => (
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
          {(selectedTab === "iframe" || selectedTab === "floating" || selectedTab === "react") && (
            <div className="mb-4 space-y-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Color de marca:</label>
                <Input
                  type="color"
                  value={embedConfig.brandColor}
                  onChange={e => embedConfig.setBrandColor(e.target.value)}
                  className="w-12 h-8 p-0 border-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Tema:</label>
                <select
                  value={embedConfig.theme}
                  onChange={e => embedConfig.setTheme(e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                >
                  <option value="auto">Auto</option>
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Ocultar detalles del evento:</label>
                <input
                  type="checkbox"
                  checked={embedConfig.hideDetails}
                  onChange={e => embedConfig.setHideDetails(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-xs">Ocultar</span>
              </div>
              {selectedTab === "floating" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Texto del botón:</label>
                    <Input
                      value={embedConfig.buttonText}
                      onChange={e => embedConfig.setButtonText(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Posición del botón:</label>
                    <select
                      value={embedConfig.buttonPosition}
                      onChange={e => embedConfig.setButtonPosition(e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
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
                      value={embedConfig.buttonColor}
                      onChange={e => embedConfig.setButtonColor(e.target.value)}
                      className="w-12 h-8 p-0 border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Color del texto del botón:</label>
                    <Input
                      type="color"
                      value={embedConfig.textColor}
                      onChange={e => embedConfig.setTextColor(e.target.value)}
                      className="w-12 h-8 p-0 border-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {selectedTab === "link" && (
            <div className="space-y-2">
              <div>
                <span>Enlace de reservación:</span>
                <code className="block bg-muted p-2 rounded break-all">{shareData.bookingUrl}</code>
              </div>
              <Button onClick={() => onCopyToClipboard(shareData.bookingUrl, "Link copiado!")} size="sm">Copiar</Button>
            </div>
          )}
          {selectedTab === "iframe" && (
            <div className="space-y-2">
              <div>
                <span>Iframe para embebido:</span>
                <code className="block bg-muted p-2 rounded whitespace-pre break-all">{generateCodes.iframe()}</code>
              </div>
              <Button onClick={() => onCopyToClipboard(generateCodes.iframe(), "Iframe copiado!")} size="sm">Copiar</Button>
            </div>
          )}
          {selectedTab === "floating" && (
            <div className="space-y-2">
              <div>
                <span>Botón flotante:</span>
                <code className="block bg-muted p-2 rounded whitespace-pre break-all">{generateCodes.floating()}</code>
              </div>
              <Button onClick={() => onCopyToClipboard(generateCodes.floating(), "Código copiado!")} size="sm">Copiar</Button>
            </div>
          )}
          {selectedTab === "react" && (
            <div className="space-y-2">
              <div>
                <span>React embed:</span>
                <code className="block bg-muted p-2 rounded whitespace-pre break-all">{generateCodes.react()}</code>
              </div>
              <Button onClick={() => onCopyToClipboard(generateCodes.react(), "Código copiado!")} size="sm">Copiar</Button>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cerrar</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}