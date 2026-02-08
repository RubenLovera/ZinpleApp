import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { ReceiptBox } from './ReceiptBox'

interface BeneficiaryAddedEmailProps {
  userName: string
  beneficiaryName: string
  paymentMethod: string
  addedDate: string
  whatsappNumber: string
}

export const BeneficiaryAddedEmail: React.FC<BeneficiaryAddedEmailProps> = ({
  userName,
  beneficiaryName,
  paymentMethod,
  addedDate,
  whatsappNumber,
}) => {
  return (
    <EmailLayout preview={`Beneficiario agregado: ${beneficiaryName}`}>
      <Section style={section}>
        <Text style={heading}>Nuevo Beneficiario Agregado</Text>
        <Text style={paragraph}>
          Hola {userName},
        </Text>
        <Text style={paragraph}>
          Un nuevo beneficiario ha sido agregado a tu cuenta.
        </Text>
      </Section>

      <ReceiptBox
        title="Información del Beneficiario"
        lines={[
          { label: 'Nombre', value: beneficiaryName, isBold: true },
          { label: 'Método de Pago', value: paymentMethod },
          { label: 'Fecha de Agregación', value: addedDate },
        ]}
      />

      <Section style={section}>
        <Text style={paragraph}>
          Ahora puedes enviar dinero a {beneficiaryName} usando este método de pago.
        </Text>
        <Text style={paragraph}>
          Si no reconoces este beneficiario o tienes preguntas, contáctanos inmediatamente.
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
