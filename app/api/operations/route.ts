import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { OperationData } from "@/types/database"
import { isAmountWithinLimit, calculateUserLimit } from "@/lib/limits"
import {
  sendWelcomeEmail,
  sendOperationCreatedEmail,
  sendOperationCompletedEmail,
  sendOperationCancelledEmail,
} from "@/lib/email-service"

// Cliente servidor con Service Role Key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const requestData: OperationData = await request.json()

    console.log("API: Creating operation:", requestData.id)
    console.log("API: Request data structure:", JSON.stringify(requestData, null, 2))

    // Extract user data from the correct structure
    const userData = requestData.user
    const quote = requestData.quote
    const thirdParty = requestData.thirdParty
    const isThirdPartyPayment = requestData.isThirdPartyPayment

    if (!userData || !userData.email) {
      console.error("Missing user data or email")
      return NextResponse.json({ error: "Missing user data" }, { status: 400 })
    }

    // Verificar límites de seguridad ANTES de crear la operación
    console.log("API: Checking security limits for amount:", quote.amount)

    // Verificar si es usuario nuevo y obtener operaciones completadas
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", userData.email)
      .single()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking for existing user:", userCheckError)
      return NextResponse.json({ error: "Failed to check user" }, { status: 500 })
    }

    const isUserExisting = !!existingUser
    const completedOperations = existingUser?.completed_operations || 0

    console.log("API: User existing status:", isUserExisting)
    console.log("API: User completed operations:", completedOperations)

    // VALIDACIÓN DE LÍMITES usando el nuevo sistema
    const limitCheck = isAmountWithinLimit(quote.amount, completedOperations, isThirdPartyPayment)

    if (!limitCheck.isValid) {
      console.error("API: Amount exceeds limit:", quote.amount, "Current limit:", limitCheck.currentLimit)
      return NextResponse.json(
        {
          error: limitCheck.message || `El monto excede tu límite actual de $${limitCheck.currentLimit} USD.`,
        },
        { status: 400 },
      )
    }

    console.log("API: Security limits passed, proceeding with operation creation")

    // Crear o actualizar usuario
    let user
    let isNewUser = false

    if (existingUser) {
      console.log("API: Updating existing user")
      const updateData = {
        full_name: userData.fullName,
        phone: userData.phone || existingUser.phone,
        wallet_address: userData.walletAddress || existingUser.wallet_address,
        user_type: userData.userType || existingUser.user_type,
        monthly_volume_expected: userData.monthlyVolumeExpected || existingUser.monthly_volume_expected,
        receives_third_party_payments:
          userData.receivesThirdPartyPayments ?? existingUser.receives_third_party_payments,
        expected_third_parties: userData.expectedThirdParties || existingUser.expected_third_parties,
        updated_at: new Date().toISOString(),
      }

      console.log("API: Update data:", updateData)

      const { data: updatedUser, error } = await supabaseAdmin
        .from("users")
        .update(updateData)
        .eq("email", userData.email)
        .select()
        .single()

      if (error) {
        console.error("Error updating user:", error)
        return NextResponse.json({ error: `Failed to update user: ${error.message}` }, { status: 500 })
      }
      user = updatedUser
    } else {
      console.log("API: Creating new user")
      isNewUser = true

      const insertData = {
        email: userData.email,
        full_name: userData.fullName,
        phone: userData.phone || "",
        wallet_address: userData.walletAddress || null,
        user_type: userData.userType || "persona",
        monthly_volume_expected: userData.monthlyVolumeExpected || 0,
        receives_third_party_payments: userData.receivesThirdPartyPayments || false,
        expected_third_parties: userData.expectedThirdParties || 0,
        current_limit: 10, // Límite inicial
        completed_operations: 0,
      }

      console.log("API: Insert data:", insertData)

      const { data: newUser, error } = await supabaseAdmin.from("users").insert(insertData).select().single()

      if (error) {
        console.error("Error creating user:", error)
        return NextResponse.json({ error: `Failed to create user: ${error.message}` }, { status: 500 })
      }
      user = newUser
    }

    console.log("API: User processed successfully:", user.email)

    // Crear operación - usando solo los campos básicos que existen en el esquema
    const operationInsert = {
      id: requestData.id,
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

    console.log("API: Creating operation with validated data:", operationInsert)

    const { data: operation, error: operationError } = await supabaseAdmin
      .from("operations")
      .insert(operationInsert)
      .select()
      .single()

    if (operationError) {
      console.error("Error creating operation:", operationError)
      return NextResponse.json({ error: `Failed to create operation: ${operationError.message}` }, { status: 500 })
    }

    console.log("API: Operation created successfully with limits validated:", operation.id)

    // ENVIAR EMAILS DE NOTIFICACIÓN
    try {
      // 1. Email de bienvenida para usuarios nuevos
      if (isNewUser) {
        console.log("API: Sending welcome email to new user:", userData.email)
        await sendWelcomeEmail(userData.email, userData.fullName)
      }

      // 2. Email de operación creada
      console.log("API: Sending operation created email:", operation.id)
      await sendOperationCreatedEmail(
        userData.email,
        userData.fullName,
        operation.id,
        quote.amount,
        quote.currency,
        quote.result,
        isThirdPartyPayment,
        thirdParty?.name,
      )
    } catch (emailError) {
      console.error("Error sending notification emails:", emailError)
      // No fallar la operación por errores de email
    }

    return NextResponse.json({ operation }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/operations:", error)
    return NextResponse.json({ error: `Internal server error: ${error}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Operation ID is required" }, { status: 400 })
    }

    const { data: operation, error } = await supabaseAdmin.from("operations").select("*").eq("id", id).single()

    if (error) {
      console.error("Error getting operation:", error)
      return NextResponse.json({ error: "Operation not found" }, { status: 404 })
    }

    return NextResponse.json({ operation })
  } catch (error) {
    console.error("Error in GET /api/operations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Nuevo endpoint para completar operaciones y actualizar límites
export async function PATCH(request: NextRequest) {
  try {
    const { operationId, status, reason } = await request.json()

    if (!operationId || !status) {
      return NextResponse.json({ error: "Operation ID and status are required" }, { status: 400 })
    }

    // Actualizar el estado de la operación
    const { data: operation, error: updateError } = await supabaseAdmin
      .from("operations")
      .update({ status })
      .eq("id", operationId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating operation:", updateError)
      return NextResponse.json({ error: "Failed to update operation" }, { status: 500 })
    }

    // Obtener datos del usuario para los emails
    const { data: currentUser, error: getUserError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", operation.user_email)
      .single()

    if (getUserError) {
      console.error("Error getting user for email:", getUserError)
    }

    // Si la operación se completó exitosamente, actualizar el contador del usuario
    if (status === "completed") {
      if (currentUser) {
        // Calcular nuevo límite basado en operaciones completadas
        const newCompletedOperations = (currentUser.completed_operations || 0) + 1
        const newLimit = calculateUserLimit(newCompletedOperations)

        // Actualizar usuario con nuevo contador y límite
        const { error: userUpdateError } = await supabaseAdmin
          .from("users")
          .update({
            completed_operations: newCompletedOperations,
            current_limit: newLimit,
            updated_at: new Date().toISOString(),
          })
          .eq("email", operation.user_email)

        if (userUpdateError) {
          console.error("Error updating user completed operations:", userUpdateError)
          // No fallar la operación por esto, solo logear el error
        } else {
          console.log(
            `User ${operation.user_email} limit updated to $${newLimit} after ${newCompletedOperations} completed operations`,
          )

          // ENVIAR EMAIL DE OPERACIÓN COMPLETADA
          try {
            console.log("API: Sending operation completed email:", operation.id)
            await sendOperationCompletedEmail(
              currentUser.email,
              currentUser.full_name,
              operation.id,
              operation.amount,
              operation.currency,
              operation.result,
              newLimit,
            )
          } catch (emailError) {
            console.error("Error sending operation completed email:", emailError)
            // No fallar la operación por errores de email
          }
        }
      }
    }

    // Si la operación se canceló, enviar email de cancelación
    if (status === "cancelled" && currentUser) {
      try {
        console.log("API: Sending operation cancelled email:", operation.id)
        await sendOperationCancelledEmail(
          currentUser.email,
          currentUser.full_name,
          operation.id,
          operation.amount,
          operation.currency,
          operation.result,
          reason, // Pasar el motivo de cancelación
        )
      } catch (emailError) {
        console.error("Error sending operation cancelled email:", emailError)
        // No fallar la operación por errores de email
      }
    }

    return NextResponse.json({ operation })
  } catch (error) {
    console.error("Error in PATCH /api/operations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
