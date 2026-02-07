import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Determinar rango de fechas
    const endDate = endDateParam ? new Date(endDateParam) : new Date()
    endDate.setHours(23, 59, 59, 999)

    const startDate = startDateParam
      ? new Date(startDateParam)
      : (() => {
          const d = new Date()
          d.setDate(d.getDate() - 7) // Por defecto últimos 7 días
          d.setHours(0, 0, 0, 0)
          return d
        })()
    startDate.setHours(0, 0, 0, 0)

    // Período anterior para comparación (misma duración)
    const durationMs = endDate.getTime() - startDate.getTime()
    const prevPeriodEnd = new Date(startDate.getTime() - 1000)
    const prevPeriodStart = new Date(prevPeriodEnd.getTime() - durationMs)

    const startDateISO = startDate.toISOString()
    const endDateISO = endDate.toISOString()
    const prevPeriodStartISO = prevPeriodStart.toISOString()
    const prevPeriodEndISO = prevPeriodEnd.toISOString()

    // ==========================================
    // Conteos por estado (actual)
    // ==========================================
    const { count: inProgressCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress")

    const { count: completedCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", startDateISO)
      .lte("completed_at", endDateISO)

    const { count: cancelledCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "cancelled")
      .gte("cancelled_at", startDateISO)
      .lte("cancelled_at", endDateISO)

    // ==========================================
    // Conteos por estado (período anterior)
    // ==========================================
    const { count: completedPrevCount } = await supabaseServer
      .from("operations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", prevPeriodStartISO)
      .lte("completed_at", prevPeriodEndISO)

    // ==========================================
    // Datos por día para gráficos
    // ==========================================
    const { data: operationsByDay } = await supabaseServer
      .from("operations")
      .select(
        `
        id,
        created_at,
        completed_at,
        status,
        source_amount,
        source_currency,
        destination_amount,
        destination_currency,
        currency_pair,
        fee_amount,
        user_email,
        beneficiary_id
      `
      )
      .gte("created_at", startDateISO)
      .lte("created_at", endDateISO)
      .order("created_at", { ascending: true })

    // Procesar datos por día
    const dataByDay: Record<
      string,
      {
        date: string
        gtv: number
        ttv: number
        revenue: number
        newUsers: Set<string>
        newBeneficiaries: Set<string>
        pairVolume: Record<string, number>
      }
    > = {}

    operationsByDay?.forEach((op) => {
      const date = new Date(op.created_at).toISOString().split("T")[0]
      if (!dataByDay[date]) {
        dataByDay[date] = {
          date,
          gtv: 0,
          ttv: 0,
          revenue: 0,
          newUsers: new Set(),
          newBeneficiaries: new Set(),
          pairVolume: {},
        }
      }

      // GTV (Gross Transaction Volume) - suma de source_amount si completed
      if (op.status === "completed") {
        dataByDay[date].gtv += op.source_amount || 0
        dataByDay[date].ttv += 1
      }

      // Revenue (fees)
      dataByDay[date].revenue += op.fee_amount || 0

      // Track usuarios únicos
      if (op.user_email) dataByDay[date].newUsers.add(op.user_email)
      // Track beneficiarios únicos (usando beneficiary_id)
      if (op.beneficiary_id) dataByDay[date].newBeneficiaries.add(op.beneficiary_id)

      // Volumen por par
      const pair = op.currency_pair?.replace("_", "-") || "Unknown"
      dataByDay[date].pairVolume[pair] = (dataByDay[date].pairVolume[pair] || 0) + 1
    })

    // Convertir a array y calcular conteos
    const chartData = Object.values(dataByDay).map((day) => ({
      date: day.date,
      gtv: Math.round(day.gtv * 100) / 100,
      ttv: day.ttv,
      revenue: Math.round(day.revenue * 100) / 100,
      uniqueUsers: day.newUsers.size,
      uniqueBeneficiaries: day.newBeneficiaries.size,
    }))

    // Totales
    const totalGTV = Math.round(chartData.reduce((sum, d) => sum + d.gtv, 0) * 100) / 100
    const totalTTV = chartData.reduce((sum, d) => sum + d.ttv, 0)
    const totalRevenue = Math.round(chartData.reduce((sum, d) => sum + d.revenue, 0) * 100) / 100
    const totalUniqueUsers = new Set(operationsByDay?.map((op) => op.user_email).filter(Boolean))
      .size
    const totalUniqueBeneficiaries = new Set(
      operationsByDay?.map((op) => op.beneficiary_id).filter(Boolean)
    ).size

    // ==========================================
    // Datos período anterior para comparación
    // ==========================================
    const { data: prevOperationsByDay } = await supabaseServer
      .from("operations")
      .select("source_amount, status, fee_amount")
      .gte("created_at", prevPeriodStartISO)
      .lte("created_at", prevPeriodEndISO)

    const prevGTV =
      prevOperationsByDay?.reduce((sum, op) => (op.status === "completed" ? sum + (op.source_amount || 0) : sum), 0) || 0
    const prevTTV = prevOperationsByDay?.filter((op) => op.status === "completed").length || 0
    const prevRevenue =
      prevOperationsByDay?.reduce((sum, op) => sum + (op.fee_amount || 0), 0) || 0

    // Calcular cambios porcentuales
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    // ==========================================
    // Distribución por par
    // ==========================================
    const pairDistribution: Record<string, number> = {}
    operationsByDay?.forEach((op) => {
      const pair = op.currency_pair?.replace("_", "-") || "Unknown"
      pairDistribution[pair] = (pairDistribution[pair] || 0) + 1
    })

    const topPairs = Object.entries(pairDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pair, count]) => ({ name: pair, value: count }))

    // ==========================================
    // Tasas activas
    // ==========================================
    const { data: activeRates, count: totalRates } = await supabaseServer
      .from("exchange_rates")
      .select("*", { count: "exact" })
      .eq("is_active", true)

    const stats = {
      // KPIs con comparación
      kpis: {
        gtv: {
          current: totalGTV,
          previous: Math.round(prevGTV * 100) / 100,
          change: calculateChange(totalGTV, prevGTV),
        },
        ttv: {
          current: totalTTV,
          previous: prevTTV,
          change: calculateChange(totalTTV, prevTTV),
        },
        revenue: {
          current: totalRevenue,
          previous: Math.round(prevRevenue * 100) / 100,
          change: calculateChange(totalRevenue, prevRevenue),
        },
        uniqueBeneficiaries: {
          current: totalUniqueBeneficiaries,
          previous: 0,
          change: 0,
        },
      },
      // Datos por día para gráficos
      chartData,
      // Distribución
      pairDistribution: topPairs,
      // Conteos de estado
      byStatus: {
        in_progress: inProgressCount || 0,
        completed: completedCount || 0,
        cancelled: cancelledCount || 0,
      },
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
