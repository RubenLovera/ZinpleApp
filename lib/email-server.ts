'use server'

import { Resend } from 'resend'
import React from 'react'
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

export interface SendEmailParams {
  type: EmailType
  to: string
  data: Record<string, any>
}

export async function sendEmailServer(params: SendEmailParams) {
  const { type, to, data } = params

  try {
    // Validar email
    if (!to || !to.includes('@')) {
      throw new Error('Invalid email address')
    }

    // Seleccionar template según tipo
    let emailComponent: React.ReactElement | null = null

    switch (type) {
      case 'welcome':
        emailComponent = React.createElement(WelcomeEmail, { ...data })
        break
      case 'operation-created':
        emailComponent = React.createElement(OperationCreatedEmail, { ...data })
        break
      case 'operation-completed':
        emailComponent = React.createElement(OperationCompletedEmail, { ...data })
        break
      case 'operation-cancelled':
        emailComponent = React.createElement(OperationCancelledEmail, { ...data })
        break
      case 'beneficiary-added':
        emailComponent = React.createElement(BeneficiaryAddedEmail, { ...data })
        break
      case 'new-session':
        emailComponent = React.createElement(NewSessionEmail, { ...data })
        break
      case 'admin-new-operation':
        emailComponent = React.createElement(AdminNewOperationEmail, { ...data })
        break
      case 'admin-operation-completed':
        emailComponent = React.createElement(AdminOperationCompletedEmail, { ...data })
        break
      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    if (!emailComponent) {
      throw new Error('Failed to create email component')
    }

    // Renderizar HTML con validación
    let emailHtml: any
    try {
      emailHtml = await render(emailComponent)
      console.log('[v0] Email rendered, type:', typeof emailHtml, 'value:', emailHtml)
    } catch (renderError) {
      console.error('[v0] Render error:', renderError)
      throw new Error(`Failed to render email template: ${renderError}`)
    }

    // Validar que emailHtml sea un string
    if (typeof emailHtml !== 'string' || !emailHtml) {
      console.error('[v0] Invalid HTML output:', { emailHtml, type: typeof emailHtml })
      throw new Error(`Email rendering produced invalid HTML: ${JSON.stringify(emailHtml)}`)
    }

    console.log('[v0] Sending email with Resend to', to, 'HTML length:', emailHtml.length)

    // Enviar con Resend
    const response = await resend.emails.send({
      from: 'operaciones@zinpleapp.com',
      to,
      subject: getEmailSubject(type),
      html: emailHtml,
    })

    if (response.error) {
      throw new Error(`Resend error: ${response.error.message}`)
    }

    console.log(`[v0] Successfully sent ${type} email to ${to}`)
    return response
  } catch (error) {
    console.error(`[v0] Failed to send ${type} email to ${to}:`, error)
    throw error
  }
}

function getEmailSubject(type: EmailType): string {
  const subjects: Record<EmailType, string> = {
    welcome: '¡Bienvenido a Zinple! 🎉',
    'operation-created': 'Tu operación ha sido creada',
    'operation-completed': 'Tu operación ha sido completada ✓',
    'operation-cancelled': 'Tu operación ha sido cancelada',
    'beneficiary-added': 'Nuevo beneficiario agregado',
    'new-session': 'Acceso a tu cuenta desde una nueva ubicación',
    'admin-new-operation': '[Admin] Nueva operación',
    'admin-operation-completed': '[Admin] Operación completada',
  }
  return subjects[type]
}
