import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
/* import { Button } from '../../../components/ui/button'; */
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { FadeIn } from '../../../components/animations/fade-in';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Validación de contraseña
  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    
    if (!doPasswordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Aquí iría la llamada a la API para cambiar la contraseña
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSuccess(true);
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
      setError('Ocurrió un error al restablecer tu contraseña. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay token en la URL, mostrar error
  if (!token && !isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
        <FadeIn className="w-full max-w-md">
          <Card className="shadow-lg border-pastel-blue/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Enlace inválido</CardTitle>
              <CardDescription className="text-center">
                El enlace para restablecer tu contraseña es inválido o ha expirado.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">Por favor, solicita un nuevo enlace de recuperación.</p>
              <Link 
                className="inline-block bg-pastel-blue hover:bg-pastel-blue/90 text-white px-4 py-2 rounded-md"
                to="/forgot-password"
              >
                Solicitar nuevo enlace
              </Link>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <FadeIn className="w-full max-w-md">
        <Card className="shadow-lg border-pastel-blue/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {isSuccess ? "¡Contraseña restablecida!" : "Crear nueva contraseña"}
            </CardTitle>
            <CardDescription>
              {isSuccess 
                ? "Tu contraseña ha sido actualizada exitosamente."
                : "Ingresa tu nueva contraseña para acceder a tu cuenta."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="rounded-full bg-pastel-mint w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>Ahora puedes iniciar sesión con tu nueva contraseña.</p>
                <Link 
                  className="inline-block w-full bg-pastel-blue hover:bg-pastel-blue/90 text-white px-4 py-2 rounded-md mt-4"
                  to="/login"
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className={`text-xs ${isPasswordValid ? 'text-pastel-mint' : 'text-muted-foreground'}`}>
                    La contraseña debe tener al menos 8 caracteres
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-pastel-blue hover:bg-pastel-blue/90 text-white px-4 py-2 rounded-md mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
