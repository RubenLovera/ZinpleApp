"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Calculator, Send, Coins, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import MaintenanceBanner from "@/components/MaintenanceBanner"

export default function RegisterStep() {
  const { setQuote, setCurrentStep } = useFlow()
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("usdt")
  const [result, setResult] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showMaintenanceBanner, setShowMaintenanceBanner] = useState(false)

  const handleBack = () => {
    setCurrentStep("calculator")
  }

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "#5B38B5" }}>
                ¡Bienvenido a ZinpleApp!
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6">
                Haz tu primera cotización y comienza a cambiar Zelle por USDT o Bolívares
              </p>
            </div>
          </div>

          {/* Calculadora */}
          <Card className="mb-8 shadow-xl">
            <CardContent className="p-6 md:p-8">
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
                      <div className="relative">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

                        {isDropdownOpen && (
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
                      <Send className="w-5 h-5 mr-2" />
                      Registrarme
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

          {/* Beneficios del registro */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Calculator className="w-12 h-12 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <h3 className="font-semibold mb-2">Cotiza al Instante</h3>
                <p className="text-gray-600 text-sm">
                  Obtén cotizaciones en tiempo real y crea operaciones rápidamente
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Send className="w-12 h-12 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <h3 className="font-semibold mb-2">Proceso Rápido</h3>
                <p className="text-gray-600 text-sm">Completa tu primera operación en menos de 5 minutos</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Coins className="w-12 h-12 mx-auto mb-4" style={{ color: "#5B38B5" }} />
                <h3 className="font-semibold mb-2">Recibe al Instante</h3>
                <p className="text-gray-600 text-sm">Tus USDT o Bolívares llegan en segundos después del pago</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Banner de mantenimiento */}
      {showMaintenanceBanner && <MaintenanceBanner onClose={() => setShowMaintenanceBanner(false)} />}
    </div>
  )
}
