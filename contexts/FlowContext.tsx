"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { QuoteData, UserFormData, ThirdPartyData, OperationData } from "@/types/database"

interface FlowContextType {
  // Estado del flujo
  currentStep: string
  setCurrentStep: (step: string) => void

  // Tipo de flujo
  flowType: "normal" | "register" | "login"
  setFlowType: (type: "normal" | "register" | "login") => void

  // Datos de la cotización
  quote: QuoteData | null
  setQuote: (quote: QuoteData) => void

  // Datos del usuario
  user: UserFormData | null
  setUser: (user: UserFormData) => void

  // Datos del tercero
  thirdParty: ThirdPartyData | null
  setThirdParty: (thirdParty: ThirdPartyData | null) => void

  // Configuración del pago
  isThirdPartyPayment: boolean
  setIsThirdPartyPayment: (isThirdParty: boolean) => void

  // Operación actual
  operation: OperationData | null
  setOperation: (operation: OperationData | null) => void

  // Funciones de utilidad
  resetFlow: () => void
  isUserExisting: boolean
  setIsUserExisting: (existing: boolean) => void
}

const FlowContext = createContext<FlowContextType | undefined>(undefined)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStepState] = useState("calculator")
  const [flowType, setFlowType] = useState<"normal" | "register" | "login">("normal")

  const setCurrentStep = (step: string) => {
    setCurrentStepState(step)
    // Scroll al top cuando cambie de pantalla
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [user, setUser] = useState<UserFormData | null>(null)
  const [thirdParty, setThirdParty] = useState<ThirdPartyData | null>(null)
  const [isThirdPartyPayment, setIsThirdPartyPayment] = useState(false)
  const [operation, setOperation] = useState<OperationData | null>(null)
  const [isUserExisting, setIsUserExisting] = useState(false)

  const resetFlow = () => {
    setCurrentStep("calculator")
    setFlowType("normal")
    setQuote(null)
    setUser(null)
    setThirdParty(null)
    setIsThirdPartyPayment(false)
    setOperation(null)
    setIsUserExisting(false)
  }

  return (
    <FlowContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        flowType,
        setFlowType,
        quote,
        setQuote,
        user,
        setUser,
        thirdParty,
        setThirdParty,
        isThirdPartyPayment,
        setIsThirdPartyPayment,
        operation,
        setOperation,
        resetFlow,
        isUserExisting,
        setIsUserExisting,
      }}
    >
      {children}
    </FlowContext.Provider>
  )
}

export function useFlow() {
  const context = useContext(FlowContext)
  if (context === undefined) {
    throw new Error("useFlow must be used within a FlowProvider")
  }
  return context
}
