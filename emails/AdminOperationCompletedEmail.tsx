import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { ReceiptBox } from './ReceiptBox'

interface AdminOperationCompletedEmailProps {
  adminName: string
  operationId: string
  completedDate: string
  userName: string
  userEmail: string
  beneficiaryName: string
  receivedAmount: string
  sentAmount: string
  commissionAmount: string
}

export const AdminOperationCompletedEmail: React.FC<AdminOperationCompletedEmailProps> = ({
  adminName,
  operationId,
  completedDate,
  userName,
  userEmail,
  beneficiaryName,
  receivedAmount,
  sentAmount,
  commissionAmount,
}) => {
  return (
    <EmailLayout preview={`Operación completada: ${operationId}`}>
      <Section style={section}>
        <Text style={heading}>Operación Completada</Text>
        <Text style={paragraph}>
          Hola {adminName},
        </Text>
        <Text style={paragraph}>
          Una operación ha sido completada exitosamente.
        </Text>
      </Section>

      <ReceiptBox
        title="Información de la Operación"
        lines={[
          { label: 'ID de Operación', value: operationId, isBold: true },
          { label: 'Fecha de Completación', value: completedDate },
          { label: 'Usuario', value: userName },
          { label: 'Email del Usuario', value: userEmail },
          { label: 'Beneficiario', value: beneficiaryName },
          { label: 'Monto Enviado', value: sentAmount },
          { label: 'Monto Recibido', value: receivedAmount, isBold: true },
          { label: 'Comisión', value: commissionAmount },
        ]}
      />

      <Section style={section}>
        <Text style={paragraph}>
          Esta operación ha sido procesada correctamente y los fondos han sido distribuidos.
        </Text>
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

const paragraph = {
  fontSize: '14px',
  color: '#4b5563',
  lineHeight: '24px',
  margin: '10px 0',
}
