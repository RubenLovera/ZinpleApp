"use client"

import { useState, useRef, useEffect } from "react"
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  DollarSign,
  Users,
  Save,
  FileText,
  X,
  Shield,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useFlow } from "@/contexts/FlowContext"
import type { UserFormData } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"

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

// Rangos de volumen mensual
const volumeRanges = [
  { value: "10-99", label: "$10 - $99 USD" },
  { value: "100-249", label: "$100 - $249 USD" },
  { value: "250-499", label: "$250 - $499 USD" },
  { value: "500-999", label: "$500 - $999 USD" },
  { value: "1000-1499", label: "$1,000 - $1,499 USD" },
  { value: "1500-5000", label: "$1,500 - $5,000 USD" },
]

export default function UserDataStep() {
  const { user, setUser, setCurrentStep, isUserExisting, isThirdPartyPayment, quote } = useFlow()
  const [formData, setFormData] = useState<UserFormData>(
    user || {
      email: "",
      fullName: "",
      phone: "",
      userType: "persona",
      monthlyVolumeExpected: 99, // Cambiar de 0 a 99 (equivalente a "10-99")
      receivesThirdPartyPayments: false,
      expectedThirdParties: 0,
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsRead, setTermsRead] = useState(isUserExisting) // Usuarios existentes ya aceptaron términos
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [countryCode, setCountryCode] = useState("+58") // Venezuela por defecto
  const [phoneNumber, setPhoneNumber] = useState("")

  // Inicializar valores de teléfono si ya existe
  useState(() => {
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
  })

  const handleBack = () => {
    setCurrentStep("payment-type")
  }

  // En la función handleInputChange, agregar conversión para monthlyVolumeExpected
  const handleInputChange = (field: keyof UserFormData, value: any) => {
    // Convertir rangos de volumen a valores numéricos
    if (field === "monthlyVolumeExpected" && typeof value === "string") {
      const numericValue = convertVolumeRangeToNumber(value)
      setFormData((prev) => ({
        ...prev,
        [field]: numericValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  // Validación de entrada para campos numéricos
  const handleNumericChange = (field: keyof UserFormData, value: string) => {
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      handleInputChange(field, value === "" ? 0 : Number(value))
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

  // Manejar el scroll del modal para detectar si se leyeron los términos
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
      setScrollProgress(progress)

      // Si el usuario scrolleó al menos 80% del contenido, consideramos que leyó los términos
      if (progress >= 80) {
        setTermsRead(true)
      }
    }
  }

  const handleAcceptTerms = () => {
    if (termsAccepted && termsRead) {
      setShowTermsModal(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    // Simular guardado (aquí podrías hacer una llamada a la API para actualizar el usuario)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setUser(formData)
    setIsSaving(false)

    // Determinar a dónde ir después
    if (isUserExisting) {
      // Usuario existente vuelve a payment-type
      setCurrentStep("payment-type")
    } else {
      // Usuario nuevo: después de completar datos, continúa según el tipo de pago
      if (isThirdPartyPayment) {
        // Si es pago de tercero, ir a datos del tercero
        setCurrentStep("third-party-data")
      } else {
        // Si es pago propio, ir directo a destino (sin términos separados)
        if (quote?.currency === "usdt") {
          setCurrentStep("wallet-data")
        } else {
          setCurrentStep("pagomovil-data")
        }
      }
    }
  }

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      phoneNumber.trim() !== "" &&
      formData.monthlyVolumeExpected > 0 && // Cambiar de && a > 0
      (formData.receivesThirdPartyPayments ? formData.expectedThirdParties > 0 : true) &&
      termsRead
    )
  }

  // Soporte para ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isFormValid() && !isSaving && !showTermsModal) {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [formData, termsRead, isSaving, showTermsModal])

  // Agregar esta función antes del return
  const convertVolumeRangeToNumber = (range: string): number => {
    switch (range) {
      case "10-99":
        return 99
      case "100-249":
        return 249
      case "250-499":
        return 499
      case "500-999":
        return 999
      case "1000-1499":
        return 1499
      case "1500-5000":
        return 5000
      default:
        return 0
    }
  }

  // Y agregar esta función helper
  const getVolumeRangeFromNumber = (number: number): string => {
    if (number <= 99) return "10-99"
    if (number <= 249) return "100-249"
    if (number <= 499) return "250-499"
    if (number <= 999) return "500-999"
    if (number <= 1499) return "1000-1499"
    if (number <= 5000) return "1500-5000"
    return "10-99"
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
              {isUserExisting ? "Mis Datos Personales" : "Completa tu Perfil"}
            </h1>
            <p className="text-gray-600">
              {isUserExisting
                ? "Revisa y actualiza tu información personal"
                : "Estos datos se guardarán para futuras operaciones"}
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de usuario */}
              <div>
                <Label htmlFor="userType">¿Eres Persona o Negocio? *</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: "persona" | "negocio") => handleInputChange("userType", value)}
                >
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="persona" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Persona
                      </div>
                    </SelectItem>
                    <SelectItem value="negocio" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Negocio
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre completo */}
              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Tu nombre completo"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Email (solo lectura) */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} disabled className="mt-1 bg-gray-100" />
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
                <p className="text-sm text-gray-500 mt-1">Selecciona tu país e ingresa tu número sin el código</p>
              </div>

              {/* Volumen mensual esperado */}
              <div>
                <Label htmlFor="monthlyVolume">Volumen mensual esperado *</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <Select
                    value={getVolumeRangeFromNumber(formData.monthlyVolumeExpected || 0)}
                    onValueChange={(value) => handleInputChange("monthlyVolumeExpected", value)}
                  >
                    <SelectTrigger className="pl-10 cursor-pointer">
                      <SelectValue placeholder="$10 - $99 USD" />
                    </SelectTrigger>
                    <SelectContent>
                      {volumeRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value} className="cursor-pointer">
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-gray-500 mt-1">¿Cuánto proyectas operar mensualmente con Zinple?</p>
              </div>

              {/* Pagos de terceros */}
              <div>
                <Label>¿Recibirás pagos de terceros? *</Label>
                <Select
                  value={formData.receivesThirdPartyPayments ? "yes" : "no"}
                  onValueChange={(value) => handleInputChange("receivesThirdPartyPayments", value === "yes")}
                >
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no" className="cursor-pointer">
                      No
                    </SelectItem>
                    <SelectItem value="yes" className="cursor-pointer">
                      Sí
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Número de terceros */}
              {formData.receivesThirdPartyPayments && (
                <div>
                  <Label htmlFor="expectedThirdParties">¿De cuántos terceros recibirás pagos? *</Label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="expectedThirdParties"
                      type="text"
                      placeholder="5"
                      value={formData.expectedThirdParties || ""}
                      onChange={(e) => handleNumericChange("expectedThirdParties", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Términos y Condiciones - Solo para usuarios nuevos */}
          {!isUserExisting && (
            <Card className={`mb-6 ${termsRead ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {termsRead ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${termsRead ? "text-green-800" : "text-red-800"}`}>
                      {termsRead ? "Términos y Condiciones Leídos ✓" : "Términos y Condiciones (OBLIGATORIO)"}
                    </p>
                    <p className={`text-sm mt-1 ${termsRead ? "text-green-700" : "text-red-700"}`}>
                      {termsRead
                        ? "Has leído y aceptado nuestros términos de uso y políticas de seguridad."
                        : "Debes leer completamente nuestros términos y condiciones para continuar."}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTermsModal(true)}
                      className={`mt-2 ${
                        termsRead
                          ? "text-green-700 border-green-300 hover:bg-green-100"
                          : "text-red-700 border-red-300 hover:bg-red-100"
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {termsRead ? "Revisar Términos y Condiciones" : "Leer Términos y Condiciones *"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información sobre el perfil */}
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Save className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Perfil de Usuario</p>
                  <p className="text-green-700 text-sm mt-1">
                    Esta información se guarda en tu perfil y se usará para futuras operaciones, haciendo el proceso más
                    rápido.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleSave}
              disabled={!isFormValid() || isSaving}
              className="w-full text-white text-lg py-6 disabled:opacity-50"
              style={{ backgroundColor: "#5B38B5" }}
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? "Guardando..." : "Guardar Datos"}
            </Button>

            {!isUserExisting && !termsRead && (
              <p className="text-center text-sm text-red-600">* Debes leer los términos y condiciones para continuar</p>
            )}

            <Button variant="outline" onClick={handleBack} className="w-full text-lg py-6">
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Términos y Condiciones */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: "#5B38B5" }}>
                  Términos y Condiciones - ZinpleApp
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Lectura obligatoria - Desplázate hasta el final para continuar
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Barra de progreso de lectura */}
            <div className="w-full bg-gray-200 h-1 flex-shrink-0">
              <div
                className="h-1 transition-all duration-300"
                style={{
                  width: `${scrollProgress}%`,
                  backgroundColor: scrollProgress >= 80 ? "#10B981" : "#5B38B5",
                }}
              />
            </div>

            {/* Contenido del modal */}
            <div ref={scrollRef} onScroll={handleScroll} className="px-6 py-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Uso de ZinpleApp */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Uso Permitido de ZinpleApp</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      ZinpleApp está diseñado exclusivamente para facilitar conversiones de USD de Zelle a USDT o
                      Bolívares vía Pagomóvil.{" "}
                      <span className="font-semibold text-red-600">
                        Está prohibido utilizar la plataforma para recibir pagos relacionados con operaciones P2P en
                        exchanges de criptomonedas.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Pagos de Terceros */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Política de Pagos de Terceros</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Puedes recibir pagos de terceros siempre que sean{" "}
                      <span className="font-semibold">familiares directos o clientes legítimos</span>. Esta política nos
                      ayuda a mantener la seguridad de la plataforma y cumplir con las regulaciones financieras
                      aplicables.
                    </p>
                  </div>
                </div>

                {/* Límites de Seguridad */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Límites de Seguridad</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      Como medida de seguridad, la primera operación de cada nuevo remitente (incluido el titular de la
                      cuenta Zelle o cualquier tercero) tiene un{" "}
                      <span className="font-semibold text-orange-600">límite máximo de $10 USD</span>.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <p className="text-yellow-800 font-medium text-sm">Aumento progresivo de límites</p>
                      <p className="text-yellow-700 text-sm mt-2">
                        Este límite aumentará progresivamente conforme realices más operaciones exitosas con ZinpleApp,
                        permitiendo montos mayores en el futuro.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flexibilidad de Cuentas */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Flexibilidad de Cuentas de Destino</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Puedes agregar cuentas Pagomóvil o wallets de terceros sin problema. Esto te permite recibir
                      fondos en cuentas diferentes a las tuyas cuando sea necesario, brindando mayor flexibilidad en tus
                      operaciones.
                    </p>
                  </div>
                </div>

                {/* Responsabilidades del Usuario */}
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsabilidades del Usuario</h3>
                    <ul className="text-gray-700 space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 mt-1 text-lg">•</span>
                        <span>Proporcionar información veraz y actualizada en tu perfil</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 mt-1 text-lg">•</span>
                        <span>Verificar cuidadosamente las direcciones de wallet antes de confirmar</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 mt-1 text-lg">•</span>
                        <span>Enviar comprobantes de pago válidos y legibles</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-red-600 mt-1 text-lg">•</span>
                        <span>Cumplir con los tiempos establecidos para cada operación</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Checkbox de aceptación dentro del contenido */}
                {termsRead && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        id="accept-terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="accept-terms" className="text-gray-900 font-medium cursor-pointer">
                          Acepto los Términos y Condiciones
                        </label>
                        <p className="text-gray-600 text-sm mt-1">
                          Al marcar esta casilla, confirmo que he leído, entendido y acepto todos los términos y
                          condiciones mencionados anteriormente.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Button
                        onClick={handleAcceptTerms}
                        disabled={!termsAccepted}
                        className="text-white disabled:opacity-50"
                        style={{ backgroundColor: "#5B38B5" }}
                      >
                        Aceptar y Continuar
                      </Button>
                      <Button variant="outline" onClick={() => setShowTermsModal(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Mensaje para seguir leyendo */}
                {!termsRead && (
                  <div className="mt-8 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-800 font-medium text-center">
                      Continúa leyendo hasta el final para poder aceptar los términos
                    </p>
                    <p className="text-red-600 text-sm text-center mt-1">
                      Progreso: {Math.round(scrollProgress)}% completado
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
