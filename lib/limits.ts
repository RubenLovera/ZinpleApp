// Sistema de límites - DESHABILITADO PARA LANZAMIENTO
// No hay límites de usuario. Todos los usuarios pueden operar por cualquier monto.

export interface UserLimits {
  currentLimit: number
  nextLimit: number | null
  operationsToNext: number
  isAtMaximum: boolean
}

/**
 * Calcula el límite actual - DESHABILITADO
 * Retorna valor infinito (sin límite)
 */
export function calculateUserLimit(completedOperations: number): number {
  return Infinity
}

/**
 * Obtiene información completa sobre los límites - SIN LÍMITES ACTIVOS
 */
export function getUserLimits(completedOperations: number): UserLimits {
  return {
    currentLimit: Infinity,
    nextLimit: null,
    operationsToNext: 0,
    isAtMaximum: false,
  }
}

/**
 * Verifica si un monto está dentro del límite - SIEMPRE RETORNA VÁLIDO
 */
export function isAmountWithinLimit(
  amount: number,
  completedOperations: number,
  isThirdPartyPayment = false,
): { isValid: boolean; currentLimit: number; message?: string } {
  // Sin límites - siempre válido
  return {
    isValid: true,
    currentLimit: Infinity,
  }
}

/**
 * Genera mensaje explicativo - SIN LÍMITES
 */
export function getLimitExplanation(completedOperations: number): string {
  return "Puedes operar por cualquier monto sin restricciones de límite."
}
