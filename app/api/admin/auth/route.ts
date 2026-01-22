import { type NextRequest, NextResponse } from "next/server"

// Credenciales de administrador (en producción deberían estar en variables de entorno)
const ADMIN_EMAIL = "admin@zinpleapp.com"
const ADMIN_PASSWORD = "ZinpleAdmin2024!"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
