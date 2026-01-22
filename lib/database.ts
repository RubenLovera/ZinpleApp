import { supabase } from "./supabase"
import type { User, Operation, UserFormData, OperationData } from "@/types/database"

export async function checkUserExists(email: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Error in checkUserExists:", error)
    return null
  }
}

export async function createUser(userData: UserFormData): Promise<User | null> {
  try {
    console.log("Creating new user:", userData.email)

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email: userData.email,
        full_name: userData.fullName,
        phone: userData.phone,
        user_type: userData.userType,
        monthly_volume_expected: userData.monthlyVolumeExpected,
        receives_third_party_payments: userData.receivesThirdPartyPayments,
        expected_third_parties: userData.expectedThirdParties,
        wallet_address: userData.walletAddress,
        // Remove fields that don't exist in the actual schema
        current_limit: 10, // Límite inicial de $10
        completed_operations: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return null
    }

    return newUser
  } catch (error) {
    console.error("Error in createUser:", error)
    return null
  }
}

export async function updateUser(email: string, userData: Partial<UserFormData>): Promise<User | null> {
  try {
    console.log("Updating user:", email)

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (userData.fullName) updateData.full_name = userData.fullName
    if (userData.phone) updateData.phone = userData.phone
    if (userData.userType) updateData.user_type = userData.userType
    if (userData.monthlyVolumeExpected) updateData.monthly_volume_expected = userData.monthlyVolumeExpected
    if (userData.receivesThirdPartyPayments !== undefined)
      updateData.receives_third_party_payments = userData.receivesThirdPartyPayments
    if (userData.expectedThirdParties) updateData.expected_third_parties = userData.expectedThirdParties
    if (userData.walletAddress) updateData.wallet_address = userData.walletAddress

    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("email", email)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return null
    }

    return updatedUser
  } catch (error) {
    console.error("Error in updateUser:", error)
    return null
  }
}

export async function createOperation(operationData: OperationData): Promise<Operation | null> {
  try {
    console.log("Creating operation:", operationData.id)

    // Extract data from the correct structure
    const userData = operationData.user
    const quote = operationData.quote
    const thirdParty = operationData.thirdParty
    const isThirdPartyPayment = operationData.isThirdPartyPayment

    // Verificar si es un pago de tercero y si necesita límite
    const isNewThirdParty = isThirdPartyPayment && thirdParty
    let thirdPartyLimitApplied = false

    if (isNewThirdParty && thirdParty) {
      // Verificar si este tercero ya ha hecho pagos antes
      const { data: existingOperations } = await supabase
        .from("operations")
        .select("id")
        .eq("payer_email", thirdParty.zelleAccount) // Use zelleAccount as identifier
        .limit(1)

      if (!existingOperations || existingOperations.length === 0) {
        // Es un tercero nuevo, aplicar límite de $10
        if (quote.amount > 10) {
          console.error("Third party limit exceeded: $10 maximum for first operation")
          return null
        }
        thirdPartyLimitApplied = true
      }
    }

    // Crear operación usando solo los campos básicos que existen
    const operationInsert = {
      id: operationData.id,
      user_email: userData.email,
      amount: quote.amount,
      currency: quote.currency,
      result: quote.result,
      payer_name: isThirdPartyPayment ? thirdParty?.name : userData.fullName,
      payer_email: userData.email,
      payer_phone: isThirdPartyPayment ? thirdParty?.phone : userData.phone,
      payer_is_user: !isThirdPartyPayment,
      status: "pending",
    }

    const { data: operation, error } = await supabase.from("operations").insert(operationInsert).select().single()

    if (error) {
      console.error("Error creating operation:", error)
      return null
    }

    console.log("Operation created successfully:", operation.id)
    return operation
  } catch (error) {
    console.error("Error in createOperation:", error)
    return null
  }
}

export async function getOperationById(id: string): Promise<Operation | null> {
  try {
    const { data: operation, error } = await supabase.from("operations").select("*").eq("id", id).single()

    if (error) {
      console.error("Error getting operation:", error)
      return null
    }

    return operation
  } catch (error) {
    console.error("Error in getOperationById:", error)
    return null
  }
}

export async function updateOperationStatus(
  id: string,
  status: "pending" | "completed" | "cancelled",
): Promise<boolean> {
  try {
    const { error } = await supabase.from("operations").update({ status }).eq("id", id)

    if (error) {
      console.error("Error updating operation status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateOperationStatus:", error)
    return false
  }
}

// Función para generar ID de operación
export function generateOperationId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
