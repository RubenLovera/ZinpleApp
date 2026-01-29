import type { OperationData, OperationMode } from "@/types/database"

interface APIOperation {
  id: string
  operation_number: string
  mode: OperationMode
  status: string
  currency_pair: string
  source_currency: string
  destination_currency: string
  source_amount: number
  destination_amount: number
  exchange_rate: number
  fee_percentage: number
  fee_amount: number
  user_email: string
  created_at: string
}

export async function createOperationViaAPI(operationData: OperationData): Promise<APIOperation | null> {
  try {
    const { quote, user, beneficiary, sender, operationMode } = operationData

    // Construir request body según el nuevo esquema
    const requestBody = {
      mode: operationMode || "send",
      currencyPair: quote.currencyPair || `${quote.sourceCurrency}_${quote.destinationCurrency}`,
      sourceCurrency: quote.sourceCurrency || "USD",
      destinationCurrency: quote.destinationCurrency || "VES",
      sourceAmount: quote.amount,
      destinationAmount: quote.result,
      exchangeRate: quote.exchangeRate || quote.rate || 36.5,
      feePercentage: quote.commissionRate || quote.fee || 0.05,
      feeAmount: quote.amount * (quote.commissionRate || quote.fee || 0.05),
      // Datos del usuario
      user: {
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        documentType: user.pagomovil?.cedula?.split("-")[0] || null,
        documentNumber: user.pagomovil?.cedula?.split("-")[1] || null,
        country: operationMode === "receive" ? "VE" : null,
      },
      // Beneficiario (modo send)
      beneficiary: beneficiary ? {
        fullName: beneficiary.fullName,
        phone: beneficiary.phone,
        email: beneficiary.email,
        bankCode: beneficiary.pagomovil?.bank,
        bankName: beneficiary.pagomovil?.bank,
        walletAddress: beneficiary.walletAddress,
      } : undefined,
      // Remitente (modo receive)
      sender: sender ? {
        fullName: sender.fullName,
        email: sender.email,
        phone: sender.phone,
        country: sender.country,
      } : undefined,
      // Datos de destino (pago móvil del beneficiario o usuario)
      destination: beneficiary?.pagomovil ? {
        bankCode: beneficiary.pagomovil.bank,
        bankName: beneficiary.pagomovil.bank,
        phone: beneficiary.pagomovil.phone,
        document: beneficiary.pagomovil.cedula,
      } : user.pagomovil ? {
        bankCode: user.pagomovil.bank,
        bankName: user.pagomovil.bank,
        phone: user.pagomovil.phone,
        document: user.pagomovil.cedula,
      } : undefined,
      // Método de pago según la moneda origen
      paymentMethod: getPaymentMethod(quote.sourceCurrency || "USD"),
    }

    console.log("Sending operation to API:", JSON.stringify(requestBody, null, 2))

    const response = await fetch("/api/operations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("API Error:", responseData)
      throw new Error(responseData.error || "Error desconocido")
    }

    console.log("Operation created via API:", responseData.operation.operation_number)
    return responseData.operation

  } catch (error) {
    console.error("Error calling API:", error)
    throw error
  }
}

// Helper para determinar método de pago según moneda
function getPaymentMethod(currency: string): string {
  switch (currency) {
    case "USD":
      return "zelle"
    case "MXN":
      return "spei"
    case "CLP":
      return "transferencia_cl"
    case "PEN":
      return "transferencia_pe"
    case "BRL":
      return "pix"
    case "COP":
      return "transferencia_co"
    case "EUR":
      return "sepa"
    case "USDT":
      return "usdt_polygon"
    case "VES":
      return "pagomovil"
    default:
      return "transferencia"
  }
}
