"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { 
  QuoteData, 
  UserFormData, 
  ThirdPartyData, 
  OperationData,
  BeneficiaryData,
  SenderData,
  OperationMode 
} from "@/types/database"

interface FlowContextType {
  // Estado del flujo
  currentStep: string
  setCurrentStep: (step: string) => void

  // Tipo de flujo
  flowType: "normal" | "register" | "login"
  setFlowType: (type: "normal" | "register" | "login") => void

  // Modo de operación (send, receive, buy_usdt, sell_usdt)
  operationMode: OperationMode | null
  setOperationMode: (mode: OperationMode) => void

  // Datos de la cotización
  quote: QuoteData | null
  setQuote: (quote: QuoteData) => void

  // Datos del usuario
  user: UserFormData | null
  setUser: (user: UserFormData) => void

  // Datos del beneficiario (para enviar a Venezuela)
  beneficiary: BeneficiaryData | null
  setBeneficiary: (beneficiary: BeneficiaryData | null) => void

  // Datos del remitente (para recibir en Venezuela)
  sender: SenderData | null
  setSender: (sender: SenderData | null) => void

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

  // Helper para obtener el siguiente paso según el modo
  getNextStep: (currentStep: string) => string
  getPreviousStep: (currentStep: string) => string
}

const FlowContext = createContext<FlowContextType | undefined>(undefined)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStepState] = useState("calculator")
  const [flowType, setFlowType] = useState<"normal" | "register" | "login">("normal")
  const [operationMode, setOperationMode] = useState<OperationMode | null>(null)

  const setCurrentStep = (step: string) => {
    setCurrentStepState(step)
    // Scroll al top cuando cambie de pantalla
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [user, setUser] = useState<UserFormData | null>(null)
  const [beneficiary, setBeneficiary] = useState<BeneficiaryData | null>(null)
  const [sender, setSender] = useState<SenderData | null>(null)
  const [thirdParty, setThirdParty] = useState<ThirdPartyData | null>(null)
  const [isThirdPartyPayment, setIsThirdPartyPayment] = useState(false)
  const [operation, setOperation] = useState<OperationData | null>(null)
  const [isUserExisting, setIsUserExisting] = useState(false)

  const resetFlow = () => {
    setCurrentStep("calculator")
    setFlowType("normal")
    setOperationMode(null)
    setQuote(null)
    setUser(null)
    setBeneficiary(null)
    setSender(null)
    setThirdParty(null)
    setIsThirdPartyPayment(false)
    setOperation(null)
    setIsUserExisting(false)
  }

  // Definir el flujo de pasos según el modo de operación
  const getNextStep = (currentStep: string): string => {
    // Flujo para ENVIAR A VENEZUELA (send)
    if (operationMode === "send") {
      const sendFlow: Record<string, string> = {
        "calculator": "terms",
        "terms": "email",
        "email": "payment-type",
        "payment-type": isUserExisting ? "beneficiary-data" : "user-data",
        "user-data": "beneficiary-data",
        "beneficiary-data": "summary",
        "summary": "payment",
      }
      return sendFlow[currentStep] || "calculator"
    }

    // Flujo para RECIBIR EN VENEZUELA (receive)
    if (operationMode === "receive") {
      const receiveFlow: Record<string, string> = {
        "calculator": "terms",
        "terms": "email",
        "email": isUserExisting ? "sender-data" : "user-data",
        "user-data": "destination-data", // Datos del receptor (Venezuela)
        "destination-data": "sender-data", // Datos del remitente (exterior)
        "sender-data": "summary",
        "summary": "share-link", // Generar link para compartir
      }
      return receiveFlow[currentStep] || "calculator"
    }

    // Flujo para COMPRAR USDT (buy_usdt)
    if (operationMode === "buy_usdt") {
      const buyFlow: Record<string, string> = {
        "calculator": "terms",
        "terms": "email",
        "email": "payment-type",
        "payment-type": isUserExisting ? "wallet-data" : "user-data",
        "user-data": "wallet-data",
        "wallet-data": "summary",
        "summary": "payment",
      }
      return buyFlow[currentStep] || "calculator"
    }

    // Flujo para VENDER USDT (sell_usdt)
    if (operationMode === "sell_usdt") {
      const sellFlow: Record<string, string> = {
        "calculator": "terms",
        "terms": "email",
        "email": isUserExisting ? "pagomovil-data" : "user-data",
        "user-data": "pagomovil-data",
        "pagomovil-data": "summary",
        "summary": "payment",
      }
      return sellFlow[currentStep] || "calculator"
    }

    // Flujo por defecto (legacy)
    return "calculator"
  }

  const getPreviousStep = (currentStep: string): string => {
    // Flujo para ENVIAR A VENEZUELA (send)
    if (operationMode === "send") {
      const sendFlowReverse: Record<string, string> = {
        "terms": "calculator",
        "email": "terms",
        "payment-type": "email",
        "user-data": "payment-type",
        "beneficiary-data": isUserExisting ? "payment-type" : "user-data",
        "summary": "beneficiary-data",
        "payment": "summary",
      }
      return sendFlowReverse[currentStep] || "calculator"
    }

    // Flujo para RECIBIR EN VENEZUELA (receive)
    if (operationMode === "receive") {
      const receiveFlowReverse: Record<string, string> = {
        "terms": "calculator",
        "email": "terms",
        "user-data": "email",
        "destination-data": "user-data",
        "sender-data": isUserExisting ? "email" : "destination-data",
        "summary": "sender-data",
        "share-link": "summary",
      }
      return receiveFlowReverse[currentStep] || "calculator"
    }

    // Flujo para COMPRAR USDT (buy_usdt)
    if (operationMode === "buy_usdt") {
      const buyFlowReverse: Record<string, string> = {
        "terms": "calculator",
        "email": "terms",
        "payment-type": "email",
        "user-data": "payment-type",
        "wallet-data": isUserExisting ? "payment-type" : "user-data",
        "summary": "wallet-data",
        "payment": "summary",
      }
      return buyFlowReverse[currentStep] || "calculator"
    }

    // Flujo para VENDER USDT (sell_usdt)
    if (operationMode === "sell_usdt") {
      const sellFlowReverse: Record<string, string> = {
        "terms": "calculator",
        "email": "terms",
        "user-data": "email",
        "pagomovil-data": isUserExisting ? "email" : "user-data",
        "summary": "pagomovil-data",
        "payment": "summary",
      }
      return sellFlowReverse[currentStep] || "calculator"
    }

    return "calculator"
  }

  return (
    <FlowContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        flowType,
        setFlowType,
        operationMode,
        setOperationMode,
        quote,
        setQuote,
        user,
        setUser,
        beneficiary,
        setBeneficiary,
        sender,
        setSender,
        thirdParty,
        setThirdParty,
        isThirdPartyPayment,
        setIsThirdPartyPayment,
        operation,
        setOperation,
        resetFlow,
        isUserExisting,
        setIsUserExisting,
        getNextStep,
        getPreviousStep,
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
