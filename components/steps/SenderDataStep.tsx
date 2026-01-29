"use client"

import { useState } from "react"
import { ArrowLeft, User, Phone, Mail, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFlow } from "@/contexts/FlowContext"
import type { SenderData } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"
import { getCurrencyInfo, COUNTRY_CURRENCIES } from "@/types/database"

const relationships = [
  { value: "familiar", label: "Familiar" },
  { value: "amigo", label: "Amigo" },
  { value: "cliente", label: "Cliente" },
  { value: "empleador", label: "Empleador" },
  { value: "otro", label: "Otro" },
]

// Países de origen disponibles
const sourceCountries = COUNTRY_CURRENCIES.filter(c => c.code !== "VES" && c.code !== "USDT")

export default function SenderDataStep() {
  const { quote, sender, setSender, setCurrentStep, getNextStep, getPreviousStep } = useFlow()
  const [formData, setFormData] = useState<SenderData>(
    sender || {
      fullName: "",
      phone: "",
      email: "",
      country: quote?.sourceCountry || "Estados Unidos",
      relationship: "familiar",
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  // Obtener información de la moneda origen
  const sourceCurrency = quote ? getCurrencyInfo(quote.sourceCurrency) : null

  const handleBack = () => {
    setCurrentStep(getPreviousStep("sender-data"))
  }

  const handleInputChange = (field: keyof SenderData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.country.trim() !== "" &&
      formData.relationship
    )
  }

  const handleSave = async () => {
    if (!isFormValid()) return

    setIsSaving(true)
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    setSender(formData)
    setCurrentStep(getNextStep("sender-data"))
    setIsSaving(false)
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
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{sourceCurrency?.flag || "🌎"}</div>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Datos del Remitente
                </h1>
                <p className="text-gray-600">
                  Persona que enviará el dinero desde el exterior
                </p>
              </div>
            </div>
          </div>

          {/* Información sobre el flujo */}
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Link de Pago Personalizado</p>
                  <p className="text-green-700 text-sm mt-1">
                    Una vez completes este formulario, generaremos un link de pago que podrás compartir 
                    con esta persona para que realice la transferencia desde su país.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del remitente */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información del Remitente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre completo */}
              <div>
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  placeholder="Nombre y apellido del remitente"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* País */}
              <div>
                <Label htmlFor="country">País desde donde enviará *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue placeholder="Selecciona el país" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceCountries.map((country) => (
                      <SelectItem key={country.code} value={country.country} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          {country.country}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teléfono */}
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    type="text"
                    placeholder="Número con código de país"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Incluye el código de país (ej: +1 para USA)</p>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email (opcional)</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Relación */}
              <div>
                <Label htmlFor="relationship">Relación contigo *</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value: "familiar" | "amigo" | "cliente" | "empleador" | "otro") => 
                    handleInputChange("relationship", value)
                  }
                >
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue placeholder="Selecciona la relación" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((rel) => (
                      <SelectItem key={rel.value} value={rel.value} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {rel.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Cumplimiento regulatorio</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Esta información nos ayuda a cumplir con las regulaciones internacionales de prevención 
                    de lavado de dinero. Solo aceptamos transferencias de personas con relación directa contigo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleSave}
            disabled={!isFormValid() || isSaving}
            className="w-full text-white text-lg py-6 disabled:opacity-50 bg-primary hover:bg-primary/90"
          >
            {isSaving ? "Guardando..." : "Generar Link de Pago"}
          </Button>
        </div>
      </div>
    </div>
  )
}
