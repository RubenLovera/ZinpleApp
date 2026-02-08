'use client'

import { useEffect, useRef } from 'react'
import { initializeEmailWebhooks } from '@/lib/email-webhooks'

export function useEmailWebhooks() {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initializeEmailWebhooks()
      initialized.current = true
    }
  }, [])
}
