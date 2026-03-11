"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ChevronDown, MessageCircle, CheckCircle, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import MaintenanceBanner from "@/components/MaintenanceBanner"
import { supabase } from "@/lib/supabase"

export default function LoginStep() {
  const { setQuote, setCurrentStep, setFlowType, resetFlow } = useFlow()
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("usdt")
  const [result, setResult] = useState(0)
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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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

  const handleStartOperation = async () => {
    if (result === 0) return

    // Verificar si el usuario ha visto la pantalla de bienvenida
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Obtener datos del usuario para verificar has_seen_welcome
        const { data: userData, error } = await supabase
          .from('users')
          .select('has_seen_welcome')
          .eq('id', authUser.id)
          .single()
        
        if (error) {
          console.error('Error fetching user:', error)
          setShowMaintenanceBanner(true)
          return
        }

        // Si el usuario no ha visto la bienvenida, mostrarla primero
        if (userData && !userData.has_seen_welcome) {
          setCurrentStep('welcome')
        } else {
          // Si ya la vio, ir directamente a la calculadora
          setCurrentStep('calculator')
        }
      } else {
        // No hay usuario autenticado, mostrar mantenimiento
        setShowMaintenanceBanner(true)
      }
    } catch (err) {
      console.error('Error in login:', err)
      setShowMaintenanceBanner(true)
    }
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

  const handleBack = () => {
    resetFlow()
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
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#5B38B5" }}>
                ¡Bienvenido de vuelta!
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                Inicia sesión y continúa cambiando con Zelle de forma rápida y segura
              </p>
            </div>
          </div>

          {/* Calculadora */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center text-xl" style={{ color: "#5B38B5" }}>
                Cotiza tu próxima operación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                      style={{ backgroundColor: "#5B38B5", height: "88px" }}
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Iniciar Sesión
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
            </CardContent>
          </Card>

          {/* Beneficios para usuarios existentes */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <CardTitle className="text-lg">Datos Guardados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tus datos están seguros y listos para usar</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <CardTitle className="text-lg">Proceso Rápido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Operaciones más rápidas con tu historial</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <CardTitle className="text-lg">Cuenta Verificada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tu cuenta ya está verificada y lista</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA para nuevos usuarios */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#5B38B5" }}>
                ¿No tienes cuenta aún?
              </h3>
              <p className="text-gray-600 mb-4">Regístrate y comienza a cambiar con Zelle hoy mismo</p>
              <Button
                onClick={() => setCurrentStep("register")}
                variant="outline"
                className="border-purple-500 text-purple-700 hover:bg-purple-50"
              >
                Crear Cuenta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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

      {/* Banner de mantenimiento */}
      {showMaintenanceBanner && <MaintenanceBanner onClose={() => setShowMaintenanceBanner(false)} />}
    </div>
  )
}
