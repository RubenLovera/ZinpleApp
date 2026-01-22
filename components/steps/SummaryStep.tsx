"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, DollarSign, Wallet, Smartphone, User, Users, AlertTriangle, Edit, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useFlow } from "@/contexts/FlowContext"
import { createOperationViaAPI } from "@/lib/database-api"
import { generateOperationId } from "@/lib/database"
import type { OperationData, QuoteData } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"

export default function SummaryStep() {
  const { quote, user, thirdParty, isThirdPartyPayment, setOperation, setCurrentStep, isUserExisting, setQuote } =
    useFlow()
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [isEditingAmount, setIsEditingAmount] = useState(false)
  const [editAmount, setEditAmount] = useState(quote?.amount.toString() || "")
  const [hasAutoAdjusted, setHasAutoAdjusted] = useState(false)

  // Auto-ajustar el monto a $10 si es necesario
  useEffect(() => {
    if (!quote || !user || hasAutoAdjusted) return

    const needsLimitAdjustment = (!isUserExisting || isThirdPartyPayment) && quote.amount > 10

    if (needsLimitAdjustment) {
      // Recalcular cotización con $10
      let newResult: number
      if (quote.currency === "usdt") {
        // USDT: monto - 9%
        newResult = 10 * 0.91
      } else {
        // Bolívares: (monto - 8%) * 125
        newResult = 10 * 0.92 * 125
      }

      const adjustedQuote: QuoteData = {
        ...quote,
        amount: 10,
        result: newResult,
      }

      setQuote(adjustedQuote)
      setHasAutoAdjusted(true)
    }
  }, [quote, user, isUserExisting, isThirdPartyPayment, hasAutoAdjusted, setQuote])

  const handleBack = () => {
    if (isThirdPartyPayment) {
      setCurrentStep("third-party-data")
    } else if (quote?.currency === "usdt") {
      setCurrentStep("wallet-data")
    } else {
      setCurrentStep("pagomovil-data")
    }
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

    // Validar límites
    const maxAmount = !isUserExisting || isThirdPartyPayment ? 10 : 1000
    if (newAmount > maxAmount) {
      setError(`El monto máximo permitido es $${maxAmount} USD`)
      return
    }

    if (newAmount < 1) {
      setError("El monto mínimo es $1 USD")
      return
    }

    // Recalcular cotización
    let newResult: number
    if (quote.currency === "usdt") {
      // USDT: monto - 9%
      newResult = newAmount * 0.91
    } else {
      // Bolívares: (monto - 8%) * 125
      newResult = newAmount * 0.92 * 125
    }

    const newQuote: QuoteData = {
      ...quote,
      amount: newAmount,
      result: newResult,
    }

    setQuote(newQuote)
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
        id: generateOperationId(),
        quote,
        user,
        thirdParty: isThirdPartyPayment ? thirdParty : undefined,
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

      // Manejar errores específicos de límites del servidor
      if (error.message.includes("limit") || error.message.includes("límite")) {
        setError(error.message)
      } else {
        setError(`Error al crear la operación: ${error.message || "Error desconocido"}`)
      }
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
            <h1 className="text-3xl font-bold mb-4" style={{ color: "#5B38B5" }}>
              Error
            </h1>
            <p className="text-gray-600 mb-6">No se encontraron los datos necesarios.</p>
            <Button onClick={() => window.location.reload()}>Volver al Inicio</Button>
          </div>
        </div>
      </div>
    )
  }

  // Determinar si se necesita mostrar el ajuste automático
  const needsLimitAdjustment = (!isUserExisting || isThirdPartyPayment) && hasAutoAdjusted

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
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#5B38B5" }}>
              Resumen de la Operación
            </h1>
            <p className="text-gray-600">Revisa todos los datos antes de crear tu operación</p>
          </div>

          {/* Mensaje de ajuste automático */}
          {needsLimitAdjustment && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">✅ Monto Ajustado Automáticamente</h3>
                    <p className="text-blue-700 mb-3">
                      Hemos ajustado tu operación a <span className="font-bold">$10.00 USD</span> por las siguientes
                      razones de seguridad:
                    </p>
                    <ul className="text-blue-700 space-y-2 text-sm">
                      {!isUserExisting && (
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>
                            <strong>Usuario nuevo:</strong> Tu primera operación tiene un límite de $10 USD por
                            seguridad
                          </span>
                        </li>
                      )}
                      {isThirdPartyPayment && (
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>
                            <strong>Pago de tercero:</strong> Los pagos de terceros tienen un límite de $10 USD para la
                            primera operación
                          </span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>
                          <strong>Límites progresivos:</strong> Este límite aumentará automáticamente con operaciones
                          exitosas
                        </span>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-blue-800 text-sm font-medium">
                        💡 No te preocupes: Después de esta primera operación exitosa, podrás realizar operaciones por
                        montos mayores.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Resumen de la cotización */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cotización
                  {needsLimitAdjustment && (
                    <span className="text-blue-600 text-sm font-normal">(Ajustada por seguridad)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Monto a enviar - editable solo si no hay límites */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envías:</span>
                  {isEditingAmount && !needsLimitAdjustment ? (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          type="text"
                          value={editAmount}
                          onChange={handleAmountChange}
                          onKeyDown={handleAmountKeyDown}
                          className="w-24 pl-6 pr-8 text-right"
                          placeholder="10"
                          autoFocus
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          USD
                        </span>
                      </div>
                      <Button size="sm" onClick={handleSaveAmount} className="h-8 w-8 p-0">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">${quote.amount.toFixed(2)} USD</span>
                      {!needsLimitAdjustment && (
                        <Button size="sm" variant="ghost" onClick={handleEditAmount} className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Recibes:</span>
                  <span className="text-xl font-bold">
                    {quote.result.toFixed(2)} {quote.currency === "usdt" ? "USDT" : "VES"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Tasa de cambio:</span>
                  <span className="text-gray-700">
                    1 USD = {quote.currency === "usdt" ? "1 USDT" : `${quote.exchangeRate} VES`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Comisión:</span>
                  <span className="text-gray-700">{(quote.commissionRate * 100).toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>

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
                <div>
                  <span className="text-gray-600 text-sm">Estado:</span>
                  <p className={`font-medium ${isUserExisting ? "text-green-600" : "text-orange-600"}`}>
                    {isUserExisting ? "Usuario Existente" : "Usuario Nuevo (Límite $10)"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Datos de recepción */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {quote.currency === "usdt" ? <Wallet className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  {quote.currency === "usdt" ? "Wallet USDT" : "Pagomóvil"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quote.currency === "usdt" ? (
                  <div>
                    <span className="text-gray-600 text-sm">Dirección:</span>
                    <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">{user.walletAddress}</p>
                    <p className="text-xs text-gray-500 mt-1">Red: Polygon</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-600 text-sm">Número:</span>
                      <p className="font-medium">{user.pagomovil?.phone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Banco:</span>
                      <p className="font-medium capitalize">{user.pagomovil?.bank}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">Titular:</span>
                      <p className="font-medium">{user.pagomovil?.accountHolder}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                  <div>
                    <span className="text-gray-600 text-sm">Estado:</span>
                    <p className="font-medium text-orange-600">Tercero Nuevo (Límite $10)</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Advertencias adicionales */}
          <div className="mt-6 space-y-4">
            {quote.currency === "usdt" && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium">⚠️ Verificación de Wallet</p>
                      <p className="text-red-700 text-sm mt-1">
                        Verifica que la dirección de wallet sea correcta. Los fondos enviados a una dirección incorrecta
                        se perderán permanentemente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Error */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error al crear la operación</p>
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
              className="w-full text-white text-lg py-6 disabled:opacity-50"
              style={{ backgroundColor: "#5B38B5" }}
            >
              {isCreating ? "Creando Operación..." : isEditingAmount ? "Guarda el Monto Primero" : "Crear Operación"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
