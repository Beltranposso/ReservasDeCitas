// src/features/auth/pages/RegisterSuccessPage.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { FadeIn } from '../../../components/animations/fade-in';
import { Check } from 'lucide-react';

export default function RegisterSuccessPage() {
  useEffect(() => {
    // Configurar redirección automática al dashboard después de unos segundos
    const timer = setTimeout(() => {
      window.location.href = '/dashboard';
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <FadeIn className="w-full max-w-md">
        <Card className="shadow-lg border-pastel-mint/40">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-pastel-mint flex items-center justify-center">
                <Check className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">¡Registro exitoso!</CardTitle>
            <CardDescription className="text-center">
              Tu cuenta ha sido creada correctamente y tu período de prueba ha iniciado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium mb-2">Próximos pasos:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="rounded-full p-1 bg-pastel-mint mt-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                  <span>Configurar tu perfil y preferencias</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full p-1 bg-pastel-mint mt-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                  <span>Crear tu primer tipo de evento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full p-1 bg-pastel-mint mt-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                  <span>Conectar tu calendario para sincronizar disponibilidad</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="rounded-full p-1 bg-pastel-mint mt-0.5">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </span>
                  <span>Invitar a miembros de tu equipo</span>
                </li>
              </ul>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Serás redirigido automáticamente al dashboard en unos segundos...
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link 
              className="w-full bg-pastel-mint hover:bg-pastel-mint/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
              to="/dashboard"
            >
              Ir al dashboard
            </Link>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}