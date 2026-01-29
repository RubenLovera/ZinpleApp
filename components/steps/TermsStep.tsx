"use client"

import { useState } from "react"
import { ArrowLeft, CheckCircle, AlertTriangle, Shield, Users, Globe, Settings, Send, Download, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useFlow } from "@/contexts/FlowContext"
import ProgressBar from "@/components/ProgressBar"
import { getCurrencyInfo } from "@/types/database"

export default function TermsStep() {
  const { quote, setCurrentStep, operationMode, getNextStep, getPreviousStep } = useFlow()
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleBack = () => {
    setCurrentStep(getPreviousStep("terms"))
  }

  const handleContinue = () => {
    if (!termsAccepted) return
    const nextStep = getNextStep("terms")
    console.log("[v0] TermsStep - operationMode:", operationMode)
    console.log("[v0] TermsStep - getNextStep('terms') returned:", nextStep)
    setCurrentStep(nextStep)
  }

  // Obtener información de las monedas
  const sourceCurrency = quote ? getCurrencyInfo(quote.sourceCurrency) : null
  const destCurrency = quote ? getCurrencyInfo(quote.destinationCurrency) : null

  // Títulos y descripciones según el modo
  const getModeInfo = () => {
    switch (operationMode) {
      case "send":
        return {
          title: "Envío Internacional",
          subtitle: `Envío de ${sourceCurrency?.country || "origen"} a ${destCurrency?.country || "destino"}`,
          icon: <Send className="w-5 h-5" />,
          color: "blue"
        }
      case "receive":
        return {
          title: "Recibir del Exterior",
          subtitle: "Crea un link de pago para recibir dinero",
          icon: <Download className="w-5 h-5" />,
          color: "green"
        }
      case "buy_usdt":
        return {
          title: "Compra de USDT",
          subtitle: `Convierte ${sourceCurrency?.name || "fiat"} a USDT`,
          icon: <Wallet className="w-5 h-5" />,
          color: "purple"
        }
      case "sell_usdt":
        return {
          title: "Venta de USDT",
          subtitle: "Convierte USDT a Bolívares",
          icon: <Wallet className="w-5 h-5" />,
          color: "orange"
        }
      default:
        return {
          title: "Términos y Condiciones",
          subtitle: "Lee y acepta nuestros términos",
          icon: <Shield className="w-5 h-5" />,
          color: "purple"
        }
    }
  }

  const modeInfo = getModeInfo()

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
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full bg-${modeInfo.color}-100 flex items-center justify-center`}>
                {modeInfo.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  {modeInfo.title}
                </h1>
                <p className="text-gray-600">{modeInfo.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Resumen de la operación */}
          {quote && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sourceCurrency?.flag}</span>
                    <div>
                      <p className="text-sm text-gray-600">Envías</p>
                      <p className="font-bold text-lg">
                        {sourceCurrency?.symbol}{quote.amount.toLocaleString()} {quote.sourceCurrency}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Reciben</p>
                      <p className="font-bold text-lg text-primary">
                        {destCurrency?.symbol}{quote.result.toLocaleString()} {quote.destinationCurrency}
                      </p>
                    </div>
                    <span className="text-2xl">{destCurrency?.flag}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  ZinpleApp facilita transferencias internacionales y cambio de divisas entre países de Latinoamérica, 
                  Estados Unidos y Europa.{" "}
                  <span className="font-semibold text-red-600">
                    No utilices la plataforma para operaciones ilegales o fraudulentas.
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Cobertura Internacional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-green-600" />
                  </div>
                  Cobertura Internacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Operamos con los siguientes países y monedas:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["🇺🇸 USD", "🇲🇽 MXN", "🇨🇱 CLP", "🇵🇪 PEN", "🇧🇷 BRL", "🇨🇴 COP", "🇪🇺 EUR", "🇻🇪 VES"].map((item) => (
                    <div key={item} className="bg-gray-100 rounded-lg px-3 py-2 text-center text-sm font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pagos de Terceros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  Pagos de Terceros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Puedes recibir pagos de terceros siempre que sean{" "}
                  <span className="font-semibold">familiares, amigos o clientes directos</span>. 
                  Esto nos ayuda a mantener la seguridad y cumplir con las regulaciones financieras internacionales.
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
                    Como medida de seguridad, las primeras operaciones tienen límites reducidos que aumentan 
                    progresivamente conforme realices más operaciones exitosas.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-800 font-medium">Verificación de identidad</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          Para montos mayores, podríamos solicitar verificación de identidad (KYC) 
                          para cumplir con regulaciones internacionales.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
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
                    mencionados anteriormente, incluyendo las políticas de privacidad y cumplimiento regulatorio.
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
                    Trabajamos con proveedores regulados como BITSO, BRIDGE y CRIXTO para garantizar 
                    la seguridad de tus operaciones. Si tienes alguna pregunta, contáctanos por WhatsApp.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleContinue}
            disabled={!termsAccepted}
            className="w-full text-white text-lg py-6 disabled:opacity-50 bg-primary hover:bg-primary/90"
          >
            Acepto y Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
