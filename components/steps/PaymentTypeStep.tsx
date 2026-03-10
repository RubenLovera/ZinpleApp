"use client"

import { useState } from "react"
import { ArrowLeft, Users, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import ProgressBar from "@/components/ProgressBar"

export default function PaymentTypeStep() {
  const { quote, setCurrentStep, setIsThirdPartyPayment, user, isUserExisting } = useFlow()
  const [selectedType, setSelectedType] = useState<"self" | "third-party" | null>(null)

  const handleBack = () => {
    setCurrentStep("email")
  }

  const handleViewMyData = () => {
    setCurrentStep("user-data")
  }

  const handleContinue = () => {
    if (!selectedType) return

    setIsThirdPartyPayment(selectedType === "third-party")

    // TODOS los usuarios nuevos deben completar sus datos primero
    if (!isUserExisting) {
      setCurrentStep("user-data")
      return
    }

    // Solo usuarios existentes pueden ir directo según el tipo de pago
    if (selectedType === "third-party") {
      setCurrentStep("third-party-data")
    } else {
      // Usuario existente con pago propio va directo a destino
      if (quote?.currency === "usdt") {
        setCurrentStep("wallet-data")
      } else {
        setCurrentStep("pagomovil-data")
      }
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
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold" style={{ color: "#5B38B5" }}>
                ¿Quién realizará el pago?
              </h1>
              {user && isUserExisting && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewMyData}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Ver mis datos
                </Button>
              )}
            </div>
            <p className="text-gray-600">
              Selecciona si tú realizarás el pago desde tu cuenta o si será un tercero
            </p>
          </div>

          {/* Información del usuario actual */}
          {user && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      {isUserExisting ? "Usuario existente" : "Nuevo usuario"}: {user.fullName || user.email}
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      {isUserExisting
                        ? "Tus datos están guardados y listos para usar"
                        : "Necesitamos completar tu perfil para procesar cualquier operación"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Opciones de pago */}
          <div className="space-y-4 mb-6">
            <Card
              className={`cursor-pointer transition-all duration-200 ${
                selectedType === "self"
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setSelectedType("self")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedType === "self" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Yo realizaré el pago</h3>
                    <p className="text-gray-600">El pago se realizará desde mi propia cuenta bancaria/billetera</p>
                    {!isUserExisting && (
                      <p className="text-sm text-purple-600 mt-1">• Completaremos tu perfil primero</p>
                    )}
                  </div>
                  {selectedType === "self" && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all duration-200 ${
                selectedType === "third-party"
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setSelectedType("third-party")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedType === "third-party" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Un tercero realizará el pago</h3>
                    <p className="text-gray-600">El pago se realizará desde la cuenta bancaria/billetera de otra persona</p>
                    {!isUserExisting && (
                      <p className="text-sm text-purple-600 mt-1">• Completaremos tu perfil y los datos del tercero</p>
                    )}
                  </div>
                  {selectedType === "third-party" && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información adicional */}
          

          <Button
            onClick={handleContinue}
            disabled={!selectedType}
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
