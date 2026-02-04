import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    // Obtener fecha de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    // Fecha de hace 7 días
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    weekAgo.setHours(0, 0, 0, 0)
    const weekAgoISO = weekAgo.toISOString()

    // Fecha de hace 30 días
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    monthAgo.setHours(0, 0, 0, 0)
    const monthAgoISO = monthAgo.toISOString()

    // ==========================================
    // Conteos por estado
    // ==========================================
    const { count: pendingCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")

    const { count: awaitingPaymentCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "awaiting_payment")

    const { count: processingCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "processing")

    const { count: completedTodayCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", todayISO)

    const { count: cancelledTodayCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gte("cancelled_at", todayISO)

    // ==========================================
    // Volumen procesado
    // ==========================================
    const { data: completedTodayData } = await supabaseServer
      .from("operations")
      .select("source_amount, source_currency")
      .eq("status", "completed")
      .gte("completed_at", todayISO)

    const { data: completedWeekData } = await supabaseServer
      .from("operations")
      .select("source_amount, source_currency")
      .eq("status", "completed")
      .gte("completed_at", weekAgoISO)

    const { data: completedMonthData } = await supabaseServer
      .from("operations")
      .select("source_amount, source_currency")
      .eq("status", "completed")
      .gte("completed_at", monthAgoISO)

    // Calcular volumen (simplificado - suma de source_amount)
    const volumeToday = completedTodayData?.reduce((sum, op) => sum + (op.source_amount || 0), 0) || 0
    const volumeWeek = completedWeekData?.reduce((sum, op) => sum + (op.source_amount || 0), 0) || 0
    const volumeMonth = completedMonthData?.reduce((sum, op) => sum + (op.source_amount || 0), 0) || 0

    // ==========================================
    // Conteos por modo
    // ==========================================
    const { count: sendCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("mode", "send")

    const { count: receiveCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("mode", "receive")

    const { count: buyUsdtCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("mode", "buy_usdt")

    const { count: sellUsdtCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("mode", "sell_usdt")

    // ==========================================
    // Conteos por par de divisas (top 5)
    // ==========================================
    const { data: currencyPairData } = await supabaseServer
      .from("operations")
      .select("currency_pair")

    const pairCounts: Record<string, number> = {}
    currencyPairData?.forEach(op => {
      if (op.currency_pair) {
        pairCounts[op.currency_pair] = (pairCounts[op.currency_pair] || 0) + 1
      }
    })

    const topCurrencyPairs = Object.entries(pairCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pair, count]) => ({ pair, count }))

    // ==========================================
    // Total de usuarios
    // ==========================================
    const { count: totalUsers } = await supabaseServer
      .from("users")
      .select("*", { count: "exact", head: true })

    // ==========================================
    // Operaciones recientes (últimas 10)
    // ==========================================
    const { data: recentOperations } = await supabaseServer
      .from("operations")
      .select("id, operation_number, status, mode, currency_pair, source_amount, source_currency, user_email, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    // ==========================================
    // Tasas activas
    // ==========================================
    const { data: activeRates, count: totalRates } = await supabaseServer
      .from("exchange_rates")
      .select("*", { count: "exact" })
      .eq("is_active", true)

    const stats = {
      // Conteos por estado
      byStatus: {
        pending: pendingCount || 0,
        awaiting_payment: awaitingPaymentCount || 0,
        processing: processingCount || 0,
        completedToday: completedTodayCount || 0,
        cancelledToday: cancelledTodayCount || 0,
      },
      // Volumen
      volume: {
        today: volumeToday,
        week: volumeWeek,
        month: volumeMonth,
      },
      // Conteos por modo
      byMode: {
        send: sendCount || 0,
        receive: receiveCount || 0,
        buy_usdt: buyUsdtCount || 0,
        sell_usdt: sellUsdtCount || 0,
      },
      // Top pares de divisas
      topCurrencyPairs,
      // Usuarios
      totalUsers: totalUsers || 0,
      // Operaciones recientes
      recentOperations: recentOperations || [],
      // Tasas
      rates: {
        active: activeRates || [],
        total: totalRates || 0,
      },
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error in GET /api/admin/stats:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
