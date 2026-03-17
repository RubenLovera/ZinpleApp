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

    let hasBeneficiaries = false
    let profileComplete = false

    // Si el usuario existe, verificar si tiene beneficiarios y si su perfil está completo
    if (user) {
      // Verificar beneficiarios
      const { data: beneficiaries, error: benefError } = await supabaseServer
        .from("beneficiaries")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)

      hasBeneficiaries = !benefError && beneficiaries && beneficiaries.length > 0

      // Verificar si el perfil está completo (nombre y teléfono)
      profileComplete = !!(user.full_name && user.phone)
    }

    return NextResponse.json({ user, hasBeneficiaries, profileComplete })
  } catch (error) {
    console.error("[v0] Error in check user route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
