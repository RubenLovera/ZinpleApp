import { createClient } from "@supabase/supabase-js"

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

console.log("Creating Supabase server client with URL:", supabaseUrl.substring(0, 30) + "...")

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)
