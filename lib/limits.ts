// Sistema de límites progresivos para ZinpleApp

export interface UserLimits {
  currentLimit: number
  nextLimit: number | null
  operationsToNext: number
  isAtMaximum: boolean
}

/**
 * Calcula el límite actual del usuario basado en operaciones completadas
 * - Primera operación: $10 USD
 * - Segunda operación: $100 USD
 * - Tercera operación: $200 USD
 * - Cuarta operación: $300 USD
 * - Y así hasta llegar a $1000 USD máximo
 */
export function calculateUserLimit(completedOperations: number): number {
  if (completedOperations === 0) {
    return 10 // Primera operación
  }

  if (completedOperations === 1) {
    return 100 // Segunda operación
  }

  // A partir de la tercera operación: 200, 300, 400... hasta 1000
  const progressiveLimit = completedOperations * 100
  return Math.min(progressiveLimit, 1000) // Máximo $1000
}

/**
 * Obtiene información completa sobre los límites del usuario
 */
export function getUserLimits(completedOperations: number): UserLimits {
  const currentLimit = calculateUserLimit(completedOperations)

  // Calcular próximo límite
  let nextLimit: number | null = null
  let operationsToNext = 0

  if (currentLimit < 1000) {
    const nextOperations = completedOperations + 1
    nextLimit = calculateUserLimit(nextOperations)
    operationsToNext = 1
  }

  return {
    currentLimit,
    nextLimit,
    operationsToNext,
    isAtMaximum: currentLimit >= 1000,
  }
}

/**
 * Verifica si un monto está dentro del límite permitido
 */
export function isAmountWithinLimit(
  amount: number,
  completedOperations: number,
  isThirdPartyPayment = false,
): { isValid: boolean; currentLimit: number; message?: string } {
  // Para pagos de terceros, siempre aplicar límite de $10 en la primera operación
  if (isThirdPartyPayment) {
    return {
      isValid: amount <= 10,
      currentLimit: 10,
      message: amount > 10 ? "Los pagos de terceros tienen un límite de $10 USD para la primera operación" : undefined,
    }
  }

  const currentLimit = calculateUserLimit(completedOperations)

  return {
    isValid: amount <= currentLimit,
    currentLimit,
    message: amount > currentLimit ? `Tu límite actual es de $${currentLimit} USD` : undefined,
  }
}

/**
 * Genera mensaje explicativo sobre el sistema de límites
 */
export function getLimitExplanation(completedOperations: number): string {
  const limits = getUserLimits(completedOperations)

  if (completedOperations === 0) {
    return "Como usuario nuevo, tu primera operación tiene un límite de $10 USD por seguridad. Después de esta operación, tu límite aumentará a $100 USD."
  }

  if (limits.isAtMaximum) {
    return "¡Felicidades! Has alcanzado el límite máximo de $1,000 USD por operación."
  }

  return `Tu límite actual es de $${limits.currentLimit} USD. Después de tu próxima operación exitosa, aumentará a $${limits.nextLimit} USD.`
}
