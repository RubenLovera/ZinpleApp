import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { EmailButton } from './EmailButton'

interface OperationCancelledEmailProps {
  userName: string
  operationId: string
  cancelledDate: string
  cancellationReason: string
  whatsappNumber: string
}

export const OperationCancelledEmail: React.FC<OperationCancelledEmailProps> = ({
  userName,
  operationId,
  cancelledDate,
  cancellationReason,
  whatsappNumber,
}) => {
  return (
    <EmailLayout preview={`Operación ${operationId} cancelada`}>
      <Section style={section}>
        <Text style={heading}>Operación Cancelada</Text>
        <Text style={paragraph}>
          Hola {userName},
        </Text>
        <Text style={paragraph}>
          Tu operación con ID <strong>{operationId}</strong> ha sido cancelada.
        </Text>
      </Section>

      <Section style={{ ...section, backgroundColor: '#fee2e2', borderRadius: '6px', margin: '20px 40px' }}>
        <Text style={{ ...paragraph, color: '#991b1b', margin: '10px 0' }}>
          <strong>Motivo de Cancelación:</strong> {cancellationReason}
        </Text>
        <Text style={{ ...paragraph, color: '#991b1b', margin: '10px 0' }}>
          <strong>Fecha:</strong> {cancelledDate}
        </Text>
      </Section>

      <Section style={section}>
        <Text style={subheading}>¿Qué sucede ahora?</Text>
        <Text style={paragraph}>
          Si realizaste algún pago, será reembolsado a tu cuenta según el método de pago utilizado. Por favor, ten paciencia mientras procesamos el reembolso.
        </Text>
        <Text style={paragraph}>
          Si tienes preguntas sobre esta cancelación, estamos disponibles para ayudarte.
        </Text>
      </Section>

      <Section style={{ ...section, textAlign: 'center' }}>
        <EmailButton href={`https://wa.me/${whatsappNumber}`} variant="secondary">
          Contactar Soporte
        </EmailButton>
      </Section>
    </EmailLayout>
  )
}

const section = {
  padding: '20px 40px',
}

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 20px 0',
}

const subheading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '20px 0 10px 0',
}

const paragraph = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '24px',
  margin: '10px 0',
}
