'use client';

import { useState, useEffect } from "react"
import { CheckCircle, MessageCircle, Copy, Clock, AlertTriangle, RefreshCw, Send, Download, Wallet, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import { getCurrencyInfo, type OperationMode } from "@/types/database"
import { generateWhatsAppMessage } from "@/lib/utils"
import PaymentInstructions from "@/components/PaymentInstructions"
import ProgressBar from "@/components/ProgressBar"

export default function PaymentStep() {
  const { quote, user, beneficiary, sender, thirdParty, operation, isThirdPartyPayment, resetFlow, operationMode } = useFlow()
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutos en segundos
  const [copied, setCopied] = useState<string | null>(null)

  // Obtener información de las monedas
  const sourceCurrency = quote ? getCurrencyInfo(quote.sourceCurrency) : null
  const destCurrency = quote ? getCurrencyInfo(quote.destinationCurrency) : null

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  const handleWhatsAppContact = () => {
    if (!quote || !user || !operation || !operationMode) return

    // Generar el mensaje usando la función helper
    const message = generateWhatsAppMessage(
      operationMode as OperationMode,
      quote,
      user,
      beneficiary,
      sender,
      operation,
      user.walletAddress, // Para buy_usdt y si aplica
      "Polygon" // Red fija (solo Polygon soportado)
    )

    const whatsappUrl = `https://wa.me/56956413113?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleShareLink = () => {
    if (!operation) return
    
    // Generar link de pago para compartir (modo receive)
    const paymentLink = `${window.location.origin}/pay/${operation.id}`
    navigator.clipboard.writeText(paymentLink)
    setCopied("link")
    setTimeout(() => setCopied(null), 2000)
  }

  const handleNewOperation = () => {
    resetFlow()
  }

  if (!quote || !user || !operation || !operationMode) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-primary">
              Error
            </h1>
            <p className="text-gray-600 mb-6">No se encontraron los datos de la operación.</p>
            <Button onClick={handleNewOperation}>Crear Nueva Operación</Button>
          </div>
        </div>
      </div>
    )
  }

  // Título e icono según el modo
  const getModeInfo = () => {
    switch (operationMode) {
      case "send":
        return { 
          title: "Operación de Envío Creada", 
          icon: <Send className="w-8 h-8" />, 
          bgClass: "bg-blue-100",
          textClass: "text-blue-600"
        }
      case "receive":
        return { 
          title: "Solicitud de Pago Creada", 
          icon: <Download className="w-8 h-8" />, 
          bgClass: "bg-green-100",
          textClass: "text-green-600"
        }
      case "buy_usdt":
        return { 
          title: "Orden de Compra Creada", 
          icon: <Wallet className="w-8 h-8" />, 
          bgClass: "bg-purple-100",
          textClass: "text-purple-600"
        }
      case "sell_usdt":
        return { 
          title: "Orden de Venta Creada", 
          icon: <Wallet className="w-8 h-8" />, 
          bgClass: "bg-orange-100",
          textClass: "text-orange-600"
        }
      default:
        return { 
          title: "Operación Creada", 
          icon: <CheckCircle className="w-8 h-8" />, 
          bgClass: "bg-green-100",
          textClass: "text-green-600"
        }
    }
  }

  const modeInfo = getModeInfo()

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header de éxito */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 ${modeInfo.bgClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <div className={modeInfo.textClass}>{modeInfo.icon}</div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-primary">
              {modeInfo.title}
            </h1>
            <p className="text-gray-600">
              {operationMode === "receive" 
                ? "Comparte el link de pago con tu remitente" 
                : "Ahora realiza el pago para completar tu operación"}
            </p>
          </div>

          {/* Timer (solo para modos que requieren pago) */}
          {operationMode !== "receive" && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div className="text-center">
                    <p className="text-orange-800 font-medium">Tiempo para completar el pago</p>
                    <p className="text-2xl font-bold text-orange-900">{formatTime(timeLeft)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ID de operación */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ID de Operación</p>
                  <p className="font-mono font-bold text-lg">{operation.id}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(operation.id, "id")}
                >
                  {copied === "id" ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumen de la operación */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sourceCurrency?.flag}</span>
                  <div>
                    <p className="text-sm text-gray-600">
                      {operationMode === "receive" ? "Remitente envía" : "Envías"}
                    </p>
                    <p className="font-bold text-lg">
                      {sourceCurrency?.symbol}{quote.amount.toLocaleString()} {quote.sourceCurrency}
                    </p>
                  </div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {operationMode === "receive" ? "Recibes" : "Beneficiario recibe"}
                    </p>
                    <p className="font-bold text-lg text-primary">
                      {destCurrency?.symbol}{quote.result.toLocaleString()} {quote.destinationCurrency}
                    </p>
                  </div>
                  <span className="text-2xl">{destCurrency?.flag}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instrucciones de pago (solo para modos que requieren pago) */}
          {operationMode !== "receive" && (
            <div className="mb-6">
              <PaymentInstructions 
                currency={quote.sourceCurrency} 
                amount={quote.amount}
              />
            </div>
          )}

          {/* Link de pago para compartir (modo receive) */}
          {operationMode === "receive" && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Share2 className="w-5 h-5" />
                  Link de Pago para Compartir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-green-700">
                  Comparte este link con <strong>{sender?.fullName}</strong> para que pueda realizar el pago desde {sender?.country}.
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white p-3 rounded-lg border border-green-300 font-mono text-sm truncate">
                    {window.location.origin}/pay/{operation.id}
                  </div>
                  <Button onClick={handleShareLink} className="bg-green-600 hover:bg-green-700">
                    {copied === "link" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-green-600">
                  Una vez que el remitente complete el pago, recibirás tus fondos automáticamente.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Instrucciones paso a paso */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Siguientes Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operationMode === "receive" ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Copia el link de pago</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Usa el botón de arriba para copiar el link
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Comparte con {sender?.fullName}</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Envía el link por WhatsApp, email o cualquier medio
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Espera el pago</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Tu remitente verá los datos de pago en el link
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Recibe automáticamente</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Una vez confirmado el pago, recibirás tus fondos automáticamente por Pago Móvil.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Realiza el pago</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Envía exactamente {sourceCurrency?.symbol}{quote.amount.toLocaleString()} {quote.sourceCurrency} a los datos indicados arriba
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Guarda el comprobante</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Toma captura de pantalla del comprobante de pago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Envía por WhatsApp</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Usa el botón de abajo para enviar el comprobante con todos los datos
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-primary text-sm font-bold">4</span>
                      </div>
                      <div>
                        <p className="font-medium">Recibe tus fondos</p>
                        <p className="text-gray-600 text-sm mt-1">
                          Una vez confirmado, procesamos tu {quote.destinationCurrency} inmediatamente
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Advertencias importantes */}
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Importante</p>
                  <ul className="text-red-700 text-sm mt-2 space-y-1">
                    <li>El pago debe realizarse exactamente por {sourceCurrency?.symbol}{quote.amount.toLocaleString()} {quote.sourceCurrency}</li>
                    <li>Guarda el ID de operación: <strong>{operation.id}</strong></li>
                    {operationMode !== "receive" && (
                      <li>Tienes 30 minutos para completar el pago</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="space-y-4">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full text-white text-lg py-6"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {operationMode === "receive" ? "Contactar Soporte" : "Enviar Comprobante por WhatsApp"}
            </Button>

            <Button variant="outline" onClick={handleNewOperation} className="w-full text-lg py-6 bg-transparent">
              <RefreshCw className="w-5 h-5 mr-2" />
              Crear Nueva Operación
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
