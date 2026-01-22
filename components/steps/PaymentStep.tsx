"use client"

import { useState, useEffect } from "react"
import { CheckCircle, MessageCircle, Copy, Clock, DollarSign, AlertTriangle, RefreshCw, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import ProgressBar from "@/components/ProgressBar"

export default function PaymentStep() {
  const { quote, user, thirdParty, operation, isThirdPartyPayment, resetFlow } = useFlow()
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutos en segundos
  const [copied, setCopied] = useState<string | null>(null)

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
    if (!quote || !user || !operation) return

    const payerName = isThirdPartyPayment ? thirdParty?.name : user.fullName
    const payerPhone = isThirdPartyPayment ? thirdParty?.phone : user.phone
    const currency = quote.currency === "usdt" ? "USDT" : "Bolívares"

    // Construir datos de destino según la moneda
    let destinationData = ""
    if (quote.currency === "usdt") {
      destinationData = `Wallet USDT POLYGON: ${user.walletAddress}`
    } else {
      destinationData = `Datos Pagomóvil:
• Número: ${user.pagomovil?.phone}
• Banco: ${user.pagomovil?.bank?.toUpperCase()}
• Titular: ${user.pagomovil?.accountHolder}
• Cédula: ${user.pagomovil?.cedula}`
    }

    // Construir datos del pagador
    const payerData = isThirdPartyPayment
      ? `Datos del Pagador (Tercero):
• Nombre: ${thirdParty?.name}
• Teléfono: ${thirdParty?.phone}
• Email: ${thirdParty?.email}`
      : `Datos del Pagador:
• Nombre: ${user.fullName}
• Teléfono: ${user.phone}
• Email: ${user.email}`

    const message = `✅ *TRANSACCIÓN EN PROCESO*

Ya he enviado los fondos en ZELLE a la cuenta asignada por ZinpleApp, estos son los datos de mi operación:

📋 *DATOS DE LA OPERACIÓN*
• ID de transacción: *${operation.id}*
• Monto enviado en USD: *$${quote.amount.toFixed(2)}*
• Monto a recibir en ${currency}: *${quote.result.toFixed(2)}*

👤 *TITULAR DE LA CUENTA*
• Nombre: ${user.fullName}
• Email: ${user.email}

💰 *${payerData}*

🎯 *DATOS DE DESTINO PARA ${currency.toUpperCase()}*
${destinationData}

📎 Adjunto el comprobante de pago a este mensaje.

Por favor confirmen la recepción del pago para procesar mi ${currency}.`

    const whatsappUrl = `https://wa.me/12138245415?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const handleNewOperation = () => {
    resetFlow()
  }

  // Datos de Zelle de ZinpleApp
  const zelleData = {
    email: "sonderenter@gmail.com",
    titular: "SONDERENTER INC",
    tipo: "CORPORATIVA",
  }

  if (!quote || !user || !operation) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4" style={{ color: "#5B38B5" }}>
              Error
            </h1>
            <p className="text-gray-600 mb-6">No se encontraron los datos de la operación.</p>
            <Button onClick={handleNewOperation}>Crear Nueva Operación</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Header de éxito */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#5B38B5" }}>
              ¡Operación Creada!
            </h1>
            <p className="text-gray-600">Ahora realiza el pago para completar tu operación</p>
          </div>

          {/* Timer */}
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

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Datos de Zelle de ZinpleApp */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Building className="w-5 h-5" />
                  Datos de Zelle - ZinpleApp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Zelle ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-green-900">{zelleData.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(zelleData.email, "zelle-email")}
                      className="h-6 w-6 p-0"
                    >
                      {copied === "zelle-email" ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Titular:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-900">{zelleData.titular}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(zelleData.titular, "titular")}
                      className="h-6 w-6 p-0"
                    >
                      {copied === "titular" ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Tipo:</span>
                  <span className="font-bold text-green-900">{zelleData.tipo}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Monto a enviar:</span>
                  <span className="text-2xl font-bold text-green-900">${quote.amount.toFixed(2)} USD</span>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de la operación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Detalles de tu Operación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID de Operación:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{operation.id}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(operation.id, "id")}
                      className="h-6 w-6 p-0"
                    >
                      {copied === "id" ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recibirás:</span>
                  <span className="text-xl font-bold">
                    {quote.result.toFixed(2)} {quote.currency === "usdt" ? "USDT" : "VES"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pagador:</span>
                  <span className="font-medium">{isThirdPartyPayment ? thirdParty?.name : user.fullName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Estado:</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Pendiente de Pago
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Datos de destino */}
          <Card className="mt-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                📍 Datos de Destino - {quote.currency === "usdt" ? "Wallet USDT" : "Pagomóvil"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quote.currency === "usdt" ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-700 font-medium">Red:</span>
                    <span className="font-bold text-blue-900">Polygon</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-blue-700 font-medium">Dirección:</span>
                    <div className="flex items-center gap-2 max-w-xs">
                      <span className="font-mono text-sm text-blue-900 break-all">{user.walletAddress}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(user.walletAddress || "", "wallet")}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        {copied === "wallet" ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Número:</span>
                    <p className="font-bold text-blue-900">{user.pagomovil?.phone}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Banco:</span>
                    <p className="font-bold text-blue-900 capitalize">{user.pagomovil?.bank}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Titular:</span>
                    <p className="font-bold text-blue-900">{user.pagomovil?.accountHolder}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium text-sm">Cédula:</span>
                    <p className="font-bold text-blue-900">{user.pagomovil?.cedula}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instrucciones paso a paso */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Instrucciones para Completar tu Operación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Realiza el pago por Zelle</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {isThirdPartyPayment ? `${thirdParty?.name} debe enviar` : "Envía"} ${quote.amount.toFixed(2)} USD
                      a la cuenta Zelle de ZinpleApp mostrada arriba
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Guarda el comprobante</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Toma captura de pantalla del comprobante de pago de Zelle
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Envía el comprobante por WhatsApp</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Haz clic en el botón de WhatsApp y envía el comprobante. El mensaje incluirá automáticamente todos
                      los datos necesarios para procesar tu {quote.currency === "usdt" ? "USDT" : "Bolívares"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Recibe tus fondos al instante</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Una vez confirmado el comprobante, recibirás tus{" "}
                      {quote.currency === "usdt" ? "USDT" : "Bolívares"} inmediatamente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advertencias importantes */}
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Importante</p>
                  <ul className="text-red-700 text-sm mt-2 space-y-1">
                    <li>• El pago debe realizarse exactamente por ${quote.amount.toFixed(2)} USD</li>
                    <li>• Usa los datos de Zelle mostrados arriba (sonderenter@gmail.com)</li>
                    <li>• Tienes 30 minutos para completar el pago</li>
                    <li>
                      • Guarda el ID de operación: <strong>{operation.id}</strong>
                    </li>
                    <li>• El mensaje de WhatsApp incluirá automáticamente todos los datos necesarios</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="mt-8 space-y-4">
            <Button
              onClick={handleWhatsAppContact}
              className="w-full text-white text-lg py-6"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Enviar Comprobante por WhatsApp
            </Button>

            <Button variant="outline" onClick={handleNewOperation} className="w-full text-lg py-6">
              <RefreshCw className="w-5 h-5 mr-2" />
              Crear Nueva Operación
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
