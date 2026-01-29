// Tipos de operación
export type OperationMode = "send" | "receive" | "buy_usdt" | "sell_usdt"

// Pares de divisas soportados
export type CurrencyPair = 
  | "CLP_VES" // Chile -> Venezuela
  | "MXN_VES" // México -> Venezuela
  | "PEN_VES" // Perú -> Venezuela
  | "EUR_VES" // Europa -> Venezuela
  | "USD_VES" // EE.UU. -> Venezuela
  | "BRL_VES" // Brasil -> Venezuela
  | "COP_VES" // Colombia -> Venezuela
  | "CLP_PEN" // Chile -> Perú
  | "USDT_VES" // Crypto -> Venezuela

// Monedas soportadas
export type Currency = "CLP" | "MXN" | "PEN" | "EUR" | "USD" | "BRL" | "COP" | "VES" | "USDT"

// Métodos de pago por país/moneda
export type PaymentMethod = 
  | "zelle"           // USD (EE.UU.)
  | "spei"            // MXN (México) - CLABE
  | "transferencia_cl" // CLP (Chile)
  | "transferencia_pe" // PEN (Perú)
  | "pix"             // BRL (Brasil)
  | "transferencia_co" // COP (Colombia)
  | "sepa"            // EUR (Europa) - IBAN
  | "pagomovil"       // VES (Venezuela)
  | "usdt_polygon"    // USDT

// Información de país/moneda
export interface CountryCurrency {
  code: Currency
  name: string
  country: string
  flag: string
  symbol: string
  paymentMethods: PaymentMethod[]
}

// Usuario existente en la base de datos
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

// Operación en la base de datos
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
  // Nuevos campos multi-par
  operation_mode?: OperationMode
  currency_pair?: CurrencyPair
  source_currency?: Currency
  destination_currency?: Currency
  created_at: string
}

// Datos de cotización multi-par
export interface QuoteData {
  amount: number
  result: number
  // Campos legacy (para compatibilidad)
  currency?: "usdt" | "bolivares"
  // Campos multi-par
  sourceCurrency?: string
  destinationCurrency?: string
  rate?: number
  fee?: number
}

// Datos del formulario de usuario
export interface UserFormData {
  email: string
  fullName: string
  phone: string
  userType: "persona" | "negocio"
  monthlyVolumeExpected: number
  receivesThirdPartyPayments: boolean
  expectedThirdParties: number
  // Datos de pago según método
  zelleAccount?: string
  walletAddress?: string
  pagomovil?: {
    phone: string
    bank: string
    accountHolder: string
    cedula: string // Formato: "V-12345678", "E-12345678", "J-12345678"
  }
  // Nuevos campos para métodos de pago internacionales
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
    // Campos específicos por país
    clabe?: string      // México (SPEI)
    iban?: string       // Europa (SEPA)
    rut?: string        // Chile
    cpf?: string        // Brasil
    pixKey?: string     // Brasil
  }
}

// Datos del beneficiario (para modo "send" y "receive")
export interface BeneficiaryData {
  fullName: string
  phone: string
  email?: string
  relationship: "familiar" | "amigo" | "cliente" | "proveedor" | "otro"
  // Datos de recepción según destino
  pagomovil?: {
    phone: string
    bank: string
    accountHolder: string
    cedula: string
  }
  walletAddress?: string
  bankAccount?: {
    bankName: string
    accountNumber: string
    accountHolder: string
    clabe?: string
    iban?: string
  }
}

// Datos del remitente (para modo "receive")
export interface SenderData {
  fullName: string
  phone: string
  email?: string
  country: string
  relationship: "familiar" | "amigo" | "cliente" | "empleador" | "otro"
}

// Datos de tercero que paga
export interface ThirdPartyData {
  name: string
  phone: string
  email: string
}

// Datos completos de la operación
export interface OperationData {
  id: string
  operationMode?: OperationMode
  quote: QuoteData
  user: UserFormData
  beneficiary?: BeneficiaryData
  sender?: SenderData
  thirdParty?: ThirdPartyData
  isThirdPartyPayment: boolean
}

// Configuración de países y monedas
export const COUNTRY_CURRENCIES: CountryCurrency[] = [
  { code: "USD", name: "Dólar", country: "Estados Unidos", flag: "🇺🇸", symbol: "$", paymentMethods: ["zelle"] },
  { code: "MXN", name: "Peso Mexicano", country: "México", flag: "🇲🇽", symbol: "$", paymentMethods: ["spei"] },
  { code: "CLP", name: "Peso Chileno", country: "Chile", flag: "🇨🇱", symbol: "$", paymentMethods: ["transferencia_cl"] },
  { code: "PEN", name: "Sol", country: "Perú", flag: "🇵🇪", symbol: "S/", paymentMethods: ["transferencia_pe"] },
  { code: "BRL", name: "Real", country: "Brasil", flag: "🇧🇷", symbol: "R$", paymentMethods: ["pix"] },
  { code: "COP", name: "Peso Colombiano", country: "Colombia", flag: "🇨🇴", symbol: "$", paymentMethods: ["transferencia_co"] },
  { code: "EUR", name: "Euro", country: "Europa", flag: "🇪🇺", symbol: "€", paymentMethods: ["sepa"] },
  { code: "VES", name: "Bolívar", country: "Venezuela", flag: "🇻🇪", symbol: "Bs", paymentMethods: ["pagomovil"] },
  { code: "USDT", name: "Tether", country: "Crypto", flag: "₮", symbol: "₮", paymentMethods: ["usdt_polygon"] },
]

// Pares de divisas disponibles con sus tasas mock
export const CURRENCY_PAIRS: Record<CurrencyPair, { rate: number; commission: number; minAmount: number; maxAmount: number }> = {
  "CLP_VES": { rate: 0.042, commission: 0.03, minAmount: 5000, maxAmount: 500000 },
  "MXN_VES": { rate: 2.15, commission: 0.03, minAmount: 100, maxAmount: 20000 },
  "PEN_VES": { rate: 10.2, commission: 0.03, minAmount: 20, maxAmount: 5000 },
  "EUR_VES": { rate: 42.5, commission: 0.035, minAmount: 10, maxAmount: 5000 },
  "USD_VES": { rate: 38.5, commission: 0.03, minAmount: 10, maxAmount: 5000 },
  "BRL_VES": { rate: 7.8, commission: 0.035, minAmount: 50, maxAmount: 25000 },
  "COP_VES": { rate: 0.0095, commission: 0.03, minAmount: 50000, maxAmount: 5000000 },
  "CLP_PEN": { rate: 0.0044, commission: 0.025, minAmount: 5000, maxAmount: 500000 },
  "USDT_VES": { rate: 38.5, commission: 0.02, minAmount: 10, maxAmount: 10000 },
}

// Helper para obtener información de moneda
export function getCurrencyInfo(code: Currency): CountryCurrency | undefined {
  return COUNTRY_CURRENCIES.find(c => c.code === code)
}

// Helper para calcular cotización
export function calculateQuote(
  amount: number,
  pair: CurrencyPair,
  mode: OperationMode
): { result: number; rate: number; commission: number } {
  const pairConfig = CURRENCY_PAIRS[pair]
  const commission = amount * pairConfig.commission
  const netAmount = amount - commission
  const result = netAmount * pairConfig.rate
  
  return {
    result,
    rate: pairConfig.rate,
    commission: pairConfig.commission
  }
}
