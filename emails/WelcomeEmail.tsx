import React from 'react'
import { Section, Text } from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import { EmailButton } from './EmailButton'

interface WelcomeEmailProps {
  userName: string
  whatsappNumber: string
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userName, whatsappNumber }) => {
  return (
    <EmailLayout preview="Bienvenido a Zinple">
      <Section style={section}>
        <Text style={heading}>¡Bienvenido a Zinple!</Text>
        <Text style={paragraph}>
          Hola {userName},
        </Text>
        <Text style={paragraph}>
          Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a enviar dinero, recibir transferencias, comprar o vender USDT de forma rápida y segura.
        </Text>
      </Section>

      <Section style={{ ...section, textAlign: 'center' }}>
        <EmailButton href="https://www.zinpleapp.com">
          Ir a Zinple
        </EmailButton>
      </Section>

      <Section style={section}>
        <Text style={subheading}>¿Necesitas ayuda?</Text>
        <Text style={paragraph}>
          Si tienes alguna pregunta, estamos disponibles en WhatsApp:
        </Text>
        <Text style={{ ...paragraph, textAlign: 'center' }}>
          <EmailButton href={`https://wa.me/${whatsappNumber}`} variant="secondary">
            Contactar por WhatsApp
          </EmailButton>
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
