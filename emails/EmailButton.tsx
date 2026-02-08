import React from 'react'
import { Button } from '@react-email/components'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}

export const EmailButton: React.FC<EmailButtonProps> = ({
  href,
  children,
  variant = 'primary',
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return '#7c3aed' // Purple
      case 'secondary':
        return '#10b981' // Green
      case 'danger':
        return '#ef4444' // Red
      default:
        return '#7c3aed'
    }
  }

  return (
    <Button
      href={href}
      style={{
        backgroundColor: getBackgroundColor(),
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '12px 24px',
        textDecoration: 'none',
        borderRadius: '6px',
        display: 'inline-block',
        textAlign: 'center' as const,
      }}
    >
      {children}
    </Button>
  )
}
