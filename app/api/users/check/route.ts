import { supabaseServer } from "@/lib/supabase-server"
import type { DBUser } from "@/lib/database"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    const { data: user, error } = await supabaseServer
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (error) {
      console.error("[v0] Error checking user:", error)
      return NextResponse.json({ error: "Failed to check user" }, { status: 500 })
    }

    // Si el usuario no existe, devolver null
    if (!user) {
      return NextResponse.json({ user: null, hasBeneficiaries: false, profileComplete: false })
    }

    // Verificar si tiene beneficiarios guardados
    const { data: beneficiaries, error: benefError } = await supabaseServer
      .from("beneficiaries")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)

    if (benefError) {
      console.error("[v0] Error checking beneficiaries:", benefError)
    }

    // Verificar si el perfil está completo (tiene nombre y teléfono)
    const profileComplete = !!(user.full_name && user.phone)

    return NextResponse.json({
      user,
      hasBeneficiaries: beneficiaries && beneficiaries.length > 0,
      profileComplete,
    })
  } catch (error) {
    console.error("[v0] Error in check user route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
