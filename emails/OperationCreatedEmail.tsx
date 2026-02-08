import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { EmailButton } from './EmailButton'
import { ReceiptBox } from './ReceiptBox'

interface OperationCreatedEmailProps {
  userName: string
  operationId: string
  operationType: string
  sendAmount: string
  sendCurrency: string
  receiveAmount: string
  receiveCurrency: string
  exchangeRate: string
  beneficiaryName: string
  paymentMethod: string
}

export const OperationCreatedEmail: React.FC<OperationCreatedEmailProps> = ({
  userName,
  operationId,
  operationType,
  sendAmount,
  sendCurrency,
  receiveAmount,
  receiveCurrency,
  exchangeRate,
  beneficiaryName,
  paymentMethod,
}) => {
  const typeLabels: Record<string, string> = {
    send: 'Envío Internacional',
    receive: 'Recepción de Fondos',
    buy_usdt: 'Compra de USDT',
    sell_usdt: 'Venta de USDT',
  }

  return (
    <EmailLayout preview={`Operación ${operationId} creada`}>
      <Section style={section}>
        <Text style={heading}>Operación Creada</Text>
        <Text style={paragraph}>
          Hola {userName},
        </Text>
        <Text style={paragraph}>
          Tu operación {typeLabels[operationType] || operationType} ha sido creada exitosamente.
        </Text>
      </Section>

      <ReceiptBox
        title="Detalles de la Operación"
        lines={[
          { label: 'ID de Operación', value: operationId, isBold: true },
          { label: 'Tipo', value: typeLabels[operationType] || operationType },
          { label: 'Estado', value: 'Pendiente de Pago' },
          { label: 'Envías', value: `${sendAmount} ${sendCurrency}` },
          { label: 'Recibes', value: `${receiveAmount} ${receiveCurrency}`, isBold: true },
          { label: 'Tasa', value: exchangeRate },
          { label: 'Beneficiario', value: beneficiaryName },
          { label: 'Método de Pago', value: paymentMethod },
        ]}
      />

      <Section style={{ ...section, textAlign: 'center' }}>
        <EmailButton href={`https://www.zinpleapp.com/operations/${operationId}`}>
          Ver Detalles de la Operación
        </EmailButton>
      </Section>

      <Section style={section}>
        <Text style={subheading}>Próximos Pasos</Text>
        <Text style={paragraph}>
          1. Realiza el pago por el monto exacto indicado<br />
          2. Guarda el comprobante de pago<br />
          3. Envía el comprobante por WhatsApp<br />
          4. Tu dinero será procesado inmediatamente
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
