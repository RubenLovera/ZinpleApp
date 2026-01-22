"use client"

import { CheckCircle } from "lucide-react"
import { useFlow } from "@/contexts/FlowContext"

interface Step {
  id: string
  title: string
  condition?: (context: any) => boolean
}

export default function ProgressBar() {
  const { currentStep, quote, isUserExisting, isThirdPartyPayment } = useFlow()

  // Definir los pasos del flujo unificado (sin términos separados)
  const allSteps: Step[] = [
    {
      id: "payment-type",
      title: "Tipo de Pago",
    },
    {
      id: "third-party-data",
      title: "Datos Tercero",
      condition: (ctx) => ctx.isThirdPartyPayment,
    },
    {
      id: "destination-data",
      title: quote?.currency === "usdt" ? "Wallet" : "Pagomóvil",
    },
    {
      id: "summary",
      title: "Resumen",
    },
    {
      id: "payment",
      title: "¡Listo!",
    },
  ]

  // Filtrar pasos basado en las condiciones actuales
  const context = { quote, isUserExisting, isThirdPartyPayment }
  const visibleSteps = allSteps.filter((step) => !step.condition || step.condition(context))

  // Encontrar el índice del paso actual
  // Mapear los IDs reales a los del flujo unificado
  const stepMapping: Record<string, string> = {
    "wallet-data": "destination-data",
    "pagomovil-data": "destination-data",
    "third-party-data": "third-party-data",
  }

  const mappedCurrentStep = stepMapping[currentStep] || currentStep
  const currentStepIndex = visibleSteps.findIndex((step) => step.id === mappedCurrentStep)
  const totalSteps = visibleSteps.length

  // Calcular el porcentaje de progreso
  const progressPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return "completed"
    if (stepIndex === currentStepIndex) return "active"
    return "pending"
  }

  // No mostrar antes del payment-type ni en user-data (pantalla opcional)
  if (currentStep === "calculator" || currentStep === "email" || currentStep === "user-data") {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        {/* Header simple */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">Creando tu operación</h2>
          <span className="text-sm text-gray-500">
            {currentStepIndex + 1} de {totalSteps}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: "#5B38B5",
            }}
          />
        </div>

        {/* Pasos - Solo en desktop */}
        <div className="hidden md:flex items-center justify-between">
          {visibleSteps.map((step, index) => {
            const status = getStepStatus(index)
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      status === "completed"
                        ? "bg-green-500 text-white"
                        : status === "active"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {status === "completed" ? <CheckCircle className="w-3 h-3" /> : index + 1}
                  </div>
                  <p
                    className={`text-xs mt-1 text-center max-w-16 leading-tight ${
                      status === "active"
                        ? "text-purple-600 font-medium"
                        : status === "completed"
                          ? "text-green-600"
                          : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < visibleSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Paso actual - Solo en mobile */}
        <div className="md:hidden text-center">
          <div className="inline-flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
              {currentStepIndex + 1}
            </div>
            <span className="text-sm font-medium text-purple-600">{visibleSteps[currentStepIndex]?.title}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
