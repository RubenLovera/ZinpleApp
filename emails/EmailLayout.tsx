import React from 'react'
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ preview, children }) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <img
                src="https://www.zinpleapp.com/zinple-logo.png"
                alt="Zinple"
                width="120"
                height="40"
                style={{ display: 'block', margin: '0 auto' }}
              />
            </Row>
          </Section>

          {/* Content */}
          {children}

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © 2026 Zinple. Todos los derechos reservados.
            </Text>
            <Text style={footerText}>
              <Link href="https://www.zinpleapp.com" style={link}>
                zinpleapp.com
              </Link>
              {' | '}
              <Link href="https://wa.me/56956413113" style={link}>
                Contacto WhatsApp
              </Link>
            </Text>
            <Text style={footerText}>
              Este es un email transaccional automático. No responda a este email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '6px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
}

const header = {
  borderBottom: '1px solid #e5e7eb',
  padding: '20px 40px',
  textAlign: 'center' as const,
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 40px',
}

const footer = {
  padding: '20px 40px',
}

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '24px',
  margin: '0',
}

const link = {
  color: '#7c3aed',
  textDecoration: 'underline',
}
