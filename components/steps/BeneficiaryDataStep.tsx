"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, User, Phone, Mail, Users, Smartphone, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFlow } from "@/contexts/FlowContext"
import type { BeneficiaryData } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"
import { getCurrencyInfo } from "@/types/database"

// Bancos de Venezuela
const venezuelaBanks = [
  { value: "banesco", label: "Banesco" },
  { value: "provincial", label: "BBVA Provincial" },
  { value: "mercantil", label: "Mercantil" },
  { value: "venezuela", label: "Banco de Venezuela" },
  { value: "bicentenario", label: "Bicentenario" },
  { value: "exterior", label: "Banco Exterior" },
  { value: "bancaribe", label: "Bancaribe" },
  { value: "bnc", label: "BNC" },
  { value: "bod", label: "BOD" },
  { value: "fondo_comun", label: "Fondo Común" },
  { value: "bancrecer", label: "Bancrecer" },
  { value: "100%banco", label: "100% Banco" },
  { value: "bancamiga", label: "Bancamiga" },
  { value: "plaza", label: "Banco Plaza" },
  { value: "caroni", label: "Banco Caroní" },
  { value: "activo", label: "Banco Activo" },
  { value: "sofitasa", label: "Sofitasa" },
  { value: "del_tesoro", label: "Banco del Tesoro" },
  { value: "agricola", label: "Banco Agrícola" },
]

const relationships = [
  { value: "familiar", label: "Familiar" },
  { value: "amigo", label: "Amigo" },
  { value: "cliente", label: "Cliente" },
  { value: "proveedor", label: "Proveedor" },
  { value: "otro", label: "Otro" },
]

