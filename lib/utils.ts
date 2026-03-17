import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getCurrencyInfo } from "@/types/database"
import type { QuoteData, UserFormData, BeneficiaryData, SenderData, OperationData, OperationMode } from "@/types/database"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Genera un ID temporal para el cliente (el backend genera el número de operación real)
export function generateOperationId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `TMP-${result}`
}

// Genera el mensaje de WhatsApp con estructura profesional para ManyChat
export function generateWhatsAppMessage(
  operationMode: OperationMode,
  quote: QuoteData,
  user: UserFormData,
  beneficiary: BeneficiaryData | null,
  sender: SenderData | null,
  operation: OperationData,
  destinationWalletAddress?: string,
  destinationWalletNetwork?: string
): string {
  const sourceCurrency = getCurrencyInfo(quote.sourceCurrency)
  const destCurrency = getCurrencyInfo(quote.destinationCurrency)

  // Helper para formatear datos del beneficiario (Pago Móvil o Wallet)
  const getBeneficiaryInfo = (beneficiaryData: BeneficiaryData | null, isUserBeneficiary: boolean = false): string => {
    const data = isUserBeneficiary ? user : beneficiaryData
    if (!data) return ""

    let info = ""

    // Si hay Pago Móvil
    if (data.pagomovil?.phone) {
      info += `👥 Pago Móvil: 0${data.pagomovil.phone} - ${data.pagomovil.bank || "N/A"}\n`
      if (data.pagomovil.cedula) {
        info += `👥 Cédula: ${data.pagomovil.cedula}\n`
      }
    }

    // Si hay Wallet Polygon (USDT)
    if (destinationWalletAddress && operationMode === "send") {
      info += `👥 Wallet Polygon: ${destinationWalletAddress}\n`
    }

    return info
  }

  // Construir mensaje según el modo de operación
  let message = `🧾 Comprobante - Operación #${operation.id}\n\n`

  if (operationMode === "send") {
    message += `Ya he realizado el envío de fondos.\n\n`

    message += `📋 DATOS DE LA OPERACIÓN\n`
    message += `📋 ID: #${operation.id}\n`
    message += `📋 Tipo: Envío Internacional\n`
    message += `📋 Par: ${quote.sourceCurrency} ↔ ${quote.destinationCurrency}\n\n`

    message += `💵 MONTOS\n`
    message += `💵 Envías: ${sourceCurrency?.symbol}${(quote.amount || 0).toLocaleString()} ${quote.sourceCurrency}\n`
    message += `💵 Recibe: ${destCurrency?.symbol}${(quote.result || 0).toLocaleString()} ${quote.destinationCurrency}\n`
    message += `💵 Tasa: 1 ${quote.sourceCurrency} = ${(quote.rate || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.destinationCurrency}\n\n`

    message += `👤 REMITENTE\n`
    message += `👤 Nombre: ${user.fullName}\n`
    message += `👤 Email: ${user.email}\n`
    if (user.phone) message += `👤 Teléfono: ${user.phone}\n`
    message += `\n`

    message += `👥 BENEFICIARIO\n`
    message += `👥 Nombre: ${beneficiary?.fullName || "N/A"}\n`
    message += getBeneficiaryInfo(beneficiary, false)

  } else if (operationMode === "receive") {
    message += `Ya he creado una solicitud de recepción de dinero.\n\n`

    message += `📋 DATOS DE LA OPERACIÓN\n`
    message += `📋 ID: #${operation.id}\n`
    message += `📋 Tipo: Recepción de Fondos\n`
    message += `📋 Par: ${quote.sourceCurrency} ↔ ${quote.destinationCurrency}\n\n`

    message += `💵 MONTOS\n`
    message += `💵 Remitente envía: ${sourceCurrency?.symbol}${(quote.amount || 0).toLocaleString()} ${quote.sourceCurrency}\n`
    message += `💵 Yo recibo: ${destCurrency?.symbol}${(quote.result || 0).toLocaleString()} ${quote.destinationCurrency}\n`
    message += `💵 Tasa: 1 ${quote.sourceCurrency} = ${(quote.rate || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.destinationCurrency}\n\n`

    message += `👤 REMITENTE\n`
    message += `👤 Nombre: ${sender?.fullName || "N/A"}\n`
    message += `👤 País: ${sender?.country || "N/A"}\n`
    if (sender?.phone) message += `👤 Teléfono: ${sender.phone}\n`
    message += `\n`

    message += `👥 BENEFICIARIO (YO)\n`
    message += `👥 Nombre: ${user.fullName}\n`
    message += `👥 Email: ${user.email}\n`
    if (user.phone) message += `👥 Teléfono: ${user.phone}\n`
    message += getBeneficiaryInfo(null, true)

  } else if (operationMode === "buy_usdt") {
    message += `Ya he realizado el pago para comprar USDT.\n\n`

    message += `📋 DATOS DE LA OPERACIÓN\n`
    message += `📋 ID: #${operation.id}\n`
    message += `📋 Tipo: Compra de USDT\n`
    message += `📋 Par: ${quote.sourceCurrency} ↔ USDT\n\n`

    message += `💵 MONTOS\n`
    message += `💵 Envías: ${sourceCurrency?.symbol}${(quote.amount || 0).toLocaleString()} ${quote.sourceCurrency}\n`
    message += `💵 Recibes: ${(quote.result || 0).toLocaleString()} USDT\n`
    message += `💵 Tasa: 1 ${quote.sourceCurrency} = ${(quote.rate || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })} USDT\n\n`

    message += `👤 MIS DATOS\n`
    message += `👤 Nombre: ${user.fullName}\n`
    message += `👤 Email: ${user.email}\n`
    if (user.phone) message += `👤 Teléfono: ${user.phone}\n`
    if (user.walletAddress) {
      message += `👤 Wallet Polygon: ${user.walletAddress}\n`
      message += `👤 Red: ${destinationWalletNetwork || "Polygon"}\n`
    }

  } else if (operationMode === "sell_usdt") {
    message += `Ya quiero vender USDT.\n\n`

    message += `📋 DATOS DE LA OPERACIÓN\n`
    message += `📋 ID: #${operation.id}\n`
    message += `📋 Tipo: Venta de USDT\n`
    message += `📋 Par: USDT ↔ ${quote.destinationCurrency}\n\n`

    message += `💵 MONTOS\n`
    message += `💵 USDT a vender: ${(quote.amount || 0).toLocaleString()} USDT\n`
    message += `💵 Recibes: ${destCurrency?.symbol}${(quote.result || 0).toLocaleString()} ${quote.destinationCurrency}\n`
    message += `💵 Tasa: 1 USDT = ${(quote.rate || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${quote.destinationCurrency}\n\n`

    message += `👤 MIS DATOS\n`
    message += `👤 Nombre: ${user.fullName}\n`
    message += `👤 Email: ${user.email}\n`
    if (user.phone) message += `👤 Teléfono: ${user.phone}\n`
    if (user.pagomovil?.phone) {
      message += `👤 Pago Móvil: 0${user.pagomovil.phone} - ${user.pagomovil.bank || "N/A"}\n`
      if (user.pagomovil.cedula) {
        message += `👤 Cédula: ${user.pagomovil.cedula}\n`
      }
    }
  }

  message += `\n📎 Adjunto comprobante para verificación.`

  return message
}
