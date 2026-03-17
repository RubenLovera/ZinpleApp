import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

interface SaveBeneficiaryRequest {
  userId: string
  fullName: string
  pagomovilPhone: string
  bank: string
  cedula: string
  relationship: string
}

export async function POST(request: NextRequest) {
  try {
    const requestData: SaveBeneficiaryRequest = await request.json()

    const { userId, fullName, pagomovilPhone, bank, cedula, relationship } = requestData

    if (!userId || !fullName || !pagomovilPhone || !bank || !cedula) {
      return NextResponse.json(
        { error: "Todos los datos del beneficiario son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el beneficiario ya existe (por pagomovil phone + user_id)
    const { data: existingBeneficiary, error: checkError } = await supabaseServer
      .from("beneficiaries")
      .select("id")
      .eq("user_id", userId)
      .eq("pagomovil_phone", pagomovilPhone)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[v0] Error checking beneficiary:", checkError)
      return NextResponse.json(
        { error: "Error verificando beneficiario" },
        { status: 500 }
      )
    }

    let beneficiary

    if (existingBeneficiary) {
      // Actualizar beneficiario existente
      const { data: updated, error: updateError } = await supabaseServer
        .from("beneficiaries")
        .update({
          full_name: fullName,
          pagomovil_phone: pagomovilPhone,
          pagomovil_bank: bank,
          pagomovil_cedula: cedula,
          relationship: relationship,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingBeneficiary.id)
        .select()
        .maybeSingle()

      if (updateError) {
        console.error("[v0] Error updating beneficiary:", updateError)
        return NextResponse.json(
          { error: `Error actualizando beneficiario: ${updateError.message}` },
          { status: 500 }
        )
      }
      beneficiary = updated
      console.log("[v0] Beneficiary updated:", beneficiary.id)
    } else {
      // Crear nuevo beneficiario
      const { data: newBeneficiary, error: insertError } = await supabaseServer
        .from("beneficiaries")
        .insert({
          user_id: userId,
          full_name: fullName,
          pagomovil_phone: pagomovilPhone,
          pagomovil_bank: bank,
          pagomovil_cedula: cedula,
          relationship: relationship,
        })
        .select()
        .maybeSingle()

      if (insertError) {
        console.error("[v0] Error creating beneficiary:", insertError)
        return NextResponse.json(
          { error: `Error creando beneficiario: ${insertError.message}` },
          { status: 500 }
        )
      }
      beneficiary = newBeneficiary
      console.log("[v0] Beneficiary created:", beneficiary.id)
    }

    return NextResponse.json(
      {
        beneficiary,
        message: "Beneficiario guardado exitosamente",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Error in POST /api/beneficiaries/save:", error)
    return NextResponse.json(
      { error: `Error interno: ${error}` },
      { status: 500 }
    )
  }
}
