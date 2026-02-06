"use client"

import { useState } from "react"
import {
  Phone,
  MessageCircle,
  Send,
  Download,
  Wallet,
  RefreshCw,
  Store,
  Globe,
  Smartphone,
  Users,
  Briefcase,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import MultiCurrencyCalculator from "@/components/MultiCurrencyCalculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LandingPage() {
  const { setCurrentStep } = useFlow()

  const handleWhatsAppContact = () => {
    const message = `Hola! Vengo de la web de Zinple y necesito ayuda con una operación`
    const whatsappUrl = `https://wa.me/56956413113?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleBusinessWhatsAppContact = () => {
    const message = `Hola! Soy un negocio y quiero comenzar a usar Zinple para cobrar y pagar internacionalmente`
    const whatsappUrl = `https://wa.me/56956413113?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const countries = [
    { name: "Chile", flag: "🇨🇱", currency: "CLP" },
    { name: "México", flag: "🇲🇽", currency: "MXN" },
    { name: "Perú", flag: "🇵🇪", currency: "PEN" },
    { name: "Brasil", flag: "🇧🇷", currency: "BRL" },
    { name: "Colombia", flag: "🇨🇴", currency: "COP" },
    { name: "Europa", flag: "🇪🇺", currency: "EUR" },
    { name: "Estados Unidos", flag: "🇺🇸", currency: "USD" },
    { name: "Venezuela", flag: "🇻🇪", currency: "VES" },
  ]

  const useCases = [
    {
      icon: <Send className="w-8 h-8" />,
      title: "Enviar a Venezuela",
      description: "Envía dinero a tus familiares desde cualquier país de Latinoamérica, Estados Unidos o Europa.",
      cta: "Enviar ahora",
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: "Recibir en Venezuela",
      description: "Crea un link de pago y compártelo para recibir dinero del exterior directamente.",
      cta: "Crear link",
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Comprar USDT",
      description: "Convierte tu dinero fiat a criptomonedas USDT de forma segura y rápida.",
      cta: "Comprar crypto",
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Vender USDT",
      description: "Cambia tus USDT a bolívares y recibe por Pago Móvil al instante.",
      cta: "Vender crypto",
    },
  ]

  const howItWorksSteps = {
    send: [
      { step: 1, title: "Cotiza tu envío", description: "Ingresa el monto y selecciona el país de origen" },
      { step: 2, title: "Ingresa los datos", description: "Datos del beneficiario en Venezuela" },
      { step: 3, title: "Realiza el pago", description: "Transfiere a nuestra cuenta local en tu país" },
      { step: 4, title: "Entrega inmediata", description: "Tu beneficiario recibe por Pago Móvil" },
    ],
    receive: [
      { step: 1, title: "Crea tu link", description: "Genera un link de pago personalizado" },
      { step: 2, title: "Comparte el link", description: "Envíalo a quien te va a pagar" },
      { step: 3, title: "El remitente paga", description: "Desde su país de origen" },
      { step: 4, title: "Recibe al instante", description: "En tu Pago Móvil automáticamente" },
    ],
    crypto: [
      { step: 1, title: "Selecciona operación", description: "Comprar o vender USDT" },
      { step: 2, title: "Ingresa el monto", description: "Verifica la tasa de cambio" },
      { step: 3, title: "Realiza el pago", description: "Transferencia o crypto según el caso" },
      { step: 4, title: "Recibe tus fondos", description: "USDT o bolívares en minutos" },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/zinple-logo.png" alt="Zinple" className="h-8" />
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#inicio" className="text-muted-foreground hover:text-foreground transition-colors">
              Inicio
            </a>
            <a href="#que-puedes-hacer" className="text-muted-foreground hover:text-foreground transition-colors">
              Servicios
            </a>
            <a href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
              Cómo funciona
            </a>
            <a href="#negocios" className="text-muted-foreground hover:text-foreground transition-colors">
              Negocios
            </a>
            <a href="#contacto" className="text-muted-foreground hover:text-foreground transition-colors">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("login")}
              className="text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => setCurrentStep("register")}
              className="bg-primary text-primary-foreground text-xs sm:text-sm px-3 sm:px-4 py-2 hover:bg-primary/90"
            >
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section con Nueva Calculadora */}
      <section id="inicio" className="relative py-16 md:py-24 px-4 overflow-hidden bg-primary">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 text-balance">
              Envía, recibe o cambia.
              <br />
              <span className="text-white/80">Desde o hacia Venezuela.</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto text-pretty">
              La forma más simple de enviar remesas, recibir pagos del exterior o cambiar criptomonedas. 
              9 países, múltiples monedas, una sola plataforma.
            </p>
          </div>

          {/* Nueva Calculadora Multi-Par */}
          <MultiCurrencyCalculator />
        </div>
      </section>

      {/* Sección: Qué puedes hacer */}
      <section id="que-puedes-hacer" className="py-16 md:py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Qué puedes hacer con Zinple?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma, múltiples soluciones. Elige cómo quieres mover tu dinero.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border"
              >
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {useCase.icon}
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">{useCase.description}</p>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors bg-transparent">
                    {useCase.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Cómo Funciona con Tabs */}
      <section id="como-funciona" className="py-16 md:py-24 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Procesos simples y transparentes para cada tipo de operación
            </p>
          </div>

          <Tabs defaultValue="send" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="send" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </TabsTrigger>
              <TabsTrigger value="receive" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Recibir</span>
              </TabsTrigger>
              <TabsTrigger value="crypto" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">Crypto</span>
              </TabsTrigger>
            </TabsList>

            {Object.entries(howItWorksSteps).map(([key, steps]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="grid gap-4 md:grid-cols-4">
                  {steps.map((step, index) => (
                    <div key={index} className="relative">
                      <Card className="h-full bg-background">
                        <CardContent className="pt-6">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mb-4">
                            {step.step}
                          </div>
                          <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </CardContent>
                      </Card>
                      {index < steps.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Sección: Países Disponibles */}
      <section className="py-16 md:py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Disponible en estos países
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Conectamos a Venezuela con el mundo. Más países próximamente.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {countries.map((country) => (
              <div
                key={country.name}
                className="bg-primary hover:bg-primary/90 transition-all duration-300 rounded-xl p-4 flex items-center gap-3 cursor-pointer group shadow-lg"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {country.flag}
                </span>
                <div>
                  <span className="text-primary-foreground font-medium text-sm md:text-base block">
                    {country.name}
                  </span>
                  <span className="text-primary-foreground/70 text-xs">{country.currency}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Trust Signals */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">100% Seguro</h3>
                <p className="text-sm text-muted-foreground">Transacciones protegidas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Entrega Rápida</h3>
                <p className="text-sm text-muted-foreground">Minutos, no días</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Sin comisiones ocultas</h3>
                <p className="text-sm text-muted-foreground">Tasas transparentes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Negocios */}
      <section id="negocios" className="py-16 md:py-24 px-4 bg-primary">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Soluciones para negocios
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Cobra y paga internacionalmente sin complicaciones. 
              Ideal para emprendedores, comercios y negocios digitales.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto mb-12">
            <Card className="bg-background/95 backdrop-blur-sm hover:bg-background transition-all duration-300 hover:scale-105 shadow-xl">
              <CardHeader className="text-center">
                <Smartphone className="w-14 h-14 mx-auto mb-4 text-primary" />
                <CardTitle className="text-lg font-semibold text-foreground">Emprendedores</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Recibe pagos internacionales sin importar el tamaño de tu negocio
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/95 backdrop-blur-sm hover:bg-background transition-all duration-300 hover:scale-105 shadow-xl">
              <CardHeader className="text-center">
                <Store className="w-14 h-14 mx-auto mb-4 text-primary" />
                <CardTitle className="text-lg font-semibold text-foreground">Comercios</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Acepta pagos del exterior y recibe en bolívares al instante
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/95 backdrop-blur-sm hover:bg-background transition-all duration-300 hover:scale-105 shadow-xl">
              <CardHeader className="text-center">
                <Globe className="w-14 h-14 mx-auto mb-4 text-primary" />
                <CardTitle className="text-lg font-semibold text-foreground">Freelancers</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Cobra a clientes internacionales y recibe como prefieras
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleBusinessWhatsAppContact}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white text-lg px-8 py-6"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contactar para negocios
            </Button>
          </div>
        </div>
      </section>

      {/* Sección: Contacto */}
      <section id="contacto" className="py-16 md:py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Contáctanos</h2>
            <p className="text-lg text-muted-foreground">Estamos aquí para ayudarte</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-muted/50">
              <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
              <p className="text-muted-foreground">+56 9 5641 3113</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-muted/50">
              <svg
                className="w-8 h-8 mx-auto mb-4 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <h3 className="font-semibold text-foreground mb-2">Síguenos en X</h3>
              <a
                href="https://x.com/zinpleapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                @zinpleapp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-background">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/zinple-logo.png" alt="Zinple" className="h-6" />
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} ZinpleApp. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* Burbuja flotante de WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleWhatsAppContact}
          className="w-14 h-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-[#25D366] hover:bg-[#20BD5A] text-white"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}
