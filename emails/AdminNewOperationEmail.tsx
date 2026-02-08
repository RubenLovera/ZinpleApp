import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { ReceiptBox } from './ReceiptBox'

interface AdminNewOperationEmailProps {
  adminName: string
  operationId: string
  operationType: string
  userName: string
  userEmail: string
  userPhone: string
  currencyPair: string
  sendAmount: string
  receiveAmount: string
}

export const AdminNewOperationEmail: React.FC<AdminNewOperationEmailProps> = ({
  adminName,
  operationId,
  operationType,
  userName,
  userEmail,
  userPhone,
  currencyPair,
  sendAmount,
  receiveAmount,
}) => {
  const typeLabels: Record<string, string> = {
    send: 'Envío Internacional',
    receive: 'Recepción de Fondos',
    buy_usdt: 'Compra de USDT',
    sell_usdt: 'Venta de USDT',
  }

  return (
    <EmailLayout preview={`Nueva operación: ${operationId}`}>
      <Section style={section}>
        <Text style={heading}>Nueva Operación</Text>
        <Text style={paragraph}>
          Hola {adminName},
        </Text>
        <Text style={paragraph}>
          Se ha creado una nueva operación en el sistema.
        </Text>
      </Section>

      <ReceiptBox
        title="Detalles de la Operación"
        lines={[
          { label: 'ID de Operación', value: operationId, isBold: true },
          { label: 'Tipo', value: typeLabels[operationType] || operationType },
          { label: 'Usuario', value: userName },
          { label: 'Email', value: userEmail },
          { label: 'Teléfono', value: userPhone },
          { label: 'Par de Monedas', value: currencyPair },
          { label: 'Monto Enviado', value: sendAmount },
          { label: 'Monto a Recibir', value: receiveAmount },
        ]}
      />

      <Section style={section}>
        <Text style={paragraph}>
          Inicia sesión en el admin para ver más detalles y gestionar esta operación.
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
