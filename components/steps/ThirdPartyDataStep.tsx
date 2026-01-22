"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Users, User, Phone, Mail, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFlow } from "@/contexts/FlowContext"
import type { ThirdPartyData } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Datos de países con códigos telefónicos
const countries = [
  { code: "+1", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "+1", name: "Canadá", flag: "🇨🇦" },
  { code: "+52", name: "México", flag: "🇲🇽" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+58", name: "Venezuela", flag: "🇻🇪" },
  { code: "+51", name: "Perú", flag: "🇵🇪" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+55", name: "Brasil", flag: "🇧🇷" },
  { code: "+593", name: "Ecuador", flag: "🇪🇨" },
  { code: "+595", name: "Paraguay", flag: "🇵🇾" },
  { code: "+598", name: "Uruguay", flag: "🇺🇾" },
  { code: "+591", name: "Bolivia", flag: "🇧🇴" },
  { code: "+34", name: "España", flag: "🇪🇸" },
  { code: "+39", name: "Italia", flag: "🇮🇹" },
  { code: "+33", name: "Francia", flag: "🇫🇷" },
  { code: "+49", name: "Alemania", flag: "🇩🇪" },
  { code: "+44", name: "Reino Unido", flag: "🇬🇧" },
]

export default function ThirdPartyDataStep() {
  const { quote, thirdParty, setThirdParty, setCurrentStep, isUserExisting } = useFlow()
  const [formData, setFormData] = useState<ThirdPartyData>(
    thirdParty || {
      name: "",
      phone: "",
      email: "",
    },
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [countryCode, setCountryCode] = useState("+58") // Venezuela por defecto
  const [phoneNumber, setPhoneNumber] = useState("")

  // Inicializar valores de teléfono si ya existe
  useEffect(() => {
    if (formData.phone) {
      // Intentar separar código de país del número
      const phoneMatch = formData.phone.match(/^(\+\d{1,4})\s*(.+)$/)
      if (phoneMatch) {
        setCountryCode(phoneMatch[1])
        setPhoneNumber(phoneMatch[2].replace(/\D/g, "")) // Solo números
      } else {
        setPhoneNumber(formData.phone.replace(/\D/g, ""))
      }
    }
  }, [])

  const handleBack = () => {
    if (isUserExisting) {
      setCurrentStep("payment-type")
    } else {
      setCurrentStep("user-data")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  // Validación de entrada para teléfono (solo números)
  const handlePhoneNumberChange = (value: string) => {
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      setPhoneNumber(value)
      // Actualizar el teléfono completo en formData
      const fullPhone = value ? `${countryCode} ${value}` : ""
      handleInputChange("phone", fullPhone)
    }
  }

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code)
    // Actualizar el teléfono completo en formData
    const fullPhone = phoneNumber ? `${code} ${phoneNumber}` : ""
    handleInputChange("phone", fullPhone)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar datos básicos del tercero
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!phoneNumber.trim()) {
      newErrors.phone = "El teléfono es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Ingresa un email válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validateForm()) return

    setThirdParty(formData)

    // Ir al paso de destino según la moneda
    if (quote?.currency === "usdt") {
      setCurrentStep("wallet-data")
    } else {
      setCurrentStep("pagomovil-data")
    }
  }

  // Soporte para ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isFormValid() && !errors.name && !errors.phone && !errors.email) {
        e.preventDefault()
        handleContinue()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [formData, phoneNumber])

  const isFormValid = () => {
    return formData.name.trim() !== "" && phoneNumber.trim() !== "" && formData.email.trim() !== ""
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#5B38B5" }}>
              Datos del Tercero
            </h1>
            <p className="text-gray-600">Ingresa los datos de la persona que realizará el pago con Zelle</p>
          </div>

          {/* Información del tercero */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="name"
                    placeholder="Nombre completo del tercero"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.name && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.name}</span>
                  </div>
                )}
              </div>

              {/* Teléfono con selector de país */}
              <div>
                <Label htmlFor="phone">Número telefónico *</Label>
                <div className="flex gap-2 mt-1">
                  {/* Selector de código de país */}
                  <div className="w-48">
                    <Select value={countryCode} onValueChange={handleCountryCodeChange}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem
                            key={`${country.code}-${country.name}`}
                            value={country.code}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span className="font-mono text-sm">{country.code}</span>
                              <span className="text-sm">{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo del número */}
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="phone"
                      type="text"
                      placeholder="1234567890"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneNumberChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Selecciona el país e ingresa el número sin el código</p>
                {errors.phone && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.phone}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tercero@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Advertencia sobre límites */}
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">Límite para terceros nuevos</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Si es la primera vez que esta persona envía dinero a través de ZinpleApp, el límite máximo será de
                    $10 USD por seguridad. Este límite aumentará con operaciones exitosas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleContinue}
            disabled={!formData.name || !phoneNumber || !formData.email}
            className="w-full text-white text-lg py-6 disabled:opacity-50"
            style={{ backgroundColor: "#5B38B5" }}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
