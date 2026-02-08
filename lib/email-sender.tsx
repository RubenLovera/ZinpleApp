import React from "react"
'use server'

import { Resend } from 'resend'
import { render } from '@react-email/render'
import {
  WelcomeEmail,
  OperationCreatedEmail,
  OperationCompletedEmail,
  OperationCancelledEmail,
  BeneficiaryAddedEmail,
  NewSessionEmail,
  AdminNewOperationEmail,
  AdminOperationCompletedEmail,
} from '@/emails'

const resend = new Resend(process.env.RESEND_API_KEY)

export type EmailType =
  | 'welcome'
  | 'operation-created'
  | 'operation-completed'
  | 'operation-cancelled'
  | 'beneficiary-added'
  | 'new-session'
  | 'admin-new-operation'
  | 'admin-operation-completed'

interface EmailPayload {
  type: EmailType
  to: string
  data: Record<string, any>
}

export async function sendEmail(payload: EmailPayload) {
  const { type, to, data } = payload

  try {
    let emailTemplate: React.ReactElement
    let subject: string

    switch (type) {
      case 'welcome':
        emailTemplate = <WelcomeEmail {...data} />
        subject = 'Bienvenido a Zinple'
        break

      case 'operation-created':
        emailTemplate = <OperationCreatedEmail {...data} />
        subject = `Operación ${data.operationId} creada`
        break

      case 'operation-completed':
        emailTemplate = <OperationCompletedEmail {...data} />
        subject = `Comprobante - Operación ${data.operationId}`
        break

      case 'operation-cancelled':
        emailTemplate = <OperationCancelledEmail {...data} />
        subject = `Operación ${data.operationId} cancelada`
        break

      case 'beneficiary-added':
        emailTemplate = <BeneficiaryAddedEmail {...data} />
        subject = `Nuevo beneficiario: ${data.beneficiaryName}`
        break

      case 'new-session':
        emailTemplate = <NewSessionEmail {...data} />
        subject = 'Nueva sesión en tu cuenta Zinple'
        break

      case 'admin-new-operation':
        emailTemplate = <AdminNewOperationEmail {...data} />
        subject = `Nueva operación: ${data.operationId}`
        break

      case 'admin-operation-completed':
        emailTemplate = <AdminOperationCompletedEmail {...data} />
        subject = `Operación completada: ${data.operationId}`
        break

      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    const html = render(emailTemplate)

    const response = await resend.emails.send({
      from: 'operaciones@zinpleapp.com',
      to,
      subject,
      html,
    })

    if (response.error) {
      console.error('[Resend Error]', response.error)
      throw new Error(response.error.message)
    }

    console.log(`[Email Sent] ${type} to ${to}`)
    return { success: true, messageId: response.data?.id }
  } catch (error) {
    console.error(`[Email Error] Failed to send ${type} email to ${to}:`, error)
    throw error
  }
}
