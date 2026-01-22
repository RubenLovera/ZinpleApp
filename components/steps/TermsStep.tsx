"use client"

import { useState } from "react"
import { ArrowLeft, CheckCircle, AlertTriangle, Shield, Users, DollarSign, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useFlow } from "@/contexts/FlowContext"
import ProgressBar from "@/components/ProgressBar"

export default function TermsStep() {
  const { quote, setCurrentStep } = useFlow()
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleBack = () => {
    setCurrentStep("payment-type")
  }

  const handleContinue = () => {
    if (!termsAccepted) return

    // Ir al paso de destino según la moneda
    if (quote?.currency === "usdt") {
      setCurrentStep("wallet-data")
    } else {
      setCurrentStep("pagomovil-data")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#5B38B5" }}>
              Términos y Condiciones
            </h1>
            <p className="text-gray-600">Lee y acepta nuestros términos para continuar con tu operación</p>
          </div>

          {/* Términos y Condiciones */}
          <div className="space-y-6 mb-8">
            {/* Uso de ZinpleApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  Uso de ZinpleApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  ZinpleApp está diseñado para facilitar conversiones de USD de Zelle a USDT o Bolívares vía Pagomóvil.{" "}
                  <span className="font-semibold text-red-600">
                    No utilices la plataforma para recibir pagos relacionados con operaciones P2P en exchanges.
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Pagos de Terceros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  Pagos de Terceros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Puedes recibir pagos de terceros siempre que sean{" "}
                  <span className="font-semibold">familiares o clientes directos</span>. Esto nos ayuda a mantener la
                  seguridad y cumplir con las regulaciones financieras.
                </p>
              </CardContent>
            </Card>

            {/* Límites de Seguridad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </div>
                  Límites de Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700 leading-relaxed">
                    Como medida de seguridad, la primera operación de cada nuevo remitente (incluido el titular de la
                    cuenta Zelle o cualquier tercero) tiene un{" "}
                    <span className="font-semibold text-orange-600">límite máximo de $10 USD</span>.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-800 font-medium">Aumento progresivo de límites</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          Este límite aumentará progresivamente conforme realices más operaciones exitosas con
                          ZinpleApp.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Otras Opciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  Flexibilidad de Cuentas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Puedes agregar cuentas Pagomóvil o wallets de terceros sin problema. Esto te permite recibir fondos en
                  cuentas diferentes a las tuyas cuando sea necesario.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Checkbox de aceptación */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="terms" className="text-gray-900 font-medium cursor-pointer">
                    Acepto los Términos y Condiciones
                  </label>
                  <p className="text-gray-600 text-sm mt-1">
                    Al marcar esta casilla, confirmo que he leído, entendido y acepto todos los términos y condiciones
                    mencionados anteriormente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Seguridad y Transparencia</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Estos términos nos ayudan a mantener un servicio seguro y transparente para todos nuestros usuarios.
                    Si tienes alguna pregunta, no dudes en contactarnos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleContinue}
            disabled={!termsAccepted}
            className="w-full text-white text-lg py-6 disabled:opacity-50"
            style={{ backgroundColor: "#5B38B5" }}
          >
            Acepto los Términos
          </Button>
        </div>
      </div>
    </div>
  )
}
