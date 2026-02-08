"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFlow } from "@/contexts/FlowContext"
import { checkUserExists } from "@/lib/database"
import { sendOperationEmail } from "@/lib/operation-emails"
import ProgressBar from "@/components/ProgressBar"

export default function EmailStep() {
  const { quote, setCurrentStep, setUser, setIsUserExisting, resetFlow } = useFlow()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleBack = () => {
    resetFlow()
  }

  const handleContinue = async () => {
    if (!email || !email.includes("@")) {
      setError("Por favor ingresa un email válido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const existingUser = await checkUserExists(email)

      if (existingUser) {
        // Usuario existente
        setIsUserExisting(true)
        setUser({
          email: existingUser.email,
          fullName: existingUser.full_name,
          phone: existingUser.phone,
          userType: existingUser.user_type || "persona",
          monthlyVolumeExpected: existingUser.monthly_volume_expected || 0,
          receivesThirdPartyPayments: existingUser.receives_third_party_payments,
          expectedThirdParties: existingUser.expected_third_parties,
          zelleAccount: existingUser.zelle_account,
          walletAddress: existingUser.wallet_address,
          pagomovil: existingUser.pagomovil_phone
            ? {
                phone: existingUser.pagomovil_phone,
                bank: existingUser.pagomovil_bank || "",
                accountHolder: existingUser.pagomovil_account_holder || "",
              }
            : undefined,
        })
      } else {
        // Usuario nuevo - enviar welcome email
        setIsUserExisting(false)
        const newUser = {
          email,
          fullName: "",
          phone: "",
          userType: "persona" as const,
          monthlyVolumeExpected: 0,
          receivesThirdPartyPayments: false,
          expectedThirdParties: 0,
        }
        setUser(newUser)

        // Enviar welcome email de forma asíncrona (sin bloquear el flujo)
        // Solo enviar si quote existe
        if (quote) {
          try {
            await sendOperationEmail("welcome", email, {
              operationId: "welcome",
              operationType: "welcome",
              user: newUser,
              quote,
              operation: {} as any,
            })
            console.log("[v0] Welcome email sent to:", email)
          } catch (emailError) {
            console.error("[v0] Error sending welcome email:", emailError)
            // No bloquear el flujo si el email falla
          }
        } else {
          console.log("[v0] Welcome email not sent - quote is missing")
        }
      }

      // Siempre ir a payment-type (tanto para USDT como Bolívares)
      setCurrentStep("payment-type")
    } catch (error) {
      console.error("Error checking user:", error)
      setError("Error al verificar el usuario. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleContinue()
    }
  }

  // Soporte global para ENTER
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !isLoading && email.includes("@")) {
        e.preventDefault()
        handleContinue()
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [email, isLoading])

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
              Confirma tu Email
            </h1>
            <p className="text-gray-600">Necesitamos tu email para identificar tu cuenta y procesar la operación</p>
          </div>

          {/* Resumen de la cotización */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Cotización Guardada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Envías</Label>
                  <p className="text-xl font-bold">${quote?.amount.toFixed(2)} USD</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Recibes</Label>
                  <p className="text-xl font-bold">
                    {quote?.result.toFixed(2)} {quote?.currency === "usdt" ? "USDT" : "VES"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de email */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      onKeyDown={handleKeyDown}
                      className="pl-10"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium">¿Por qué necesitamos tu email?</p>
                      <p className="text-blue-700 text-sm mt-1">
                        Tu email nos permite identificar si ya tienes una cuenta con nosotros y guardar tus datos de
                        forma segura para futuras operaciones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleContinue}
            disabled={!email || isLoading}
            className="w-full text-white text-lg py-6 disabled:opacity-50"
            style={{ backgroundColor: "#5B38B5" }}
          >
            {isLoading ? "Verificando..." : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
