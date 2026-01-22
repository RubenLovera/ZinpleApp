"use client"

import { useState } from "react"
import { ArrowLeft, Wallet, AlertTriangle, CheckCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFlow } from "@/contexts/FlowContext"
import ProgressBar from "@/components/ProgressBar"

export default function WalletDataStep() {
  const { user, setUser, setCurrentStep, isThirdPartyPayment, isUserExisting, thirdParty } = useFlow()
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || "")
  const [error, setError] = useState("")

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

  const handleContinue = () => {
    if (!walletAddress.trim()) {
      setError("Por favor ingresa la dirección de wallet")
      return
    }

    if (!walletAddress.startsWith("0x") || walletAddress.length !== 42) {
      setError("Por favor ingresa una dirección de wallet válida (debe empezar con 0x y tener 42 caracteres)")
      return
    }

    // Actualizar los datos del usuario
    if (user) {
      setUser({
        ...user,
        walletAddress: walletAddress.trim(),
      })
    }

    setCurrentStep("summary")
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setWalletAddress(text)
      setError("")
    } catch (err) {
      console.error("Error al pegar:", err)
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
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#5B38B5" }}>
              Wallet USDT de Destino
            </h1>
            <p className="text-gray-600">Ingresa la dirección de wallet donde recibirás los USDT</p>
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
                      <strong>{thirdParty.name}</strong> realizará el pago con Zelle, y los USDT se enviarán a la wallet
                      que ingreses a continuación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Wallet USDT - Red Polygon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wallet">Dirección de Wallet *</Label>
                <div className="relative mt-1">
                  <Input
                    id="wallet"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => {
                      setWalletAddress(e.target.value)
                      setError("")
                    }}
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Pegar
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Puede ser tu wallet o la de otra persona</p>
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
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
                  <p className="text-red-800 font-medium">⚠️ IMPORTANTE - Lee cuidadosamente</p>
                  <ul className="text-red-700 text-sm mt-2 space-y-1">
                    <li>
                      • <strong>Red Polygon únicamente:</strong> Asegúrate de que sea una dirección USDT en la red
                      Polygon
                    </li>
                    <li>
                      • <strong>Verificación obligatoria:</strong> Revisa la dirección varias veces antes de continuar
                    </li>
                    <li>
                      • <strong>Pérdida de fondos:</strong> Si la dirección es incorrecta, los fondos se perderán
                      permanentemente
                    </li>
                    <li>
                      • <strong>No soporte para otras redes:</strong> No enviamos USDT en Ethereum, BSC u otras redes
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información sobre Polygon */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">¿Qué es la red Polygon?</p>
                  <p className="text-blue-700 text-sm mt-1">
                    Polygon es una red blockchain que permite transacciones más rápidas y económicas. Wallets
                    compatibles incluyen MetaMask, Trust Wallet, y la mayoría de wallets modernas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleContinue}
            disabled={!walletAddress.trim()}
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
