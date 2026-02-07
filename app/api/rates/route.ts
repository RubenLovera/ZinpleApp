import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: rates, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("is_active", true)
      .order("currency_pair", { ascending: true })

    if (error) {
      console.error("Error fetching rates:", error)
      return NextResponse.json(
        { error: "Error al obtener tasas" },
        { status: 500 }
      )
    }

    // Transformar al formato que necesita la calculadora
    const formattedRates: Record<string, { rate: number; fee: number; min: number; max: number }> = {}

    for (const rate of rates || []) {
      formattedRates[rate.currency_pair] = {
        rate: Number.parseFloat(rate.rate),
        fee: Number.parseFloat(rate.fee_percentage),
        min: Number.parseFloat(rate.min_amount || "0"),
        max: Number.parseFloat(rate.max_amount || "999999"),
      }
    }

    return NextResponse.json(
      { rates: formattedRates, updatedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    )
  } catch (error) {
    console.error("Error in rates API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
