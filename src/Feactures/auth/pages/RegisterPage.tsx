// src/features/auth/pages/RegisterPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { FadeIn } from '../../../components/animations/fade-in';
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
