import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';

import { FadeIn } from '../../../components/animations/fade-in';

import { Check, ChevronLeft, X } from 'lucide-react';

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
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Free',
      price: billingPeriod === 'monthly' ? 0 : 0,
      description: 'Ideal para profesionales independientes',
      color: 'bg-blue-500',
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
      price: billingPeriod === 'monthly' ? 99900 : 999000,
      description: 'Para equipos pequeños y startups',
      color: 'bg-purple-500',
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
      price: billingPeriod === 'monthly' ? 199900 : 1999000,
      description: 'Para empresas en crecimiento',
      color: 'bg-teal-500',
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
      price: billingPeriod === 'monthly' ? 399900 : 3999000,
      description: 'Solución adaptada para grandes empresas',
      color: 'bg-red-500',
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
          <Link to="/" className="inline-flex items-center text-blue-500 hover:underline mb-8">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver al inicio
          </Link>
          
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">Elige el plan perfecto para tu negocio</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todos los planes incluyen un período de prueba de 14 días. Sin compromisos, puedes cancelar en cualquier momento.
            </p>
          </div>

          {/* Selector de período de facturación */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full border border-gray-300 p-1 bg-black">
              <button 
                className={`px-4 py-1 rounded-full text-sm ${billingPeriod === 'monthly' ? 'bg-black text-white' : 'bg-transparent text-white'}`}
                onClick={() => setBillingPeriod('monthly')}
              >
                Mensual
              </button>
              <button 
                className={`px-4 py-1 rounded-full text-sm flex items-center ${billingPeriod === 'annual' ? 'bg-black text-white' : 'bg-transparent text-white'}`}
                onClick={() => setBillingPeriod('annual')}
              >
                Anual
                <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">-17%</span>
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-4 md gap-6  ">
          {plans.map((plan, index) => (
            <div key={plan.id} className={`rounded-lg border overflow-hidden flex flex-col justify-between ${plan.popular ? 'border-purple-400 shadow-md ' : 'border-gray-200'}`}>
              <div className="p-6 bg-white">
                {plan.popular && (
                  <div className="bg-purple-500 text-white text-sm font-medium px-3 py-1 rounded-full w-fit mb-2">
                    Más popular
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground ml-1">/ {billingPeriod === 'monthly' ? 'mes' : 'año'}</span>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      {feature.included ? (
                        <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center mr-2 
                          ${plan.id === 'starter' ? 'bg-blue-500' : 
                            plan.id === 'professional' ? 'bg-purple-500' : 
                            plan.id === 'business' ? 'bg-teal-500' : 
                            'bg-red-500'}`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          <X className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <span className={`text-sm ${!feature.included && 'text-muted-foreground line-through'}`}>
                        {feature.feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6">
                <Button 
                  className={`w-full ${
                    plan.id === 'starter' ? 'bg-blue-500 hover:bg-blue-600' : 
                    plan.id === 'professional' ? 'bg-purple-500 hover:bg-purple-600' : 
                    plan.id === 'business' ? 'bg-teal-500 hover:bg-teal-600' :
                    'bg-red-500 hover:bg-red-600'
                  } text-white`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  Seleccionar plan
                </Button>
              </div>
            </div>
          ))}
        </div>

        <FadeIn delay={0.5} className="text-center">
          <div className="p-6 rounded-lg bg-gray-50 border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">¿Necesitas algo diferente?</h3>
            <p className="mb-4 text-gray-600">Contáctanos para una solución personalizada que se adapte a tus necesidades específicas.</p>
            <Button variant="outline" className="bg-white">Contactar ventas</Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}