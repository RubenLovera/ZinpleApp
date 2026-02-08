import { sendEmail } from '@/lib/email-client'
import type { QuoteData, UserFormData, BeneficiaryData, SenderData, OperationData } from '@/types/database'

export async function sendOperationEmail(
  type: 'welcome' | 'operation-created' | 'operation-completed' | 'operation-cancelled' | 'beneficiary-added' | 'new-session' | 'admin-new-operation' | 'admin-operation-completed',
  recipient: string,
  operationData: {
    operationId: string
    operationType: string
    user: UserFormData
    beneficiary?: BeneficiaryData | null
    sender?: SenderData | null
    quote: QuoteData
    operation: OperationData
  }
) {
  try {
    const { operationId, operationType, user, beneficiary, sender, quote, operation } = operationData

    let emailData: Record<string, any> = {}

    switch (type) {
      case 'operation-created':
        emailData = {
          userName: user.fullName || 'Usuario',
          operationId,
          operationType,
          sendAmount: quote?.amount ? quote.amount.toLocaleString('es-ES') : '0.00',
          sendCurrency: quote?.sourceCurrency || 'USD',
          receiveAmount: quote?.result ? quote.result.toLocaleString('es-ES') : '0.00',
          receiveCurrency: quote?.destinationCurrency || 'USDT',
          exchangeRate: quote?.exchangeRate ? quote.exchangeRate.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : '0.00',
          beneficiaryName: beneficiary?.fullName || 'N/A',
          paymentMethod: operation?.payment_method || 'No especificado',
        }
        break

      case 'operation-completed':
        const completedDate = operation?.completed_at
          ? new Date(operation.completed_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A'

        const processedDate = operation?.payment_confirmed_at
          ? new Date(operation.payment_confirmed_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : completedDate

        emailData = {
          userName: user.fullName || 'Usuario',
          operationId,
          operationType,
          sendAmount: quote?.amount ? quote.amount.toLocaleString('es-ES') : '0.00',
          sendCurrency: quote?.sourceCurrency || 'USD',
          receiveAmount: quote?.result ? quote.result.toLocaleString('es-ES') : '0.00',
          receiveCurrency: quote?.destinationCurrency || 'USDT',
          exchangeRate: quote?.exchangeRate ? quote.exchangeRate.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : '0.00',
          beneficiaryName: beneficiary?.fullName || 'N/A',
          completedDate,
          processedDate,
        }
        break

      case 'welcome':
        emailData = {
          userName: user.fullName || 'Bienvenido',
          whatsappNumber: '56956413113',
        }
        break

      default:
        throw new Error(`Unsupported email type: ${type}`)
    }

    await sendEmail({
      type,
      to: recipient,
      data: emailData,
    })

    console.log(`[v0] Operation Email Sent: ${type} to ${recipient}`)
  } catch (error) {
    console.error(`[v0] Operation Email Error: Failed to send ${type} email:`, error)
    // No lanzar error - los emails no deberían bloquear la operación
  }
}
