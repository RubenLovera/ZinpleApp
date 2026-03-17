"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Smartphone, Building, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFlow } from "@/contexts/FlowContext"
import type { BeneficiaryData } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"
import { getCurrencyInfo } from "@/types/database"

// Datos de países con códigos telefónicos (mismo que en UserDataStep)
const countries = [
  { code: "+1-US", name: "Estados Unidos", flag: "🇺🇸", displayCode: "+1 (US)" },
  { code: "+1-CA", name: "Canadá", flag: "🇨🇦", displayCode: "+1 (CA)" },
  { code: "+52", name: "México", flag: "🇲🇽", displayCode: "+52" },
  { code: "+57", name: "Colombia", flag: "🇨🇴", displayCode: "+57" },
  { code: "+58", name: "Venezuela", flag: "🇻🇪", displayCode: "+58" },
  { code: "+51", name: "Perú", flag: "🇵🇪", displayCode: "+51" },
  { code: "+56", name: "Chile", flag: "🇨🇱", displayCode: "+56" },
  { code: "+54", name: "Argentina", flag: "🇦🇷", displayCode: "+54" },
  { code: "+55", name: "Brasil", flag: "🇧🇷", displayCode: "+55" },
  { code: "+593", name: "Ecuador", flag: "🇪🇨", displayCode: "+593" },
  { code: "+595", name: "Paraguay", flag: "🇵🇾", displayCode: "+595" },
  { code: "+598", name: "Uruguay", flag: "🇺🇾", displayCode: "+598" },
  { code: "+591", name: "Bolivia", flag: "🇧🇴", displayCode: "+591" },
  { code: "+34", name: "España", flag: "🇪🇸", displayCode: "+34" },
  { code: "+39", name: "Italia", flag: "🇮🇹", displayCode: "+39" },
  { code: "+33", name: "Francia", flag: "🇫🇷", displayCode: "+33" },
  { code: "+49", name: "Alemania", flag: "🇩🇪", displayCode: "+49" },
  { code: "+44", name: "Reino Unido", flag: "🇬🇧", displayCode: "+44" },
]

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

export default function BeneficiaryDataStep() {
  const { quote, beneficiary, setBeneficiary, setCurrentStep, getNextStep, getPreviousStep, user } = useFlow()
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
  const [countryCode, setCountryCode] = useState("+58") // Venezuela por defecto
  const [phoneNumber, setPhoneNumber] = useState("")
  const [cedulaType, setCedulaType] = useState<"V" | "E" | "J">("V")
  const [cedulaNumber, setCedulaNumber] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

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

  const handleCedulaChange = (value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setCedulaNumber(value)
      const fullCedula = value ? `${cedulaType}-${value}` : ""
      setFormData((prev) => ({
        ...prev,
        pagomovil: {
          ...prev.pagomovil!,
          cedula: fullCedula,
        },
      }))
    }
  }

  const handleCedulaTypeChange = (type: "V" | "E" | "J") => {
    setCedulaType(type)
    const fullCedula = cedulaNumber ? `${type}-${cedulaNumber}` : ""
    setFormData((prev) => ({
      ...prev,
      pagomovil: {
        ...prev.pagomovil!,
        cedula: fullCedula,
      },
    }))
  }

  const handlePhoneChange = (value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      setPhoneNumber(value)
    }
  }

  const isFormValid = () => {
    return (
      formData.fullName.trim() !== "" &&
      phoneNumber.trim() !== "" &&
      formData.pagomovil?.bank.trim() !== "" &&
      formData.pagomovil?.cedula.trim() !== ""
    )
  }

  const handleSave = async () => {
    if (!isFormValid()) return

    setIsSaving(true)
    setError("")

    try {
      // Construir objeto beneficiary para contexto
      const updatedBeneficiary: BeneficiaryData = {
        ...formData,
        fullName: formData.fullName,
        pagomovil: {
          phone: phoneNumber,
          bank: formData.pagomovil?.bank || "",
          accountHolder: formData.fullName, // Usar nombre completo como titular
          cedula: formData.pagomovil?.cedula || "",
        },
      }

      // Guardar en contexto
      setBeneficiary(updatedBeneficiary)

      // Guardar en Supabase si el usuario tiene ID
      if (user?.id) {
        const bankOption = venezuelaBanks.find((b) => b.value === formData.pagomovil?.bank)
        const response = await fetch("/api/beneficiaries/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            fullName: formData.fullName,
            pagomovilPhone: phoneNumber,
            countryCode: countryCode,
            bank: formData.pagomovil?.bank,
            bankName: bankOption?.label || formData.pagomovil?.bank,
            cedula: formData.pagomovil?.cedula,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          console.error("[v0] Error saving beneficiary:", data)
          setError("Error al guardar el beneficiario. Intenta de nuevo.")
          setIsSaving(false)
          return
        }

        console.log("[v0] Beneficiary saved successfully")
      }

      setCurrentStep(getNextStep("beneficiary-data"))
    } catch (err) {
      console.error("[v0] Error in handleSave:", err)
      setError("Error al guardar el beneficiario. Intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
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
                  Datos del Destinatario
                </h1>
                <p className="text-gray-600">
                  Persona que recibirá el dinero en {destCurrency?.country || "Venezuela"}
                </p>
              </div>
            </div>
          </div>

          {/* Datos del Destinatario - Sección única */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Datos del Destinatario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre completo del destinatario */}
              <div>
                <Label htmlFor="fullName">Nombre Completo del Destinatario *</Label>
                <Input
                  id="fullName"
                  placeholder="Nombre y apellido"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Número de Teléfono con selector de país */}
              <div>
                <Label>Número de Teléfono *</Label>
                <div className="flex gap-2 mt-1">
                  {/* Selector de país */}
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-40 cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.displayCode}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Input de número */}
                  <Input
                    type="text"
                    placeholder="4141234567"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Número sin espacios ni caracteres especiales</p>
              </div>

              {/* Banco */}
              <div>
                <Label htmlFor="bank">Banco *</Label>
                <Select
                  value={formData.pagomovil?.bank || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      pagomovil: {
                        ...prev.pagomovil!,
                        bank: value,
                      },
                    }))
                  }
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

              {/* Cédula de Identidad */}
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

          {/* Mensaje informativo */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-blue-800 font-medium">Verificación de datos</p>
              <p className="text-blue-700 text-sm mt-1">
                Asegúrate de que los datos del beneficiario sean correctos. 
                El dinero se enviará a esta cuenta y no podremos revertir la operación si los datos son incorrectos.
              </p>
            </CardContent>
          </Card>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

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
