import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Obtener datos del usuario
    const { data: user } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Obtener operaciones del usuario
    const { data: operations } = await supabaseServer
      .from("operations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Obtener destinatarios del usuario
    const { data: beneficiaries } = await supabaseServer
      .from("beneficiaries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Calcular estadísticas
    const completedOps = operations?.filter((op) => op.status === "completed") || []
    const totalVolume = completedOps.reduce((sum, op) => sum + (op.source_amount || 0), 0)
    const totalOperations = completedOps.length
    const lastOperation = operations?.[0]?.completed_at || null

    // Contar uso de beneficiarios
    const beneficiaryUsage = new Map()
    operations?.forEach((op) => {
      if (op.beneficiary_id) {
        beneficiaryUsage.set(
          op.beneficiary_id,
          (beneficiaryUsage.get(op.beneficiary_id) || 0) + 1
        )
      }
    })

    const enrichedBeneficiaries = beneficiaries?.map((b) => ({
      ...b,
      usage_count: beneficiaryUsage.get(b.id) || 0,
    }))

    return NextResponse.json({
      user,
      stats: {
        total_volume: totalVolume,
        total_operations: totalOperations,
        total_beneficiaries: beneficiaries?.length || 0,
        last_operation: lastOperation,
      },
      operations,
      beneficiaries: enrichedBeneficiaries,
    })
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json(
      { error: "Error fetching user details" },
      { status: 500 }
    )
  }
}
