import { createServerClient } from "@/lib/supabase-server"

interface AuditLogParams {
  adminId: string
  adminEmail: string
  actionType: "create" | "update" | "delete" | "view" | "login" | "logout"
  targetTable: string
  targetId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  notes?: string
  ipAddress?: string
  userAgent?: string
}

export async function logAdminAction(params: AuditLogParams) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("admin_action_logs").insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      action_type: params.actionType,
      target_table: params.targetTable,
      target_id: params.targetId,
      old_values: params.oldValues,
      new_values: params.newValues,
      notes: params.notes,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error logging admin action:", error)
    }
  } catch (error) {
    console.error("[v0] Failed to log admin action:", error)
  }
}
