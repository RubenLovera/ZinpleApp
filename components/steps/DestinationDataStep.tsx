"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Smartphone, Building, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFlow } from "@/contexts/FlowContext"
import ProgressBar from "@/components/ProgressBar"

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

export default function DestinationDataStep() {
  const { user, setUser, setCurrentStep, getNextStep, getPreviousStep, quote } = useFlow()
  const [formData, setFormData] = useState({
    phone: user?.pagomovil?.phone || "",
    bank: user?.pagomovil?.bank || "",
    accountHolder: user?.pagomovil?.accountHolder || "",
    cedula: user?.pagomovil?.cedula || "",
  })
  const [cedulaType, setCedulaType] = useState<"V" | "E" | "J">("V")
  const [cedulaNumber, setCedulaNumber] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (formData.cedula) {
      const match = formData.cedula.match(/^([VEJ])-?(\d+)$/)
      if (match) {
        setCedulaType(match[1] as "V" | "E" | "J")
        setCedulaNumber(match[2])
      }
    }
  }, [])

  const handleBack = () => {
    setCurrentStep(getPreviousStep("destination-data"))
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handlePhoneChange = (value: string) => {
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      handleChange("phone", value)
    }
  }

  const handleCedulaChange = (value: string) => {
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      setCedulaNumber(value)
      // Actualizar la cédula completa en formData
      const fullCedula = value ? `${cedulaType}-${value}` : ""
      handleChange("cedula", fullCedula)
    }
  }

  const handleCedulaTypeChange = (type: "V" | "E" | "J") => {
    setCedulaType(type)
    // Actualizar la cédula completa en formData
    const fullCedula = cedulaNumber ? `${type}-${cedulaNumber}` : ""
    handleChange("cedula", fullCedula)
  }

  const isFormValid = () => {
    return (
      formData.phone.trim() !== "" &&
      formData.bank.trim() !== "" &&
      formData.accountHolder.trim() !== "" &&
      formData.cedula.trim() !== ""
    )
  }

  const handleSave = async () => {
    if (!isFormValid()) return

    setIsSaving(true)
    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Actualizar usuario con datos de pagomóvil
    if (user) {
      setUser({
        ...user,
        pagomovil: {
          phone: formData.phone,
          bank: formData.bank,
          accountHolder: formData.accountHolder,
          cedula: formData.cedula,
        },
      })
    }
    
    setCurrentStep(getNextStep("destination-data"))
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
              <div className="text-3xl">🇻🇪</div>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  Datos de Recepción
                </h1>
                <p className="text-gray-600">
                  Tu cuenta de Pago Móvil donde recibirás los bolívares
                </p>
              </div>
            </div>
          </div>

          {/* Resumen de la operación */}
          {quote && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recibirás</p>
                    <p className="font-bold text-2xl text-primary">
                      Bs {quote.result.toLocaleString()} VES
                    </p>
                  </div>
                  <Smartphone className="w-10 h-10 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Datos de Pagomóvil */}
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
                <Label htmlFor="phone">Número de Pago Móvil *</Label>
                <div className="flex gap-2 mt-1">
                  <div className="w-16 flex items-center justify-center bg-gray-100 rounded-md border text-sm">
                    0
                  </div>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="4141234567"
                    value={formData.phone}
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
                  value={formData.bank}
                  onValueChange={(value) => handleChange("bank", value)}
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
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="accountHolder"
                    placeholder="Nombre como aparece en el banco"
                    value={formData.accountHolder}
                    onChange={(e) => handleChange("accountHolder", e.target.value)}
                    className="pl-10"
                  />
                </div>
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

          {/* Información adicional */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Verificación importante</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Verifica que los datos sean correctos. Una vez confirmada la operación, 
                    los bolívares se enviarán automáticamente a esta cuenta de Pago Móvil.
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
