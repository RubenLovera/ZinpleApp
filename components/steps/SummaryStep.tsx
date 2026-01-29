"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, DollarSign, Wallet, Smartphone, User, Users, AlertTriangle, Edit, Check, X, Globe, Send, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useFlow } from "@/contexts/FlowContext"
import { createOperationViaAPI } from "@/lib/database-api"
import type { OperationData } from "@/types/database"
import { getCurrencyInfo, CURRENCY_PAIRS } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"
import { generateOperationId } from "@/lib/utils" // Import generateOperationId

export default function SummaryStep() {
  const { 
    quote, 
    user, 
    beneficiary,
    sender,
    thirdParty, 
    isThirdPartyPayment, 
    setOperation, 
    setCurrentStep, 
    isUserExisting, 
    setQuote,
    operationMode,
    getPreviousStep 
  } = useFlow()
  
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [isEditingAmount, setIsEditingAmount] = useState(false)
  const [editAmount, setEditAmount] = useState(quote?.amount.toString() || "")

  // Obtener información de las monedas
  const sourceCurrency = quote ? getCurrencyInfo(quote.sourceCurrency) : null
  const destCurrency = quote ? getCurrencyInfo(quote.destinationCurrency) : null

  const handleBack = () => {
    setCurrentStep(getPreviousStep("summary"))
  }

  const handleEditAmount = () => {
    setIsEditingAmount(true)
    setEditAmount(quote?.amount.toString() || "")
  }

  const handleCancelEdit = () => {
    setIsEditingAmount(false)
    setEditAmount(quote?.amount.toString() || "")
  }

  const handleSaveAmount = () => {
    if (!quote) return

    const newAmount = Number.parseFloat(editAmount)

    // Validar que sea un número válido
    if (isNaN(newAmount) || newAmount <= 0) {
      setError("Por favor ingresa un monto válido")
      return
    }

    // Validar límites según el par de divisas
    const pairConfig = CURRENCY_PAIRS[quote.currencyPair]
    if (newAmount < pairConfig.minAmount) {
      setError(`El monto mínimo es ${sourceCurrency?.symbol}${pairConfig.minAmount} ${quote.sourceCurrency}`)
      return
    }
    if (newAmount > pairConfig.maxAmount) {
      setError(`El monto máximo es ${sourceCurrency?.symbol}${pairConfig.maxAmount} ${quote.sourceCurrency}`)
      return
    }

    // Recalcular cotización
    const commission = newAmount * pairConfig.commission
    const netAmount = newAmount - commission
    const newResult = netAmount * pairConfig.rate

    setQuote({
      ...quote,
      amount: newAmount,
      result: newResult,
    })
    setIsEditingAmount(false)
    setError("")
  }

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveAmount()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Solo permitir números y punto decimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setEditAmount(value)
    }
  }

  const handleCreateOperation = async () => {
    if (!quote || !user) {
      setError("Faltan datos para crear la operación")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      const operationData: OperationData = {
        id: generateOperationId(), // Use generateOperationId
        operationMode: operationMode || "send",
        quote,
        user,
        beneficiary: operationMode === "send" ? beneficiary ?? undefined : undefined,
        sender: operationMode === "receive" ? sender ?? undefined : undefined,
        thirdParty: isThirdPartyPayment ? thirdParty ?? undefined : undefined,
        isThirdPartyPayment,
      }

      console.log("Creating operation with data:", JSON.stringify(operationData, null, 2))

      const operation = await createOperationViaAPI(operationData)

      if (operation) {
        setOperation(operationData)
        setCurrentStep("payment")
      } else {
        setError("Error al crear la operación. No se recibió respuesta válida.")
      }
    } catch (error: any) {
      console.error("Error creating operation:", error)
      setError(`Error al crear la operación: ${error.message || "Error desconocido"}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Soporte para ENTER en el botón principal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isEditingAmount && !isCreating && quote && user) {
        e.preventDefault()
        handleCreateOperation()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isEditingAmount, isCreating, quote, user])

  if (!quote || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-primary">
              Error
            </h1>
            <p className="text-gray-600 mb-6">No se encontraron los datos necesarios.</p>
            <Button onClick={() => window.location.reload()}>Volver al Inicio</Button>
          </div>
        </div>
      </div>
    )
  }

  // Título según el modo de operación
  const getModeTitle = () => {
    switch (operationMode) {
      case "send":
        return { title: "Resumen de Envío", icon: <Send className="w-5 h-5" /> }
      case "receive":
        return { title: "Resumen de Recepción", icon: <Download className="w-5 h-5" /> }
      case "buy_usdt":
        return { title: "Resumen de Compra USDT", icon: <Wallet className="w-5 h-5" /> }
      case "sell_usdt":
        return { title: "Resumen de Venta USDT", icon: <Wallet className="w-5 h-5" /> }
      default:
        return { title: "Resumen de la Operación", icon: <DollarSign className="w-5 h-5" /> }
    }
  }

  const modeInfo = getModeTitle()

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar />
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleBack} className="mb-4" disabled={isCreating}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {modeInfo.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  {modeInfo.title}
                </h1>
                <p className="text-gray-600">Revisa todos los datos antes de confirmar</p>
              </div>
            </div>
          </div>

          {/* Resumen de la cotización */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{sourceCurrency?.flag}</span>
                  <div>
                    <p className="text-sm text-gray-600">
                      {operationMode === "receive" ? "Remitente envía" : "Envías"}
                    </p>
                    {isEditingAmount ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {sourceCurrency?.symbol}
                          </span>
                          <Input
                            type="text"
                            value={editAmount}
                            onChange={handleAmountChange}
                            onKeyDown={handleAmountKeyDown}
                            className="w-32 pl-6 pr-2 text-right"
                            autoFocus
                          />
                        </div>
                        <Button size="sm" onClick={handleSaveAmount} className="h-8 w-8 p-0">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 w-8 p-0 bg-transparent">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-2xl">
                          {sourceCurrency?.symbol}{quote.amount.toLocaleString()} {quote.sourceCurrency}
                        </p>
                        <Button size="sm" variant="ghost" onClick={handleEditAmount} className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-3xl text-gray-400">→</div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {operationMode === "receive" ? "Recibes" : "Beneficiario recibe"}
                    </p>
                    <p className="font-bold text-2xl text-primary">
                      {destCurrency?.symbol}{quote.result.toLocaleString()} {quote.destinationCurrency}
                    </p>
                  </div>
                  <span className="text-3xl">{destCurrency?.flag}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between text-sm text-gray-600">
                <span>Tasa: 1 {quote.sourceCurrency} = {quote.exchangeRate} {quote.destinationCurrency}</span>
                <span>Comisión: {(quote.commissionRate * 100).toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Datos del usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Tu Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-gray-600 text-sm">Nombre:</span>
                  <p className="font-medium">{user.fullName}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Email:</span>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Teléfono:</span>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Datos del beneficiario (modo send) */}
            {operationMode === "send" && beneficiary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Beneficiario en {destCurrency?.country}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Nombre:</span>
                    <p className="font-medium">{beneficiary.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Teléfono:</span>
                    <p className="font-medium">{beneficiary.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Relación:</span>
                    <p className="font-medium capitalize">{beneficiary.relationship}</p>
                  </div>
                  {beneficiary.pagomovil && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600 text-sm">Pago Móvil:</span>
                      <p className="font-medium">0{beneficiary.pagomovil.phone} - {beneficiary.pagomovil.bank}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Datos del remitente (modo receive) */}
            {operationMode === "receive" && sender && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Remitente desde {sender.country}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Nombre:</span>
                    <p className="font-medium">{sender.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Teléfono:</span>
                    <p className="font-medium">{sender.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Relación:</span>
                    <p className="font-medium capitalize">{sender.relationship}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Datos de recepción (crypto) */}
            {(operationMode === "buy_usdt" || operationMode === "sell_usdt") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {operationMode === "buy_usdt" ? (
                      <><Wallet className="w-5 h-5" /> Wallet USDT</>
                    ) : (
                      <><Smartphone className="w-5 h-5" /> Pago Móvil</>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {operationMode === "buy_usdt" && user.walletAddress && (
                    <>
                      <div>
                        <span className="text-gray-600 text-sm">Red:</span>
                        <p className="font-medium">Polygon</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Dirección:</span>
                        <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">{user.walletAddress}</p>
                      </div>
                    </>
                  )}
                  {operationMode === "sell_usdt" && user.pagomovil && (
                    <>
                      <div>
                        <span className="text-gray-600 text-sm">Número:</span>
                        <p className="font-medium">0{user.pagomovil.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Banco:</span>
                        <p className="font-medium capitalize">{user.pagomovil.bank}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Titular:</span>
                        <p className="font-medium">{user.pagomovil.accountHolder}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Datos del tercero (si aplica) */}
            {isThirdPartyPayment && thirdParty && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Tercero que Paga
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Nombre:</span>
                    <p className="font-medium">{thirdParty.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Teléfono:</span>
                    <p className="font-medium">{thirdParty.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Email:</span>
                    <p className="font-medium">{thirdParty.email}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Advertencias */}
          {operationMode === "buy_usdt" && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Verificación de Wallet</p>
                    <p className="text-red-700 text-sm mt-1">
                      Verifica que la dirección de wallet sea correcta. Los fondos enviados a una dirección incorrecta
                      se perderán permanentemente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botón de confirmación */}
          <div className="mt-8">
            <Button
              onClick={handleCreateOperation}
              disabled={isCreating || isEditingAmount}
              className="w-full text-white text-lg py-6 disabled:opacity-50 bg-primary hover:bg-primary/90"
            >
              {isCreating ? "Creando Operación..." : isEditingAmount ? "Guarda el Monto Primero" : "Confirmar Operación"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
