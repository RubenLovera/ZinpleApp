"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Phone, MessageCircle, ChevronDown, Calculator, Send, Coins, Store, Globe, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import MaintenanceBanner from "@/components/MaintenanceBanner"

export default function LandingPage() {
  const { setQuote, setCurrentStep } = useFlow()
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("usdt")
  const [result, setResult] = useState(0)
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMaintenanceBanner, setShowMaintenanceBanner] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detectar mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Solo permitir números y punto decimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = Number.parseFloat(value)

      if (value === "") {
        setAmount(value)
      } else if (numValue >= 1 && numValue <= 1000) {
        setAmount(value)
      } else if (numValue < 1 && value !== "") {
        setAmount("1")
      } else if (numValue > 1000) {
        setAmount("1000")
      }
    }
  }

  // Cálculo en tiempo real
  useEffect(() => {
    const inputAmount = Number.parseFloat(amount) || 0
    if (inputAmount > 0) {
      if (currency === "usdt") {
        // USDT: monto - 9%
        setResult(inputAmount * 0.91)
      } else {
        // Bolívares: (monto - 8%) * 125
        setResult(inputAmount * 0.92 * 125)
      }
    } else {
      setResult(0)
    }
  }, [amount, currency])

  const handleStartOperation = () => {
    if (result === 0) return

    // Mostrar banner de mantenimiento en lugar de continuar
    setShowMaintenanceBanner(true)
  }

  // Soporte para ENTER
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleStartOperation()
    }
  }

  // Soporte global para ENTER
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && result > 0) {
        e.preventDefault()
        handleStartOperation()
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [result])

  const handleWhatsAppContact = () => {
    const message = `Hola! Vengo de la web de Zinple y quiero cambiar/cobrar con zelle y recibir USDT/BOLIVARES`
    const whatsappUrl = `https://wa.me/12138245415?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleBusinessWhatsAppContact = () => {
    const message = `Hola! Soy un negocio y quiero comenzar a cobrar con zelle a través de zinple`
    const whatsappUrl = `https://wa.me/12138245415?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const currencyOptions = [
    {
      value: "usdt",
      label: "USDT",
      icon: "₮",
      description: "Tether USD - Polygon",
      logo: "/tether-logo.png",
    },
    {
      value: "bolivares",
      label: "VES",
      icon: "Bs",
      description: "Bolivares - Pagomovil",
      logo: "/venezuela-flag.png",
    },
  ]

  const selectedCurrency = currencyOptions.find((option) => option.value === currency)

  const getTextSize = (value: number, currency: string) => {
    const formattedValue = value.toFixed(2)
    const digitCount = formattedValue.length

    if (digitCount <= 5) return "text-2xl md:text-3xl"
    if (digitCount <= 6) return "text-xl md:text-2xl"
    if (digitCount <= 7) return "text-lg md:text-xl"
    if (digitCount <= 8) return "text-base md:text-lg"
    if (digitCount <= 9) return "text-sm md:text-base"
    return "text-xs md:text-sm"
  }

  const countries = [
    { name: "Venezuela", flag: "🇻🇪" },
    { name: "México", flag: "🇲🇽" },
    { name: "Colombia", flag: "🇨🇴" },
    { name: "Perú", flag: "🇵🇪" },
    { name: "Estados Unidos", flag: "🇺🇸" },
    { name: "Chile", flag: "🇨🇱" },
    { name: "Argentina", flag: "🇦🇷" },
    { name: "Brasil", flag: "🇧🇷" },
  ]

  const handleSelectorClick = () => {
    if (isMobile) {
      setIsMobileModalOpen(true)
    } else {
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  const handleMobileCurrencySelect = (value: string) => {
    setCurrency(value)
    setIsMobileModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/zinple-logo.png" alt="Zinple" className="h-8" />
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#inicio" className="text-gray-600 hover:text-gray-900">
              Inicio
            </a>
            <a href="#pasos" className="text-gray-600 hover:text-gray-900">
              Cómo funciona
            </a>
            <a href="#negocios" className="text-gray-600 hover:text-gray-900">
              Negocios
            </a>
            <a href="#contacto" className="text-gray-600 hover:text-gray-900">
              Contacto
            </a>
          </nav>

          {/* Nuevos botones de autenticación - Visible en mobile y desktop */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentStep("login")}
              className="text-xs sm:text-sm px-2 sm:px-4 py-2"
            >
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => setCurrentStep("register")}
              className="text-white text-xs sm:text-sm px-2 sm:px-4 py-2"
              style={{ backgroundColor: "#5B38B5" }}
            >
              Registrarse
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section con Calculadora */}
      <section id="inicio" className="relative py-20 px-4 overflow-hidden" style={{ backgroundColor: "#5B38B5" }}>
        {/* Efectos visuales de fondo (mantengo los mismos del código anterior) */}
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Zelle a USDT o Bolivares en un instante</h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Cambia o Cobra con Zelle sin tener cuenta en Estados Unidos, recibe USDT Stablecoin o Bolivares
            </p>
          </div>

          {/* Calculadora Integrada */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* You Send */}
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Envías</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1.00"
                      value={amount}
                      onChange={handleAmountChange}
                      onKeyDown={handleKeyDown}
                      className="w-full text-2xl md:text-3xl font-bold p-6 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <span className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium">USD Zelle</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* You Receive */}
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recibes</label>
                  <div className="relative">
                    <div className="w-full min-h-[88px] border-2 border-gray-200 rounded-xl bg-gray-50 p-6 pr-24 flex items-center">
                      <span
                        className={`${getTextSize(result, currency)} font-bold transition-all duration-300 leading-none`}
                      >
                        {result.toFixed(2)}
                      </span>
                    </div>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="relative" ref={dropdownRef}>
                        <button
                          onClick={handleSelectorClick}
                          className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium border-none outline-none flex items-center gap-2 min-w-[80px] justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-xs">{selectedCurrency?.icon}</span>
                            <span>{selectedCurrency?.label}</span>
                          </div>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {!isMobile && isDropdownOpen && (
                          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999] min-w-[140px]">
                            {currencyOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setCurrency(option.value)
                                  setIsDropdownOpen(false)
                                }}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer ${
                                  currency === option.value ? "bg-purple-50 text-purple-700" : "text-gray-700"
                                } first:rounded-t-lg last:rounded-b-lg`}
                              >
                                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                  <img
                                    src={option.logo || "/placeholder.svg"}
                                    alt={option.label}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="flex-1 w-full lg:w-auto lg:min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                  <div className="relative">
                    <Button
                      onClick={handleStartOperation}
                      disabled={result === 0}
                      className="w-full text-white hover:opacity-90 disabled:opacity-50 text-lg font-bold p-6 border-2 border-gray-200 rounded-xl"
                      style={{ backgroundColor: "#25D366", height: "88px" }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Cambiar Ahora
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info adicional */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  <span className="font-semibold">Comisión incluida</span> — Cotización actual: 1 USD = 125 VES
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resto de las secciones (mantengo las mismas del código anterior) */}
      <section id="pasos" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#5B38B5" }}>
              Hazla Zinple y prueba ZinpleApp
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Tres pasos para cambiar y cobra con zelle sin tener una cuenta en Estados Unidos
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <Calculator className="w-12 h-12 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <CardTitle>1. Cotiza en nuestra web</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Usa nuestra calculadora y crea tu operación</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Send className="w-12 h-12 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <CardTitle>2. Envía los fondos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Envía los fondos a nuestras cuentas</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Coins className="w-12 h-12 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <CardTitle>3. Recibe al instante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Recibe USDT stablecoin o bolivares en pagomovil al instante</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sección de Países */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#5B38B5" }}>
              Disponible en Estos Países
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {countries.map((country) => (
              <div
                key={country.name}
                className="hover:opacity-90 transition-all duration-300 rounded-xl p-4 flex items-center gap-3 cursor-pointer group shadow-lg"
                style={{ backgroundColor: "#5B38B5" }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{country.flag}</span>
                <span className="text-white font-medium text-sm md:text-base">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business CTA Section */}
      <section id="negocios" className="py-20 px-4" style={{ backgroundColor: "#5B38B5" }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Cobra con Zelle en tu negocio</h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Con Zinple puedes cobrar con Zelle en tu negocio sin tener una cuenta en Estados Unidos, no más pedir
              cuentas prestadas.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-12">
            <Card className="text-center bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 shadow-xl">
              <CardHeader>
                <Smartphone className="w-16 h-16 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <CardTitle className="text-xl font-bold" style={{ color: "#5B38B5" }}>
                  Emprendedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg">No importa el tamaño de tu negocio, cobra con zelle ahora</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 shadow-xl">
              <CardHeader>
                <Store className="w-16 h-16 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <CardTitle className="text-xl font-bold" style={{ color: "#5B38B5" }}>
                  Comercios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg">Cobra con zelle en tu negocio y recibe tus ventas al instante</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 shadow-xl">
              <CardHeader>
                <Globe className="w-16 h-16 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <CardTitle className="text-xl font-bold" style={{ color: "#5B38B5" }}>
                  Negocios Digitales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg">
                  Si vendes en internet, cobra con zelle a clientes de todo el mundo
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleBusinessWhatsAppContact}
              className="text-white hover:opacity-90 text-lg px-8 py-4"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contactar por WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: "#5B38B5" }}>
              Contáctanos
            </h2>
            <p className="text-xl text-gray-600">Estamos aquí para ayudarte</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <Phone className="w-8 h-8 mx-auto mb-4" style={{ color: "#5B38B5" }} />
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-gray-600">+1 213 824 5415</p>
            </div>

            <div className="text-center">
              <svg
                className="w-8 h-8 mx-auto mb-4"
                style={{ color: "#5B38B5" }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <h3 className="font-semibold mb-2">Síguenos en X</h3>
              <a
                href="https://x.com/zinpleapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                @zinpleapp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/zinple-logo.png" alt="Zinple" className="h-6" />
          </div>
          <p className="text-gray-600">© 2024 ZinpleApp. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Modal de selección para mobile */}
      {isMobile && isMobileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm mx-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Selecciona la moneda</h3>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {currencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMobileCurrencySelect(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 cursor-pointer ${
                      currency === option.value
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={option.logo || "/placeholder.svg"}
                        alt={option.label}
                        className="w-8 h-8 object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    {currency === option.value && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Burbuja flotante de WhatsApp */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleWhatsAppContact}
          className="w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 text-white border-0"
          style={{ backgroundColor: "#25D366" }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>

        {/* Tooltip opcional */}
        <div className="absolute bottom-20 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          Contactar por WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>

      {/* Banner de mantenimiento */}
      {showMaintenanceBanner && <MaintenanceBanner onClose={() => setShowMaintenanceBanner(false)} />}
    </div>
  )
}
