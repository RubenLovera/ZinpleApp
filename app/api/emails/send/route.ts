'use server'

import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, type EmailType } from '@/lib/email-sender'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, data } = body

    // Validar que todos los campos requeridos estén presentes
    if (!type || !to || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, to, data' },
        { status: 400 }
      )
    }

    // Validar que el email sea válido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Enviar el email
    const result = await sendEmail({
      type: type as EmailType,
      to,
      data,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[Email API Error]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
