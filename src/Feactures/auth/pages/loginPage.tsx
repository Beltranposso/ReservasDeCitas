
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { FadeIn } from "../../../components/animations/fade-in"
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import apiClient, { API_ROUTES, setAuthToken } from '../../../services/apiclient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Llamada a la API de autenticación
      const response = await apiClient.post(API_ROUTES.login, { email, password });
      
      // Guardar el token en localStorage o en el estado global
      if (response.token) {
        setAuthToken(response.token);
        localStorage.setItem('authToken', response.token);
        
        // Redirección al dashboard en caso de éxito
        navigate('/dashboard');
      } else {
        setError('Respuesta de autenticación inválida');
      }
    } catch (error: any) {
      console.error('Error durante el inicio de sesión:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <FadeIn className="w-full max-w-md">
        <Card className="shadow-lg border-pastel-blue/20">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-full bg-pastel-blue flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link to="/forgot-password" className="text-sm text-pastel-blue hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
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
              </div>
              <Button 
                type="submit" 
                className="w-full bg-pastel-pink hover:bg-pastel-pink/90" 
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="hover:bg-pastel-blue/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="hover:bg-pastel-blue/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                  <path fill="#0078d4" d="M23.499 12.27c0-1.213-.094-2.17-.36-3.133h-10.14v5.714h5.999c-.114 1.477-1.343 3.694-5.999 3.694-3.604 0-6.541-2.98-6.541-6.673s2.937-6.673 6.541-6.673c2.028 0 3.383.862 4.152 1.606l2.8-2.686C18.092 2.273 15.383 1 12.003 1 6.579 1 2 5.58 2 11.001c0 5.423 4.579 10.001 10.003 10.001 5.769 0 9.996-4.056 9.996-9.76 0-.382-.042-.751-.1-1.082l-9.897-.89z" />
                </svg>
                Microsoft
              </Button>
            </div>
            <p className="mt-4 text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link to="/plans" className="text-pastel-blue hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}