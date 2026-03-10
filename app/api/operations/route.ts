import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { OperationMode } from "@/types/database"

// Cliente servidor con Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Tipos para la request
interface CreateOperationRequest {
  mode: OperationMode
  currencyPair: string
  sourceCurrency: string
  destinationCurrency: string
  sourceAmount: number
  destinationAmount: number
  exchangeRate: number
  feePercentage: number
  feeAmount: number
  // Datos del usuario que crea
  user: {
    email: string
    fullName?: string
    phone?: string
    documentType?: string
    documentNumber?: string
    country?: string
  }
  // Datos del beneficiario (modo send)
  beneficiary?: {
    fullName: string
    phone: string
    email?: string
    bankCode?: string
    bankName?: string
    walletAddress?: string
  }
  // Datos del remitente (modo receive)
  sender?: {
    fullName: string
    email?: string
    phone?: string
    country?: string
  }
  // Datos de destino (pago móvil, wallet, etc.)
  destination?: {
    bankCode?: string
    bankName?: string
    phone?: string
    document?: string
    walletAddress?: string
  }
  // Método de pago
  paymentMethod?: string
}

export async function POST(request: NextRequest) {
  try {
    const requestData: CreateOperationRequest = await request.json()

    console.log("API: Creating operation with mode:", requestData.mode)

    const { user, beneficiary, sender, destination } = requestData

    if (!user?.email) {
      return NextResponse.json({ error: "Email de usuario requerido" }, { status: 400 })
    }

    if (!requestData.mode || !requestData.currencyPair) {
      return NextResponse.json({ error: "Modo y par de divisas requeridos" }, { status: 400 })
    }

    // 1. Buscar o crear usuario
    let dbUser = null
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("email", user.email)
      .maybeSingle()

    if (userCheckError && userCheckError.code !== "PGRST116") {
      console.error("Error checking user:", userCheckError)
      return NextResponse.json({ error: "Error verificando usuario" }, { status: 500 })
    }

    if (existingUser) {
      // Actualizar usuario existente si hay datos nuevos
      const updateData: Record<string, unknown> = {}
      if (user.fullName && user.fullName !== existingUser.full_name) {
        updateData.full_name = user.fullName
      }
      if (user.phone && user.phone !== existingUser.phone) {
        updateData.phone = user.phone
      }
      if (user.documentType) updateData.document_type = user.documentType
      if (user.documentNumber) updateData.document_number = user.documentNumber
      if (user.country) updateData.country = user.country

      if (Object.keys(updateData).length > 0) {
        const { data: updated, error: updateError } = await supabaseAdmin
          .from("users")
          .update(updateData)
          .eq("email", user.email)
        .select()
        .maybeSingle()

      if (updateError) {
          console.error("Error updating user:", updateError)
        } else {
          dbUser = updated
        }
      } else {
        dbUser = existingUser
      }
    } else {
      // Crear nuevo usuario
      const { data: newUser, error: createError } = await supabaseAdmin
        .from("users")
        .insert({
          email: user.email,
          full_name: user.fullName || null,
          phone: user.phone || null,
          document_type: user.documentType || null,
          document_number: user.documentNumber || null,
          country: user.country || null,
        })
        .select()
        .maybeSingle()

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ error: `Error creando usuario: ${createError.message}` }, { status: 500 })
      }
      dbUser = newUser
    }

    // 2. Crear la operación
    const operationData: Record<string, unknown> = {
      mode: requestData.mode,
      status: "pending",
      currency_pair: requestData.currencyPair,
      source_currency: requestData.sourceCurrency,
      destination_currency: requestData.destinationCurrency,
      source_amount: requestData.sourceAmount,
      destination_amount: requestData.destinationAmount,
      exchange_rate: requestData.exchangeRate,
      fee_percentage: requestData.feePercentage,
      fee_amount: requestData.feeAmount,
      // Datos del usuario
      user_id: dbUser?.id || null,
      user_email: user.email,
      user_phone: user.phone || null,
      user_full_name: user.fullName || null,
      user_document_type: user.documentType || null,
      user_document_number: user.documentNumber || null,
      user_country: user.country || null,
      // Método de pago
      payment_method: requestData.paymentMethod || null,
    }

    // Agregar datos del beneficiario si aplica
    if (beneficiary) {
      operationData.beneficiary_full_name = beneficiary.fullName
      operationData.beneficiary_phone = beneficiary.phone
      operationData.beneficiary_email = beneficiary.email || null
      operationData.beneficiary_bank_code = beneficiary.bankCode || null
      operationData.beneficiary_bank_name = beneficiary.bankName || null
      operationData.beneficiary_wallet_address = beneficiary.walletAddress || null
    }

    // Agregar datos del remitente si aplica (modo receive)
    if (sender) {
      operationData.sender_full_name = sender.fullName
      operationData.sender_email = sender.email || null
      operationData.sender_phone = sender.phone || null
      operationData.sender_country = sender.country || null
    }

    // Agregar datos de destino si aplica
    if (destination) {
      operationData.destination_bank_code = destination.bankCode || null
      operationData.destination_bank_name = destination.bankName || null
      operationData.destination_phone = destination.phone || null
      operationData.destination_document = destination.document || null
      operationData.destination_wallet_address = destination.walletAddress || null
    }

    console.log("API: Inserting operation:", operationData)

    const { data: operation, error: operationError } = await supabaseAdmin
      .from("operations")
      .insert(operationData)
      .select()
      .maybeSingle()

    if (operationError) {
      console.error("Error creating operation:", operationError)
      return NextResponse.json({ error: `Error creando operación: ${operationError.message}` }, { status: 500 })
    }

    // 3. Registrar en operation_logs
    await supabaseAdmin.from("operation_logs").insert({
      operation_id: operation.id,
      previous_status: null,
      new_status: "pending",
      changed_by: "system",
      notes: "Operación creada - pendiente de pago",
    })

    console.log("API: Operation created successfully:", operation.operation_number)

    return NextResponse.json({ 
      operation,
      message: "Operación creada exitosamente" 
    }, { status: 201 })

  } catch (error) {
    console.error("Error in POST /api/operations:", error)
    return NextResponse.json({ error: `Error interno: ${error}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const operationNumber = searchParams.get("operation_number")

    if (!id && !operationNumber) {
      return NextResponse.json({ error: "Se requiere ID o número de operación" }, { status: 400 })
    }

    let query = supabaseAdmin.from("operations").select("*")
    
    if (id) {
      query = query.eq("id", id)
    } else if (operationNumber) {
      query = query.eq("operation_number", operationNumber)
    }

    const { data: operation, error } = await query.maybeSingle()

    if (error) {
      console.error("Error getting operation:", error)
      return NextResponse.json({ error: "Operación no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ operation })
  } catch (error) {
    console.error("Error in GET /api/operations:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { operationId, status, changedBy, notes } = await request.json()

    if (!operationId || !status) {
      return NextResponse.json({ error: "ID y estado requeridos" }, { status: 400 })
    }

    // Obtener estado actual
    const { data: currentOp, error: getError } = await supabaseAdmin
      .from("operations")
      .select("status")
      .eq("id", operationId)
      .maybeSingle()

    if (getError) {
      return NextResponse.json({ error: "Operación no encontrada" }, { status: 404 })
    }

    // Actualizar operación
    const updateData: Record<string, unknown> = { status }
    
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
    } else if (status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString()
    }

    const { data: operation, error: updateError } = await supabaseAdmin
      .from("operations")
      .update(updateData)
      .eq("id", operationId)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error("Error updating operation:", updateError)
      return NextResponse.json({ error: "Error actualizando operación" }, { status: 500 })
    }

    // Registrar cambio en logs
    await supabaseAdmin.from("operation_logs").insert({
      operation_id: operationId,
      previous_status: currentOp.status,
      new_status: status,
      changed_by: changedBy || "system",
      notes: notes || null,
    })

    return NextResponse.json({ operation })
  } catch (error) {
    console.error("Error in PATCH /api/operations:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
