import { sendEmail, type EmailType } from '@/lib/email-sender'
import type { QuoteData, UserFormData, BeneficiaryData, SenderData, OperationData } from '@/types/database'

export async function sendOperationEmail(
  type: EmailType,
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
          userName: user.fullName,
          operationId,
          operationType,
          sendAmount: quote.amount.toLocaleString(),
          sendCurrency: quote.sourceCurrency,
          receiveAmount: quote.result.toLocaleString(),
          receiveCurrency: quote.destinationCurrency,
          exchangeRate: quote.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          beneficiaryName: beneficiary?.fullName || 'N/A',
          paymentMethod: operation.payment_method || 'No especificado',
        }
        break

      case 'operation-completed':
        const completedDate = operation.completed_at
          ? new Date(operation.completed_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'N/A'

        const processedDate = operation.payment_confirmed_at
          ? new Date(operation.payment_confirmed_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : completedDate

        emailData = {
          userName: user.fullName,
          operationId,
          operationType,
          sendAmount: quote.amount.toLocaleString(),
          sendCurrency: quote.sourceCurrency,
          receiveAmount: quote.result.toLocaleString(),
          receiveCurrency: quote.destinationCurrency,
          exchangeRate: quote.exchangeRate.toLocaleString(undefined, { maximumFractionDigits: 2 }),
          beneficiaryName: beneficiary?.fullName || 'N/A',
          completedDate,
          processedDate,
        }
        break

      case 'welcome':
        emailData = {
          userName: user.fullName,
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

    console.log(`[Operation Email] Sent ${type} to ${recipient} for operation ${operationId}`)
  } catch (error) {
    console.error(`[Operation Email Error] Failed to send ${type} email:`, error)
    // No lanzar error - los emails no deberían bloquear la operación
  }
}
