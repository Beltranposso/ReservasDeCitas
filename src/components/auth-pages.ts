// src/features/auth/pages/LoginPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animations/fade-in';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulación de inicio de sesión
    try {
      // Aquí iría la llamada a la API de autenticación
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Redirección al dashboard en caso de éxito
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
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

// src/features/auth/pages/PlansPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/fade-in';
import { StaggerContainer } from '@/components/animations/stagger-container';
import { AnimatedCard } from '@/components/animations/animated-card';
import { Check, ChevronLeft } from 'lucide-react';

interface PlanFeature {
  feature: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  color: string;
}

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 49900,
      description: 'Ideal para profesionales independientes',
      color: 'bg-pastel-blue',
      features: [
        { feature: '1 usuario', included: true },
        { feature: 'Hasta 5 tipos de eventos', included: true },
        { feature: 'Integración con Google Calendar', included: true },
        { feature: 'Página de reserva personalizable', included: true },
        { feature: 'Recordatorios por email', included: true },
        { feature: 'Soporte por email', included: true },
        { feature: 'Integraciones avanzadas', included: false },
        { feature: 'Múltiples usuarios', included: false },
      ],
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99900,
      description: 'Para equipos pequeños y startups',
      color: 'bg-pastel-pink',
      popular: true,
      features: [
        { feature: 'Hasta 5 usuarios', included: true },
        { feature: 'Eventos ilimitados', included: true },
        { feature: 'Integración con todos los calendarios', included: true },
        { feature: 'Página de reserva personalizable', included: true },
        { feature: 'Recordatorios personalizados', included: true },
        { feature: 'Soporte prioritario', included: true },
        { feature: 'Integraciones avanzadas', included: true },
        { feature: 'Análisis de uso', included: false },
      ],
    },
    {
      id: 'business',
      name: 'Business',
      price: 199900,
      description: 'Para empresas en crecimiento',
      color: 'bg-pastel-mint',
      features: [
        { feature: 'Hasta 15 usuarios', included: true },
        { feature: 'Eventos ilimitados', included: true },
        { feature: 'Integraciones completas', included: true },
        { feature: 'Marca personalizada', included: true },
        { feature: 'Recordatorios personalizados', included: true },
        { feature: 'Soporte 24/7', included: true },
        { feature: 'Análisis avanzados', included: true },
        { feature: 'API personalizada', included: true },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 399900,
      description: 'Solución adaptada para grandes empresas',
      color: 'bg-pastel-lavender',
      features: [
        { feature: 'Usuarios ilimitados', included: true },
        { feature: 'Eventos ilimitados', included: true },
        { feature: 'Todas las integraciones', included: true },
        { feature: 'Marca completamente personalizada', included: true },
        { feature: 'Recordatorios multi-canal', included: true },
        { feature: 'Soporte premium 24/7', included: true },
        { feature: 'Análisis avanzados y reportes', included: true },
        { feature: 'API personalizada & SSO', included: true },
      ],
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // En una implementación real, aquí podrías guardar la selección en un estado global o contexto
    // para luego usarla en el proceso de registro
    
    // Redirección a registro con el plan seleccionado
    window.location.href = `/register?plan=${planId}`;
  };

  // Función para formatear precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto max-w-6xl py-12">
        <FadeIn>
          <Link to="/" className="inline-flex items-center text-pastel-blue hover:underline mb-8">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al inicio
          </Link>
          
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Elige el plan perfecto para tu negocio</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Todos los planes incluyen un período de prueba de 14 días. Sin compromisos, puedes cancelar en cualquier momento.
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan, index) => (
            <AnimatedCard key={plan.id} index={index}>
              <Card className={`h-full flex flex-col border-2 ${plan.popular ? 'border-pastel-pink' : 'border-border'}`}>
                <CardHeader>
                  {plan.popular && (
                    <Badge className="w-fit mb-2 bg-pastel-pink text-primary-foreground">
                      Más popular
                    </Badge>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                    <span className="text-muted-foreground ml-1">/ mes</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className={`mr-2 mt-1 rounded-full p-1 ${feature.included ? plan.color : 'bg-muted'}`}>
                          {feature.included ? (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          ) : (
                            <div className="h-3 w-3" />
                          )}
                        </span>
                        <span className={`${!feature.included && 'text-muted-foreground line-through'}`}>
                          {feature.feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${plan.color} hover:${plan.color}/90 text-primary-foreground`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    Seleccionar plan
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedCard>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.5} className="text-center">
          <div className="p-6 rounded-lg bg-muted/50 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">¿Necesitas algo diferente?</h3>
            <p className="mb-4">Contáctanos para una solución personalizada que se adapte a tus necesidades específicas.</p>
            <Button variant="outline">Contactar ventas</Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

// src/features/auth/pages/RegisterPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FadeIn } from '@/components/animations/fade-in';
import { Eye, EyeOff, Lock, Mail, User, Building, CreditCard, ChevronLeft } from 'lucide-react';

const planDetails = {
  'starter': { name: 'Starter', price: 49900 },
  'professional': { name: 'Professional', price: 99900 },
  'business': { name: 'Business', price: 199900 },
  'enterprise': { name: 'Enterprise', price: 399900 },
};

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'starter';
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Datos de cuenta
    email: '',
    password: '',
    // Datos personales
    firstName: '',
    lastName: '',
    companyName: '',
    companySize: '',
    // Datos de pago
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Formateo especial para números de tarjeta
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19);
      
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    
    // Formateo para fecha de expiración
    if (name === 'cardExpiry') {
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
      
      setFormData({ ...formData, [name]: formattedValue });
      return;
    }
    
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    // Validación básica antes de avanzar
    if (activeTab === 'account') {
      if (formData.email && formData.password.length >= 8) {
        setActiveTab('personal');
      }
    } else if (activeTab === 'personal') {
      if (formData.firstName && formData.lastName && formData.companyName) {
        setActiveTab('payment');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Aquí iría la integración con la pasarela de pagos (Bolt)
      // y el registro del usuario en la base de datos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirección a una página de confirmación o dashboard
      window.location.href = '/register/success';
    } catch (error) {
      console.error('Error durante el registro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear el precio en pesos colombianos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/30">
      <FadeIn className="w-full max-w-3xl">
        <Link to="/plans" className="inline-flex items-center text-pastel-blue hover:underline mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a planes
        </Link>
        
        <Card className="shadow-lg border-pastel-blue/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Crear tu cuenta</CardTitle>
            <CardDescription className="text-center flex flex-col items-center gap-2">
              <span>Completa tus datos para iniciar tu prueba de 14 días</span>
              <div className="bg-muted/50 px-4 py-2 rounded-full text-sm">
                Plan seleccionado: <span className="font-semibold">{planDetails[planId as keyof typeof planDetails]?.name}</span> - 
                <span className="font-semibold"> {formatPrice(planDetails[planId as keyof typeof planDetails]?.price)} /mes</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="account">Cuenta</TabsTrigger>
                <TabsTrigger value="personal">Información</TabsTrigger>
                <TabsTrigger value="payment">Pago</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                <TabsContent value="account" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nombre@empresa.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10"
                        required
                        minLength={8}
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
                    <p className="text-xs text-muted-foreground">
                      La contraseña debe tener al menos 8 caracteres
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    className="w-full mt-6 bg-pastel-pink hover:bg-pastel-pink/90"
                    onClick={handleNext}
                  >
                    Continuar
                  </Button>
                </TabsContent>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la empresa</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Tamaño de la empresa</Label>
                    <Select 
                      value={formData.companySize} 
                      onValueChange={(value) => handleSelectChange('companySize', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 empleados</SelectItem>
                        <SelectItem value="11-50">11-50 empleados</SelectItem>
                        <SelectItem value="51-200">51-200 empleados</SelectItem>
                        <SelectItem value="201-500">201-500 empleados</SelectItem>
                        <SelectItem value="501+">Más de 500 empleados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    className="w-full mt-6 bg-pastel-pink hover:bg-pastel-pink/90"
                    onClick={handleNext}
                  >
                    Continuar
                  </Button>
                </TabsContent>
                
                <TabsContent value="payment" className="space-y-4">
                  <div className="rounded-lg border p-4 bg-muted/30 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-semibold">{planDetails[planId as keyof typeof planDetails]?.name}</h3>
                        <p className="text-sm text-muted-foreground">Facturación mensual</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(planDetails[planId as keyof typeof planDetails]?.price)}</p>
                        <p className="text-xs text-muted-foreground">14 días de prueba gratis</p>
                      </div>
                    </div>
                    <div className="text-sm border-t pt-3">
                      <p className="text-muted-foreground">No se te cobrará hasta que finalice tu período de prueba. Puedes cancelar en cualquier momento.</p>
                    </div>
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número de tarjeta</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="pl-10"
                        maxLength={19}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Fecha de expiración</Label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvc">Código de seguridad</Label>
                      <Input
                        id="cardCvc"
                        name="cardCvc"
                        type="password"
                        placeholder="CVC"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-pastel-pink hover:bg-pastel-pink/90" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Procesando..." : "Completar registro"}
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <img src="/bolt-logo.svg" alt="Bolt" className="h-6" />
                      <span className="text-sm text-muted-foreground">Procesado de forma segura por Bolt</span>
                    </div>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-center text-muted-foreground">
              Al registrarte, aceptas nuestros{" "}
              <Link to="/terms" className="text-pastel-blue hover:underline">
                Términos de servicio
              </Link>{" "}
              y{" "}
              <Link to="/privacy" className="text-pastel-blue hover:underline">
                Política de privacidad
              </Link>
            </p>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}

// src/features/auth/pages/RegisterSuccessPage.tsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/animations/fade-in';
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
            <Button 
              className="w-full bg-pastel-mint hover:bg-pastel-mint/90"
              as={Link}
              to="/dashboard"
            >
              Ir al dashboard
            </Button>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}

// src/features/auth/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animations/fade-in';
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

// src/features/auth/pages/ResetPasswordPage.tsx
import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animations/fade-in';
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
              <Button 
                className="bg-pastel-blue hover:bg-pastel-blue/90"
                as={Link}
                to="/forgot-password"
              >
                Solicitar nuevo enlace
              </Button>
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
                <Button 
                  className="w-full bg-pastel-blue hover:bg-pastel-blue/90 mt-4"
                  as={Link}
                  to="/login"
                >
                  Ir al inicio de sesión
                </Button>
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
                <Button 
                  type="submit" 
                  className="w-full bg-pastel-blue hover:bg-pastel-blue/90 mt-4" 
                  disabled={isLoading}
                >
                  {isLoading ? "Restableciendo..." : "Restablecer contraseña"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

// src/features/auth/components/UserRoleSelection.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animations/fade-in';

interface UserRoleSelectionProps {
  onChange: (role: string) => void;
  value: string;
  disabled?: boolean;
}

export function UserRoleSelection({ onChange, value, disabled = false }: UserRoleSelectionProps) {
  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo a todas las funciones y configuraciones',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'manager',
      name: 'Gerente',
      description: 'Puede gestionar eventos, contactos y ver reportes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'member',
      name: 'Miembro',
      description: 'Puede gestionar su propio calendario y eventos',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'guest',
      name: 'Invitado',
      description: 'Acceso limitado solo para ver eventos asignados',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
  ];

  return (
    <FadeIn>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        disabled={disabled}
      >
        {roles.map((role) => (
          <div key={role.id}>
            <RadioGroupItem
              value={role.id}
              id={role.id}
              className="peer sr-only"
              disabled={disabled}
            />
            <Label
              htmlFor={role.id}
              className="flex flex-col p-4 border-2 rounded-md cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-pastel-blue peer-data-[state=checked]:bg-pastel-blue/10 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="text-pastel-blue mt-0.5">{role.icon}</div>
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FadeIn>
  );
}

// src/features/auth/components/InviteUserForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserRoleSelection } from './UserRoleSelection';
import { FadeIn } from '@/components/animations/fade-in';
import { Mail, Plus, X } from 'lucide-react';

export function InviteUserForm() {
  const [invites, setInvites] = useState([{ email: '', role: 'member' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddInvite = () => {
    setInvites([...invites, { email: '', role: 'member' }]);
  };

  const handleRemoveInvite = (index: number) => {
    const newInvites = [...invites];
    newInvites.splice(index, 1);
    setInvites(newInvites);
  };

  const handleEmailChange = (index: number, email: string) => {
    const newInvites = [...invites];
    newInvites[index].email = email;
    setInvites(newInvites);
  };

  const handleRoleChange = (index: number, role: string) => {
    const newInvites = [...invites];
    newInvites[index].role = role;
    setInvites(newInvites);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Aquí iría la llamada a la API para enviar invitaciones
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Resetear formulario o mostrar éxito
      setInvites([{ email: '', role: 'member' }]);
    } catch (error) {
      console.error('Error al enviar invitaciones:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FadeIn>
      <form onSubmit={handleSubmit} className="space-y-6">
        {invites.map((invite, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-md relative">
            {invites.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleRemoveInvite(index)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Eliminar invitación</span>
              </Button>
            )}
            
            <div className="space-y-2">
              <Label htmlFor={`email-${index}`}>Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id={`email-${index}`}
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={invite.email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Rol del usuario</Label>
              <UserRoleSelection
                value={invite.role}
                onChange={(role) => handleRoleChange(index, role)}
              />
            </div>
          </div>
        ))}
        
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={handleAddInvite}
          >
            <Plus className="h-4 w-4" />
            Agregar invitación
          </Button>
          
          <Button 
            type="submit" 
            className="flex-1 bg-pastel-blue hover:bg-pastel-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando invitaciones..." : "Enviar invitaciones"}
          </Button>
        </div>
      </form>
    </FadeIn>
  );
}

// src/features/auth/components/RoleManager.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animations/fade-in';
import { MoreHorizontal, ShieldAlert, Shield, CalendarDays, Eye } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member' | 'guest';
  status: 'active' | 'pending' | 'inactive';
  lastActive?: string;
}

export function RoleManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de usuarios
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Aquí iría la llamada a la API para obtener usuarios
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos de ejemplo
        setUsers([
          {
            id: '1',
            name: 'Alejandra Rodríguez',
            email: 'alejandra@empresa.com',
            role: 'admin',
            status: 'active',
            lastActive: 'Hace 2 horas',
          },
          {
            id: '2',
            name: 'Carlos Mendoza',
            email: 'carlos@empresa.com',
            role: 'manager',
            status: 'active',
            lastActive: 'Hace 1 día',
          },
          {
            id: '3',
            name: 'Luisa Fernández',
            email: 'luisa@empresa.com',
            role: 'member',
            status: 'active',
            lastActive: 'Hace 3 días',
          },
          {
            id: '4',
            name: 'Martín Gómez',
            email: 'martin@gmail.com',
            role: 'member',
            status: 'pending',
            lastActive: 'Nunca',
          },
          {
            id: '5',
            name: 'Ana Sánchez',
            email: 'ana@empresa.com',
            role: 'guest',
            status: 'inactive',
            lastActive: 'Hace 2 semanas',
          },