export default function BeneficiaryDataStep() {
  const { quote, beneficiary, setBeneficiary, setCurrentStep, getNextStep, getPreviousStep } = useFlow()
  const [formData, setFormData] = useState<BeneficiaryData>(
    beneficiary || {
      fullName: "",
      phone: "",
      email: "",
      relationship: "familiar",
      pagomovil: {
        phone: "",
        bank: "",
        accountHolder: "",
        cedula: "",
      },
    }
  )
  const [cedulaType, setCedulaType] = useState<"V" | "E" | "J">("V")
  const [cedulaNumber, setCedulaNumber] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Obtener información de la moneda destino
  const destCurrency = quote ? getCurrencyInfo(quote.destinationCurrency) : null

  useEffect(() => {
    if (formData.pagomovil?.cedula) {
      const match = formData.pagomovil.cedula.match(/^([VEJ])-?(\d+)$/)
      if (match) {
        setCedulaType(match[1] as "V" | "E" | "J")
        setCedulaNumber(match[2])
      }
    }
  }, [])

  const handleBack = () => {
    setCurrentStep(getPreviousStep("beneficiary-data"))
  }

  const handleInputChange = (field: keyof BeneficiaryData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePagomovilChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      pagomovil: {
        ...prev.pagomovil!,
        [field]: value,
      },
    }))
  }

  const handleCedulaChange = (value: string) => {
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      setCedulaNumber(value)
      // Actualizar la cédula completa en formData
      const fullCedula = value ? `${cedulaType}-${value}` : ""
      handlePagomovilChange("cedula", fullCedula)
    }
  }

  const handleCedulaTypeChange = (type: "V" | "E" | "J") => {
    setCedulaType(type)
    // Actualizar la cédula completa en formData
    const fullCedula = cedulaNumber ? `${type}-${cedulaNumber}` : ""
    handlePagomovilChange("cedula", fullCedula)
  }

  const handlePhoneChange = (value: string) => {
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      handlePagomovilChange("phone", value)
    }
  }

  const isFormValid = () => {
    // Para Venezuela, necesitamos datos de Pagomóvil
    if (quote?.destinationCurrency === "VES") {
      return (
        formData.fullName.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.relationship &&
        formData.pagomovil?.phone.trim() !== "" &&
        formData.pagomovil?.bank.trim() !== "" &&
        formData.pagomovil?.accountHolder.trim() !== "" &&
        formData.pagomovil?.cedula.trim() !== ""
      )
    }
    // Para otros destinos, solo datos básicos por ahora
    return (
      formData.fullName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.relationship
    )
  }

  const handleSave = async () => {
    if (!isFormValid()) return

    setIsSaving(true)
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    setBeneficiary(formData)
    setCurrentStep(getNextStep("beneficiary-data"))
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
              <div className="text-3xl">{destCurrency?.flag || "🇻🇪"}</div>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Datos del Beneficiario
                </h1>
                <p className="text-gray-600">
                  Persona que recibirá el dinero en {destCurrency?.country || "Venezuela"}
                </p>
              </div>
            </div>
          </div>

          {/* Información del beneficiario */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre completo */}
              <div>
                <Label htmlFor="fullName">Nombre Completo del Beneficiario *</Label>
                <Input
                  id="fullName"
                  placeholder="Nombre y apellido"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Teléfono de contacto */}
              <div>
                <Label htmlFor="phone">Teléfono de Contacto *</Label>
                <div className="flex gap-2 mt-1">
                  <div className="w-20 flex items-center justify-center bg-gray-100 rounded-md border text-sm">
                    +58
                  </div>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="4141234567"
                    value={formData.phone}
                    onChange={(e) => {
                      if (e.target.value === "" || /^\d+$/.test(e.target.value)) {
                        handleInputChange("phone", e.target.value)
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Email (opcional) */}
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
                <Label htmlFor="relationship">Relación con el Beneficiario *</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value: "familiar" | "amigo" | "cliente" | "proveedor" | "otro") => 
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

          {/* Datos de Pagomóvil (para Venezuela) */}
          {quote?.destinationCurrency === "VES" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Datos de Pago Móvil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Número de Pagomóvil */}
                <div>
                  <Label htmlFor="pagomovilPhone">Número de Pago Móvil *</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="w-16 flex items-center justify-center bg-gray-100 rounded-md border text-sm">
                      0
                    </div>
                    <Input
                      id="pagomovilPhone"
                      type="text"
                      placeholder="4141234567"
                      value={formData.pagomovil?.phone || ""}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={10}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Número asociado al Pago Móvil (sin el 0 inicial)</p>
                </div>

                {/* Banco */}
                <div>
                  <Label htmlFor="bank">Banco *</Label>
                  <Select
                    value={formData.pagomovil?.bank || ""}
                    onValueChange={(value) => handlePagomovilChange("bank", value)}
                  >
                    <SelectTrigger className="mt-1 cursor-pointer">
                      <SelectValue placeholder="Selecciona el banco" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {venezuelaBanks.map((bank) => (
                        <SelectItem key={bank.value} value={bank.value} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {bank.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Titular de la cuenta */}
                <div>
                  <Label htmlFor="accountHolder">Titular de la Cuenta *</Label>
                  <Input
                    id="accountHolder"
                    placeholder="Nombre como aparece en el banco"
                    value={formData.pagomovil?.accountHolder || ""}
                    onChange={(e) => handlePagomovilChange("accountHolder", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Cédula */}
                <div>
                  <Label htmlFor="cedula">Cédula de Identidad *</Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={cedulaType} onValueChange={(v) => handleCedulaTypeChange(v as "V" | "E" | "J")}>
                      <SelectTrigger className="w-20 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="V" className="cursor-pointer">V</SelectItem>
                        <SelectItem value="E" className="cursor-pointer">E</SelectItem>
                        <SelectItem value="J" className="cursor-pointer">J</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="cedula"
                      type="text"
                      placeholder="12345678"
                      value={cedulaNumber}
                      onChange={(e) => handleCedulaChange(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información adicional */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Verificación de datos</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Asegúrate de que los datos del beneficiario sean correctos. 
                    El dinero se enviará a esta cuenta y no podremos revertir la operación si los datos son incorrectos.
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
            {isSaving ? "Guardando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
