"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Mail, X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MaintenanceBannerProps {
  onClose: () => void
}

export default function MaintenanceBanner({ onClose }: MaintenanceBannerProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setError("Por favor ingresa un email válido")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Aquí puedes agregar la lógica para guardar el email
      // Por ahora simularemos una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSubmitted(true)

      // Auto cerrar después de 3 segundos
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      setError("Error al guardar el email. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-bold mb-2 text-green-700">¡Listo!</h3>
            <p className="text-gray-600 mb-4">Te notificaremos por email cuando el mantenimiento haya finalizado.</p>
            <p className="text-sm text-gray-500">Esta ventana se cerrará automáticamente...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[99999] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl font-bold text-orange-700">Mantenimiento en Progreso</CardTitle>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
            <p className="text-orange-800 font-medium mb-2">Estamos realizando mejoras en nuestra plataforma</p>
            <p className="text-orange-700 text-sm">
              Temporalmente no podemos procesar nuevas operaciones. Estamos trabajando para volver lo antes posible.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-gray-900">¿Quieres que te notifiquemos cuando esté listo?</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError("")
                    }}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={!email || isSubmitting}
                className="w-full text-white"
                style={{ backgroundColor: "#5B38B5" }}
              >
                {isSubmitting ? "Guardando..." : "Notificarme"}
              </Button>
            </form>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              También puedes contactarnos por{" "}
              <a
                href="https://wa.me/12138245415"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                WhatsApp
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
