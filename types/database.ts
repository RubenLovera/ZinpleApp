export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  wallet_address?: string
  cedula?: string
  bank?: string
  account_holder?: string
  completed_operations: number
  current_limit: number
  user_type?: "persona" | "negocio"
  monthly_volume_expected?: number
  receives_third_party_payments: boolean
  expected_third_parties: number
  created_at: string
  updated_at: string
}

export interface Operation {
  id: string
  user_email: string
  amount: number
  currency: string
  result: number
  payer_name?: string
  payer_email?: string
  payer_phone?: string
  payer_is_user: boolean
  status: "pending" | "completed" | "cancelled"
  created_at: string
}

// Nuevos tipos para el flujo
export interface QuoteData {
  amount: number
  currency: "usdt" | "bolivares"
  result: number
  exchangeRate: number
  commissionRate: number
}

export interface UserFormData {
  email: string
  fullName: string
  phone: string
  userType: "persona" | "negocio"
  monthlyVolumeExpected: number
  receivesThirdPartyPayments: boolean
  expectedThirdParties: number
  zelleAccount?: string
  walletAddress?: string
  pagomovil?: {
    phone: string
    bank: string
    accountHolder: string
    cedula: string // Formato: "V-12345678", "E-12345678", "J-12345678"
  }
}

export interface ThirdPartyData {
  name: string
  phone: string
  email: string
}

// Actualizar la interfaz OperationData para que coincida con el uso
export interface OperationData {
  id: string
  quote: QuoteData
  user: UserFormData
  thirdParty?: ThirdPartyData
  isThirdPartyPayment: boolean
}
