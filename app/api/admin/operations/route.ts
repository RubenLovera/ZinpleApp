import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

// GET: Obtener operaciones con filtros avanzados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Filtros
    const status = searchParams.get("status") // pending, awaiting_payment, processing, completed, cancelled
    const mode = searchParams.get("mode") // send, receive, buy_usdt, sell_usdt
    const currencyPair = searchParams.get("currency_pair") // CLP_VES, USD_VES, etc.
    const search = searchParams.get("search") // Búsqueda por email, nombre, número de operación
    const dateFrom = searchParams.get("date_from")
    const dateTo = searchParams.get("date_to")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Construir query
    let query = supabaseServer
      .from("operations")
      .select("*", { count: "exact" })

    // Aplicar filtros
    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    
    if (mode && mode !== "all") {
      query = query.eq("mode", mode)
    }
    
    if (currencyPair && currencyPair !== "all") {
      query = query.eq("currency_pair", currencyPair)
    }
    
    if (search) {
      query = query.or(`user_email.ilike.%${search}%,user_full_name.ilike.%${search}%,operation_number.ilike.%${search}%`)
    }
    
    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }
    
    if (dateTo) {
      query = query.lte("created_at", dateTo)
    }

    // Ordenar y paginar
    const { data: operations, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching operations:", error)
      return NextResponse.json({ error: "Error al obtener operaciones" }, { status: 500 })
    }

    return NextResponse.json({ 
      operations,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error("Error in GET /api/admin/operations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH: Actualizar estado de operación
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { operationId, action, adminEmail, notes } = body

    if (!operationId || !action || !adminEmail) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Obtener operación actual
    const { data: currentOperation, error: fetchError } = await supabaseServer
      .from("operations")
      .select("*")
      .eq("id", operationId)
      .single()

    if (fetchError || !currentOperation) {
      return NextResponse.json({ error: "Operación no encontrada" }, { status: 404 })
    }

    // Determinar nuevo estado según la acción
    let newStatus: string
    const validTransitions: Record<string, string[]> = {
      pending: ["awaiting_payment", "processing", "cancelled"],
      awaiting_payment: ["processing", "cancelled"],
      processing: ["completed", "cancelled"],
      completed: [], // No se puede cambiar desde completado (excepto revivir)
      cancelled: ["pending"], // Solo revivir puede cambiar desde cancelado
    }

    switch (action) {
      case "approve":
        newStatus = "processing"
        break
      case "mark_paid":
        newStatus = "awaiting_payment"
        break
      case "complete":
        newStatus = "completed"
        break
      case "cancel":
        newStatus = "cancelled"
        break
      case "revive":
        newStatus = "pending"
        break
      default:
        return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

    // Validar transición (excepto revivir que es especial)
    if (action !== "revive" && !validTransitions[currentOperation.status]?.includes(newStatus)) {
      return NextResponse.json({ 
        error: `No se puede cambiar de ${currentOperation.status} a ${newStatus}` 
      }, { status: 400 })
    }

    // Actualizar operación
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === "completed") {
      updateData.completed_at = new Date().toISOString()
    }
    if (newStatus === "cancelled") {
      updateData.cancelled_at = new Date().toISOString()
    }

    const { data: updatedOperation, error: updateError } = await supabaseServer
      .from("operations")
      .update(updateData)
      .eq("id", operationId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating operation:", updateError)
      return NextResponse.json({ error: "Error al actualizar operación" }, { status: 500 })
    }

    // Registrar en operation_logs
    await supabaseServer.from("operation_logs").insert({
      operation_id: operationId,
      previous_status: currentOperation.status,
      new_status: newStatus,
      changed_by: adminEmail,
      notes: notes || `Acción: ${action}`,
    })

    // Registrar en admin_action_logs
    await supabaseServer.from("admin_action_logs").insert({
      admin_email: adminEmail,
      action_type: action,
      target_table: "operations",
      target_id: operationId,
      old_values: { status: currentOperation.status },
      new_values: { status: newStatus },
      notes,
    })

    return NextResponse.json({ 
      success: true, 
      operation: updatedOperation 
    })
  } catch (error) {
    console.error("Error in PATCH /api/admin/operations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET operation by ID with logs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { operationId } = body

    if (!operationId) {
      return NextResponse.json({ error: "ID de operación requerido" }, { status: 400 })
    }

    // Obtener operación
    const { data: operation, error: opError } = await supabaseServer
      .from("operations")
      .select("*")
      .eq("id", operationId)
      .single()

    if (opError || !operation) {
      return NextResponse.json({ error: "Operación no encontrada" }, { status: 404 })
    }

    // Obtener logs de la operación
    const { data: logs, error: logsError } = await supabaseServer
      .from("operation_logs")
      .select("*")
      .eq("operation_id", operationId)
      .order("created_at", { ascending: false })

    return NextResponse.json({ 
      operation,
      logs: logs || []
    })
  } catch (error) {
    console.error("Error in POST /api/admin/operations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
