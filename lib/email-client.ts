import { sendEmailServer, type EmailType } from '@/lib/email-server'

/**
 * Cliente para enviar emails desde componentes
 * Llama a la Server Action sendEmailServer
 */
export async function sendEmail({
  type,
  to,
  data,
}: {
  type: EmailType
  to: string
  data: Record<string, any>
}) {
  try {
    const result = await sendEmailServer({
      type,
      to,
      data,
    })

    return result
  } catch (error) {
    console.error('[Email Client] Error sending email:', error)
    // Propagar el error pero no lanzar en cliente
    return null
  }
}
