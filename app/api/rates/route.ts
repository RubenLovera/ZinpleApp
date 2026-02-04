import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Cliente de Supabase para el servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obtener solo tasas activas
    const { data: rates, error } = await supabase
      .from("exchange_rates")
      .select("*")
      .eq("is_active", true)
      .order("currency_pair", { ascending: true })

    if (error) {
      console.error("Error fetching rates:", error)
      return NextResponse.json({ error: "Error fetching rates" }, { status: 500 })
    }

    // Transformar a formato que usa la calculadora
    const formattedRates: Record<
      string,
      {
        rate: number
        fee: number
        minAmount: number
        maxAmount: number
        sourceCurrency: string
        destinationCurrency: string
      }
    > = {}

    for (const rate of rates || []) {
      // Convertir de CLP_VES a CLP-VES para mantener compatibilidad
      const pairKey = rate.currency_pair.replace("_", "-")
      formattedRates[pairKey] = {
        rate: Number(rate.rate),
        fee: Number(rate.fee_percentage),
        minAmount: Number(rate.min_amount),
        maxAmount: Number(rate.max_amount),
        sourceCurrency: rate.source_currency,
        destinationCurrency: rate.destination_currency,
      }
    }

    return NextResponse.json({
      rates: formattedRates,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in rates API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
