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

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Error in check user route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
