import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { FadeIn } from '../../../components/animations/fade-in';
import { ChevronLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Aquí iría la llamada a la API para enviar el correo de recuperación
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <FadeIn className="w-full max-w-md">
        <Card className="shadow-lg border-pastel-blue/20">
          <CardHeader className="space-y-1">
            <Link to="/login" className="inline-flex items-center text-pastel-blue hover:underline mb-4">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Volver al inicio de sesión
            </Link>
            <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
            <CardDescription>
              {isSubmitted 
                ? "Te hemos enviado un correo con instrucciones para recuperar tu contraseña."
                : "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-pastel-blue/10 p-4 text-sm">
                  <p className="font-medium mb-2">Revisa tu bandeja de entrada</p>
                  <p>Hemos enviado un correo a <span className="font-medium">{email}</span> con instrucciones para restablecer tu contraseña.</p>
                  <p className="mt-2">Si no lo encuentras, revisa tu carpeta de spam o correo no deseado.</p>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-4">
                  <p>¿No recibiste el correo?</p>
                  <Button 
                    variant="link" 
                    className="text-pastel-blue p-0 h-auto"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Intentar nuevamente
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-pastel-blue hover:bg-pastel-blue/90" 
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar correo de recuperación"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-center text-muted-foreground">
              ¿Recuerdas tu contraseña?{" "}
              <Link to="/login" className="text-pastel-blue hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}