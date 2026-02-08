import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 })
    }

    // Buscar admin en la BD
    const { data: admin, error: queryError } = await supabaseServer
      .from("admin_users")
      .select("id, email, password_hash, full_name, is_active")
      .eq("email", email)
      .maybeSingle()

    if (queryError || !admin) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Verificar que el admin está activo
    if (!admin.is_active) {
      return NextResponse.json({ error: "Usuario desactivado" }, { status: 401 })
    }

    // Comparar contraseña con el hash (usando bcrypt)
    const bcrypt = require("bcryptjs")
    const passwordMatch = await bcrypt.compare(password, admin.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }

    // Actualizar last_login_at
    await supabaseServer
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", admin.id)

    // Registrar en audit logs
    await supabaseServer.from("admin_action_logs").insert({
      admin_id: admin.id,
      admin_email: admin.email,
      action_type: "login",
      target_table: "admin_users",
      target_id: admin.id,
      new_values: { login_timestamp: new Date().toISOString() },
      notes: "Admin logged in successfully",
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
      },
    })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
