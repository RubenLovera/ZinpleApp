import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { ReceiptBox } from './ReceiptBox'

interface OperationCompletedEmailProps {
  userName: string
  operationId: string
  operationType: string
  sendAmount: string
  sendCurrency: string
  receiveAmount: string
  receiveCurrency: string
  exchangeRate: string
  beneficiaryName: string
  completedDate: string
  processedDate: string
}

export const OperationCompletedEmail: React.FC<OperationCompletedEmailProps> = ({
  userName,
  operationId,
  operationType,
  sendAmount,
  sendCurrency,
  receiveAmount,
  receiveCurrency,
  exchangeRate,
  beneficiaryName,
  completedDate,
  processedDate,
}) => {
  const typeLabels: Record<string, string> = {
    send: 'Envío Internacional',
    receive: 'Recepción de Fondos',
    buy_usdt: 'Compra de USDT',
    sell_usdt: 'Venta de USDT',
  }

  return (
    <EmailLayout preview={`Comprobante - Operación ${operationId}`}>
      <Section style={section}>
        <Text style={heading}>Comprobante de Operación</Text>
        <Text style={paragraph}>
          Hola {userName},
        </Text>
        <Text style={paragraph}>
          Tu operación ha sido completada exitosamente. A continuación encontrarás el comprobante formal de tu transacción.
        </Text>
      </Section>

      <ReceiptBox
        title="Comprobante de Transacción"
        lines={[
          { label: 'ID de Operación', value: operationId, isBold: true },
          { label: 'Tipo', value: typeLabels[operationType] || operationType },
          { label: 'Estado', value: 'Completada' },
          { label: 'Fecha de Pago', value: completedDate },
          { label: 'Fecha de Procesado', value: processedDate },
          { label: 'Enviaste', value: `${sendAmount} ${sendCurrency}` },
          { label: 'Recibiste', value: `${receiveAmount} ${receiveCurrency}`, isBold: true },
          { label: 'Tasa de Cambio', value: exchangeRate },
          { label: 'Beneficiario', value: beneficiaryName },
        ]}
      />

      <Section style={section}>
        <Text style={subheading}>Información Importante</Text>
        <Text style={paragraph}>
          Este comprobante es válido como constancia de tu transacción. Guárdalo para tus registros.
        </Text>
        <Text style={paragraph}>
          Si tienes alguna pregunta sobre esta operación, contáctanos por WhatsApp.
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
