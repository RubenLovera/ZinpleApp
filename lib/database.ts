import { supabase } from "./supabase"
import type { OperationMode } from "@/types/database"

// Tipos alineados con el nuevo esquema de BD
export interface DBUser {
  id: string
  email: string
  phone?: string
  full_name?: string
  document_type?: string
  document_number?: string
  country?: string
  created_at: string
  updated_at: string
}

export interface DBOperation {
  id: string
  operation_number: string
  mode: OperationMode
  status: "pending" | "awaiting_payment" | "processing" | "completed" | "cancelled" | "expired"
  currency_pair: string
  source_currency: string
  destination_currency: string
  source_amount: number
  destination_amount: number
  exchange_rate: number
  fee_percentage: number
  fee_amount: number
  user_id?: string
  user_email: string
  user_phone?: string
  user_full_name?: string
  user_document_type?: string
  user_document_number?: string
  user_country?: string
  beneficiary_full_name?: string
  beneficiary_phone?: string
  beneficiary_email?: string
  beneficiary_bank_code?: string
  beneficiary_bank_name?: string
  beneficiary_wallet_address?: string
  sender_full_name?: string
  sender_email?: string
  sender_phone?: string
  sender_country?: string
  destination_bank_code?: string
  destination_bank_name?: string
  destination_phone?: string
  destination_document?: string
  destination_wallet_address?: string
  payment_link?: string
  payment_method?: string
  payment_reference?: string
  notes?: string
  created_at: string
  updated_at: string
}

export async function checkUserExists(email: string): Promise<DBUser | null> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single()

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

export async function createUser(userData: {
  email: string
  fullName?: string
  phone?: string
  documentType?: string
  documentNumber?: string
  country?: string
}): Promise<DBUser | null> {
  try {
    console.log("Creating new user:", userData.email)

    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email: userData.email,
        full_name: userData.fullName || null,
        phone: userData.phone || null,
        document_type: userData.documentType || null,
        document_number: userData.documentNumber || null,
        country: userData.country || null,
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

export async function updateUser(email: string, userData: {
  fullName?: string
  phone?: string
  documentType?: string
  documentNumber?: string
  country?: string
}): Promise<DBUser | null> {
  try {
    console.log("Updating user:", email)

    const updateData: Record<string, unknown> = {}

    if (userData.fullName) updateData.full_name = userData.fullName
    if (userData.phone) updateData.phone = userData.phone
    if (userData.documentType) updateData.document_type = userData.documentType
    if (userData.documentNumber) updateData.document_number = userData.documentNumber
    if (userData.country) updateData.country = userData.country

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

export async function getOperationById(id: string): Promise<DBOperation | null> {
  try {
    const { data: operation, error } = await supabase
      .from("operations")
      .select("*")
      .eq("id", id)
      .single()

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

export async function getOperationByNumber(operationNumber: string): Promise<DBOperation | null> {
  try {
    const { data: operation, error } = await supabase
      .from("operations")
      .select("*")
      .eq("operation_number", operationNumber)
      .single()

    if (error) {
      console.error("Error getting operation by number:", error)
      return null
    }

    return operation
  } catch (error) {
    console.error("Error in getOperationByNumber:", error)
    return null
  }
}

export async function updateOperationStatus(
  id: string,
  status: "pending" | "awaiting_payment" | "processing" | "completed" | "cancelled" | "expired"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("operations")
      .update({ status })
      .eq("id", id)

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

// Obtener tasa de cambio de la BD
export async function getExchangeRate(currencyPair: string): Promise<{
  rate: number
  fee_percentage: number
  min_amount: number
  max_amount: number
} | null> {
  try {
    const { data, error } = await supabase
      .from("exchange_rates")
      .select("rate, fee_percentage, min_amount, max_amount")
      .eq("currency_pair", currencyPair)
      .eq("is_active", true)
      .single()

    if (error) {
      console.error("Error getting exchange rate:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getExchangeRate:", error)
    return null
  }
}
