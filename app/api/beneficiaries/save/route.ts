import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

interface SaveBeneficiaryRequest {
  userId: string
  fullName: string
  pagomovilPhone: string
  countryCode: string
  bank: string
  bankName: string
  cedula: string
}

export async function POST(request: NextRequest) {
  try {
    const requestData: SaveBeneficiaryRequest = await request.json()

    const { userId, fullName, pagomovilPhone, countryCode, bank, bankName, cedula } = requestData

    if (!userId || !fullName || !pagomovilPhone || !bank || !cedula) {
      return NextResponse.json(
        { error: "Todos los datos del beneficiario son requeridos" },
        { status: 400 }
      )
    }

    // Extraer tipo y número de la cédula (formato: "V-12345678")
    const cedulaParts = cedula.split("-")
    const documentType = cedulaParts[0] || "V"
    const documentNumber = cedulaParts[1] || cedula

    // Construir el número de teléfono completo con código de país
    const fullPhone = `${countryCode}${pagomovilPhone}`

    // Verificar si el beneficiario ya existe (por phone + user_id)
    const { data: existingBeneficiary, error: checkError } = await supabaseServer
      .from("beneficiaries")
      .select("id")
      .eq("user_id", userId)
      .eq("phone", fullPhone)
      .maybeSingle()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("[v0] Error checking beneficiary - Full error:", {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
      })
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
          phone: fullPhone,
          bank_code: bank,
          bank_name: bankName,
          document_type: documentType,
          document_number: documentNumber,
          country: countryCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingBeneficiary.id)
        .select()
        .maybeSingle()

      if (updateError) {
        console.error("[v0] Error updating beneficiary - Full error:", {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        })
        return NextResponse.json(
          { error: `Error actualizando beneficiario: ${updateError.message}` },
          { status: 500 }
        )
      }
      beneficiary = updated
      console.log("[v0] Beneficiary updated successfully:", beneficiary.id)
    } else {
      // Crear nuevo beneficiario
      const { data: newBeneficiary, error: insertError } = await supabaseServer
        .from("beneficiaries")
        .insert({
          user_id: userId,
          full_name: fullName,
          phone: fullPhone,
          bank_code: bank,
          bank_name: bankName,
          document_type: documentType,
          document_number: documentNumber,
          country: countryCode,
        })
        .select()
        .maybeSingle()

      if (insertError) {
        console.error("[v0] Error creating beneficiary - Full error:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        })
        return NextResponse.json(
          { error: `Error creando beneficiario: ${insertError.message}` },
          { status: 500 }
        )
      }
      beneficiary = newBeneficiary
      console.log("[v0] Beneficiary created successfully:", beneficiary.id)
    }

    return NextResponse.json(
      {
        beneficiary,
        message: "Beneficiario guardado exitosamente",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Error in POST /api/beneficiaries/save - Full error:", error)
    return NextResponse.json(
      { error: `Error interno: ${error}` },
      { status: 500 }
    )
  }
}
