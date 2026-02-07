import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = 20

    let query = supabaseServer.from("users").select(
      `
        id,
        full_name,
        email,
        phone,
        country,
        created_at,
        document_number
      `,
      { count: "exact" }
    )

    // Búsqueda
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    // Ordenamiento
    switch (sortBy) {
      case "total_volume":
        query = query.order("created_at", { ascending: false })
        break
      case "name":
        query = query.order("full_name", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Paginación
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data: users, count } = await query

    // Obtener operaciones por usuario para calcular totales
    const { data: operationStats } = await supabaseServer
      .from("operations")
      .select("user_id, source_amount, status, id", { count: "exact" })
      .in(
        "user_id",
        users?.map((u) => u.id) || []
      )
      .eq("status", "completed")

    // Agrupar estadísticas por usuario
    const statsMap = new Map()
    operationStats?.forEach((op) => {
      if (!statsMap.has(op.user_id)) {
        statsMap.set(op.user_id, {
          total_volume: 0,
          total_operations: 0,
        })
      }
      const stat = statsMap.get(op.user_id)
      stat.total_volume += op.source_amount || 0
      stat.total_operations += 1
    })

    // Enriquecer datos de usuarios
    const enrichedUsers = users?.map((user) => ({
      ...user,
      total_operations: statsMap.get(user.id)?.total_operations || 0,
      total_volume: statsMap.get(user.id)?.total_volume || 0,
    }))

    return NextResponse.json({
      users: enrichedUsers,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
  }
}
