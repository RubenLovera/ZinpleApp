"use client"

import { useState } from "react"
import { ArrowLeft, Smartphone, Building, User, AlertCircle, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFlow } from "@/contexts/FlowContext"
import ProgressBar from "@/components/ProgressBar"

export default function PagomovileDataStep() {
  const { user, setUser, setCurrentStep, isThirdPartyPayment, isUserExisting, thirdParty } = useFlow()
  const [pagomovil, setPagomovil] = useState(
    user?.pagomovil || {
      phone: "",
      bank: "",
      accountHolder: "",
      cedula: "",
    },
  )
  const [cedulaType, setCedulaType] = useState<"V" | "E" | "J">("V")
  const [cedulaNumber, setCedulaNumber] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Inicializar los valores de cédula si ya existe
  useState(() => {
    if (pagomovil.cedula) {
      const match = pagomovil.cedula.match(/^([VEJ])-?(\d+)$/i)
      if (match) {
        setCedulaType(match[1].toUpperCase() as "V" | "E" | "J")
        setCedulaNumber(match[2])
      }
    }
  })

  const handleBack = () => {
    if (isThirdPartyPayment) {
      setCurrentStep("third-party-data")
    } else if (isUserExisting) {
      setCurrentStep("payment-type")
    } else {
      // Usuario nuevo sin tercero va directo desde user-data
      setCurrentStep("user-data")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setPagomovil((prev) => ({
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

  const handleCedulaNumberChange = (value: string) => {
    // Solo permitir números
    const numericValue = value.replace(/\D/g, "")
    setCedulaNumber(numericValue)

    // Actualizar la cédula completa en el estado
    const fullCedula = numericValue ? `${cedulaType}-${numericValue}` : ""
    setPagomovil((prev) => ({
      ...prev,
      cedula: fullCedula,
    }))

    // Limpiar error
    if (errors.cedula) {
      setErrors((prev) => ({
        ...prev,
        cedula: "",
      }))
    }
  }

  const handleCedulaTypeChange = (type: "V" | "E" | "J") => {
    setCedulaType(type)

    // Actualizar la cédula completa en el estado
    const fullCedula = cedulaNumber ? `${type}-${cedulaNumber}` : ""
    setPagomovil((prev) => ({
      ...prev,
      cedula: fullCedula,
    }))

    // Limpiar error
    if (errors.cedula) {
      setErrors((prev) => ({
        ...prev,
        cedula: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!pagomovil.phone.trim()) {
      newErrors.phone = "El número telefónico es requerido"
    } else if (!/^04\d{9}$/.test(pagomovil.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Formato: 0414-1234567 (números venezolanos)"
    }

    if (!pagomovil.bank) {
      newErrors.bank = "Selecciona el banco"
    }

    if (!pagomovil.accountHolder.trim()) {
      newErrors.accountHolder = "El nombre del titular es requerido"
    }

    if (!cedulaNumber.trim()) {
      newErrors.cedula = "La cédula es requerida"
    } else if (cedulaNumber.length < 7 || cedulaNumber.length > 8) {
      newErrors.cedula = "La cédula debe tener entre 7 y 8 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validateForm()) return

    // Actualizar los datos del usuario
    if (user) {
      setUser({
        ...user,
        pagomovil,
      })
    }

    setCurrentStep("summary")
  }

  const banks = [
    "Banesco",
    "Mercantil",
    "Banco de Venezuela",
    "Provincial",
    "Bicentenario",
    "Exterior",
    "Bancaribe",
    "BOD",
    "Activo",
    "Bancamiga",
    "Banplus",
    "Otros",
  ]

  const cedulaTypes = [
    { value: "V", label: "V - Venezolano" },
    { value: "E", label: "E - Extranjero" },
    { value: "J", label: "J - Jurídico" },
  ]

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
              Cuenta Pagomóvil de Destino
            </h1>
            <p className="text-gray-600">Ingresa los datos de la cuenta Pagomóvil donde recibirás los Bolívares</p>
          </div>

          {/* Aclaración importante sobre el destinatario */}
          {isThirdPartyPayment && thirdParty && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">Información del pago</p>
                    <p className="text-blue-700 text-sm mt-1">
                      <strong>{thirdParty.name}</strong> realizará el pago con Zelle, y los Bolívares se enviarán a la
                      cuenta Pagomóvil que ingreses a continuación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Información de la Cuenta Pagomóvil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Número telefónico */}
              <div>
                <Label htmlFor="phone">Número Telefónico *</Label>
                <div className="relative mt-1">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    placeholder="0414-1234567"
                    value={pagomovil.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.phone && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.phone}</span>
                  </div>
                )}
              </div>

              {/* Banco */}
              <div>
                <Label htmlFor="bank">Banco *</Label>
                <Select value={pagomovil.bank} onValueChange={(value) => handleInputChange("bank", value)}>
                  <SelectTrigger className="mt-1 cursor-pointer">
                    <SelectValue placeholder="Selecciona el banco" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank} value={bank.toLowerCase()} className="cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {bank}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bank && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.bank}</span>
                  </div>
                )}
              </div>

              {/* Titular de la cuenta */}
              <div>
                <Label htmlFor="accountHolder">Titular de la Cuenta Pagomóvil *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="accountHolder"
                    placeholder="Nombre completo del titular"
                    value={pagomovil.accountHolder}
                    onChange={(e) => handleInputChange("accountHolder", e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Puede ser tu nombre o el de otra persona (familiar, etc.)</p>
                {errors.accountHolder && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.accountHolder}</span>
                  </div>
                )}
              </div>

              {/* Cédula mejorada */}
              <div>
                <Label htmlFor="cedula">Cédula del Titular *</Label>
                <div className="flex gap-2 mt-1">
                  {/* Selector de tipo de cédula */}
                  <div className="w-32">
                    <Select value={cedulaType} onValueChange={handleCedulaTypeChange}>
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cedulaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="cursor-pointer">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo numérico para la cédula */}
                  <div className="flex-1 relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="cedula"
                      type="text"
                      inputMode="numeric"
                      placeholder="12345678"
                      value={cedulaNumber}
                      onChange={(e) => handleCedulaNumberChange(e.target.value)}
                      className="pl-10"
                      maxLength={8}
                    />
                  </div>
                </div>

                {/* Vista previa de la cédula completa */}
                {cedulaNumber && (
                  <div className="mt-2 text-sm text-gray-600">
                    Cédula completa:{" "}
                    <span className="font-mono font-medium">
                      {cedulaType}-{cedulaNumber}
                    </span>
                  </div>
                )}

                {errors.cedula && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.cedula}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información importante */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Sobre la cuenta Pagomóvil</p>
                  <ul className="text-blue-700 text-sm mt-2 space-y-1">
                    <li>• El número debe estar registrado en Pagomóvil</li>
                    <li>• Puede ser tu cuenta o la de un familiar/conocido</li>
                    <li>• Verifica que el titular y la cédula coincidan exactamente</li>
                    <li>• Los fondos se enviarán inmediatamente después de confirmar tu pago</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleContinue}
            disabled={!pagomovil.phone || !pagomovil.bank || !pagomovil.accountHolder || !cedulaNumber}
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
