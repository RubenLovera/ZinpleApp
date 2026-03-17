import { supabaseServer } from "@/lib/supabase-server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json({ error: "user_id parameter is required" }, { status: 400 })
    }

    // Obtener beneficiarios activos del usuario
    const { data: beneficiaries, error } = await supabaseServer
      .from("beneficiaries")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching beneficiaries:", {
        code: error.code,
        message: error.message,
        details: error.details,
      })
      return NextResponse.json({ error: "Failed to fetch beneficiaries" }, { status: 500 })
    }

    return NextResponse.json({ beneficiaries: beneficiaries || [] })
  } catch (error) {
    console.error("[v0] Error in GET /api/beneficiaries/list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
