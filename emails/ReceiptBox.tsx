import React from 'react'
import { Row, Section, Text, Column } from '@react-email/components'

interface ReceiptLineProps {
  label: string
  value: string
  isBold?: boolean
}

interface ReceiptBoxProps {
  title: string
  lines: ReceiptLineProps[]
}

const ReceiptLine: React.FC<ReceiptLineProps> = ({ label, value, isBold = false }) => {
  return (
    <Row style={{ paddingBottom: '8px' }}>
      <Column style={{ width: '50%' }}>
        <Text style={receiptLabel}>{label}</Text>
      </Column>
      <Column style={{ width: '50%', textAlign: 'right' }}>
        <Text
          style={{
            ...receiptValue,
            fontWeight: isBold ? 'bold' : 'normal',
            color: isBold ? '#1f2937' : '#6b7280',
          }}
        >
          {value}
        </Text>
      </Column>
    </Row>
  )
}

export const ReceiptBox: React.FC<ReceiptBoxProps> = ({ title, lines }) => {
  return (
    <Section style={receiptBoxStyle}>
      <Text style={receiptTitle}>{title}</Text>
      {lines.map((line, index) => (
        <ReceiptLine
          key={index}
          label={line.label}
          value={line.value}
          isBold={line.isBold}
        />
      ))}
    </Section>
  )
}

const receiptBoxStyle = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
}

const receiptTitle = {
  fontSize: '14px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 12px 0',
  paddingBottom: '12px',
  borderBottom: '1px solid #d1d5db',
}

const receiptLabel = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
  fontWeight: 'normal',
}

const receiptValue = {
  fontSize: '13px',
  color: '#1f2937',
  margin: '0',
}
