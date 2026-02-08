import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { ReceiptBox } from './ReceiptBox'

interface NewSessionEmailProps {
  userName: string
  loginDate: string
  city: string
  country: string
  browser: string
  os: string
  ipAddress: string
}

export const NewSessionEmail: React.FC<NewSessionEmailProps> = ({
  userName,
  loginDate,
  city,
  country,
  browser,
  os,
  ipAddress,
}) => {
  return (
    <EmailLayout preview="Nueva sesión en tu cuenta Zinple">
      <Section style={section}>
        <Text style={heading}>Nueva Sesión Detectada</Text>
        <Text style={paragraph}>
          Hola {userName},
        </Text>
        <Text style={paragraph}>
          Detectamos un nuevo acceso a tu cuenta. A continuación encontrarás los detalles de esta sesión.
        </Text>
      </Section>

      <ReceiptBox
        title="Detalles de la Sesión"
        lines={[
          { label: 'Fecha y Hora', value: loginDate, isBold: true },
          { label: 'Ubicación', value: `${city}, ${country}` },
          { label: 'Navegador', value: browser },
          { label: 'Sistema Operativo', value: os },
          { label: 'Dirección IP', value: ipAddress },
        ]}
      />

      <Section style={section}>
        <Text style={paragraph}>
          ¿No fuiste tú? Si no reconoces esta actividad, cambia tu contraseña inmediatamente y contáctanos.
        </Text>
        <Text style={paragraph}>
          Tu seguridad es importante para nosotros.
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
