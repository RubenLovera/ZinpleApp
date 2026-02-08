'use client'

import { useEmailWebhooks } from '@/hooks/useEmailWebhooks'

export function EmailWebhooksInitializer() {
  useEmailWebhooks()
  return null
}
