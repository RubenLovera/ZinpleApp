import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"

    // Obtener operaciones según el estado solicitado
    const { data: operations, error } = await supabaseServer
      .from("operations")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(50) // Limitar a 50 operaciones para mejor rendimiento

    if (error) {
      console.error("Error fetching operations:", error)
      return NextResponse.json({ error: "Error al obtener operaciones" }, { status: 500 })
    }

    return NextResponse.json({ operations })
  } catch (error) {
    console.error("Error in GET /api/admin/operations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
