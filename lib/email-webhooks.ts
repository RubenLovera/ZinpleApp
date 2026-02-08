import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email-sender'

// Crear cliente de Supabase para webhooks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function initializeEmailWebhooks() {
  try {
    // Escuchar cambios en operaciones completadas
    supabase
      .channel('operations_completed')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'operations',
          filter: 'status=eq.completed',
        },
        async (payload) => {
          const operation = payload.new
          try {
            await sendEmail({
              type: 'operation-completed',
              to: operation.user_email,
              data: {
                userName: operation.user_full_name,
                operationId: operation.operation_number,
                operationType: operation.mode,
                sendAmount: operation.source_amount,
                sendCurrency: operation.source_currency,
                receiveAmount: operation.destination_amount,
                receiveCurrency: operation.destination_currency,
                exchangeRate: operation.exchange_rate,
                beneficiaryName: operation.beneficiary_full_name,
                completedDate: new Date(operation.completed_at).toLocaleDateString('es-ES'),
                processedDate: new Date(operation.payment_confirmed_at || operation.completed_at).toLocaleDateString('es-ES'),
              },
            })
          } catch (error) {
            console.error('[Email Webhook] Error sending operation-completed email:', error)
          }
        }
      )
      .subscribe()

    // Escuchar cambios en operaciones canceladas
    supabase
      .channel('operations_cancelled')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'operations',
          filter: 'status=eq.cancelled',
        },
        async (payload) => {
          const operation = payload.new
          try {
            await sendEmail({
              type: 'operation-cancelled',
              to: operation.user_email,
              data: {
                userName: operation.user_full_name,
                operationId: operation.operation_number,
                cancelledDate: new Date(operation.cancelled_at).toLocaleDateString('es-ES'),
                cancellationReason: operation.notes || 'No especificado',
                whatsappNumber: '56956413113',
              },
            })
          } catch (error) {
            console.error('[Email Webhook] Error sending operation-cancelled email:', error)
          }
        }
      )
      .subscribe()

    console.log('[Email Webhooks] Initialized successfully')
  } catch (error) {
    console.error('[Email Webhooks] Failed to initialize:', error)
  }
}
