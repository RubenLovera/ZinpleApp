import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

// GET: Obtener todas las tasas de cambio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active_only") === "true"

    let query = supabaseServer
      .from("exchange_rates")
      .select("*")
      .order("currency_pair", { ascending: true })

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data: rates, error } = await query

    if (error) {
      console.error("Error fetching rates:", error)
      return NextResponse.json({ error: "Error al obtener tasas" }, { status: 500 })
    }

    return NextResponse.json({ rates })
  } catch (error) {
    console.error("Error in GET /api/admin/rates:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST: Crear nueva tasa de cambio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      currencyPair, 
      sourceCurrency, 
      destinationCurrency, 
      rate, 
      feePercentage = 0.05,
      minAmount = 1,
      maxAmount = 10000,
      provider,
      adminEmail 
    } = body

    if (!currencyPair || !sourceCurrency || !destinationCurrency || !rate || !adminEmail) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si ya existe
    const { data: existing } = await supabaseServer
      .from("exchange_rates")
      .select("id")
      .eq("currency_pair", currencyPair)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Ya existe una tasa para este par" }, { status: 400 })
    }

    // Crear nueva tasa
    const { data: newRate, error } = await supabaseServer
      .from("exchange_rates")
      .insert({
        currency_pair: currencyPair,
        source_currency: sourceCurrency,
        destination_currency: destinationCurrency,
        rate,
        fee_percentage: feePercentage,
        min_amount: minAmount,
        max_amount: maxAmount,
        provider,
        is_active: true,
        updated_by: adminEmail,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating rate:", error)
      return NextResponse.json({ error: "Error al crear tasa" }, { status: 500 })
    }

    // Registrar en rate_history
    await supabaseServer.from("rate_history").insert({
      exchange_rate_id: newRate.id,
      currency_pair: currencyPair,
      old_rate: null,
      new_rate: rate,
      old_fee_percentage: null,
      new_fee_percentage: feePercentage,
      changed_by_email: adminEmail,
      reason: "Creación de nuevo par",
    })

    // Registrar en admin_action_logs
    await supabaseServer.from("admin_action_logs").insert({
      admin_email: adminEmail,
      action_type: "create_rate",
      target_table: "exchange_rates",
      target_id: newRate.id,
      new_values: { currency_pair: currencyPair, rate, fee_percentage: feePercentage },
    })

    return NextResponse.json({ success: true, rate: newRate })
  } catch (error) {
    console.error("Error in POST /api/admin/rates:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH: Actualizar tasa de cambio
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { rateId, rate, feePercentage, minAmount, maxAmount, isActive, adminEmail, reason } = body

    if (!rateId || !adminEmail) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Obtener tasa actual
    const { data: currentRate, error: fetchError } = await supabaseServer
      .from("exchange_rates")
      .select("*")
      .eq("id", rateId)
      .single()

    if (fetchError || !currentRate) {
      return NextResponse.json({ error: "Tasa no encontrada" }, { status: 404 })
    }

    // Construir objeto de actualización
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: adminEmail,
    }

    if (rate !== undefined) updateData.rate = rate
    if (feePercentage !== undefined) updateData.fee_percentage = feePercentage
    if (minAmount !== undefined) updateData.min_amount = minAmount
    if (maxAmount !== undefined) updateData.max_amount = maxAmount
    if (isActive !== undefined) updateData.is_active = isActive

    // Actualizar tasa
    const { data: updatedRate, error: updateError } = await supabaseServer
      .from("exchange_rates")
      .update(updateData)
      .eq("id", rateId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating rate:", updateError)
      return NextResponse.json({ error: "Error al actualizar tasa" }, { status: 500 })
    }

    // Registrar en rate_history si cambió rate o fee
    if (rate !== undefined || feePercentage !== undefined) {
      await supabaseServer.from("rate_history").insert({
        exchange_rate_id: rateId,
        currency_pair: currentRate.currency_pair,
        old_rate: currentRate.rate,
        new_rate: rate ?? currentRate.rate,
        old_fee_percentage: currentRate.fee_percentage,
        new_fee_percentage: feePercentage ?? currentRate.fee_percentage,
        changed_by_email: adminEmail,
        reason: reason || "Actualización de tasa",
      })
    }

    // Registrar en admin_action_logs
    await supabaseServer.from("admin_action_logs").insert({
      admin_email: adminEmail,
      action_type: isActive === false ? "deactivate_rate" : "update_rate",
      target_table: "exchange_rates",
      target_id: rateId,
      old_values: {
        rate: currentRate.rate,
        fee_percentage: currentRate.fee_percentage,
        is_active: currentRate.is_active,
      },
      new_values: {
        rate: rate ?? currentRate.rate,
        fee_percentage: feePercentage ?? currentRate.fee_percentage,
        is_active: isActive ?? currentRate.is_active,
      },
      notes: reason,
    })

    return NextResponse.json({ success: true, rate: updatedRate })
  } catch (error) {
    console.error("Error in PATCH /api/admin/rates:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar tasa (soft delete - desactivar)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rateId = searchParams.get("id")
    const adminEmail = searchParams.get("admin_email")

    if (!rateId || !adminEmail) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Soft delete (desactivar)
    const { data: updatedRate, error } = await supabaseServer
      .from("exchange_rates")
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
        updated_by: adminEmail,
      })
      .eq("id", rateId)
      .select()
      .single()

    if (error) {
      console.error("Error deleting rate:", error)
      return NextResponse.json({ error: "Error al eliminar tasa" }, { status: 500 })
    }

    // Registrar en admin_action_logs
    await supabaseServer.from("admin_action_logs").insert({
      admin_email: adminEmail,
      action_type: "delete_rate",
      target_table: "exchange_rates",
      target_id: rateId,
      old_values: { is_active: true },
      new_values: { is_active: false },
    })

    return NextResponse.json({ success: true, rate: updatedRate })
  } catch (error) {
    console.error("Error in DELETE /api/admin/rates:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
