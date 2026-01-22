import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    // Obtener fecha de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Operaciones pendientes
    const { count: pendingOperations } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    // Operaciones completadas hoy
    const { count: completedToday } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", todayISO)

    // Operaciones canceladas hoy
    const { count: cancelledToday } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gte("created_at", todayISO)

    // Total procesado hoy
    const { data: completedTodayData } = await supabaseServer
      .from("operations")
      .select("amount")
      .eq("status", "completed")
      .gte("created_at", todayISO)

    const totalProcessedToday = completedTodayData?.reduce((sum, op) => sum + op.amount, 0) || 0

    // Total de usuarios
    const { count: totalUsers } = await supabaseServer.from("users").select("*", { count: "exact", head: true })

    const stats = {
      pendingOperations: pendingOperations || 0,
      completedToday: completedToday || 0,
      cancelledToday: cancelledToday || 0,
      totalProcessedToday,
      totalUsers: totalUsers || 0,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/admin/stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
