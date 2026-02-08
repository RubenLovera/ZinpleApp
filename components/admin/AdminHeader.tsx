"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface AdminUser {
  id: string
  email: string
  full_name: string
}

export default function AdminHeader() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userStr = localStorage.getItem("zinple_admin_user")
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr))
      } catch (error) {
        console.error("[v0] Error parsing admin user:", error)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("zinple_admin_auth")
    localStorage.removeItem("zinple_admin_user")
    router.push("/admin")
  }

  if (!adminUser) {
    return null
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div></div>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">{adminUser.full_name}</p>
            <p className="text-xs text-gray-500">{adminUser.email}</p>
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{adminUser.full_name}</p>
              <p className="text-xs text-gray-500">{adminUser.email}</p>
            </div>
            <button
              onClick={() => {
                handleLogout()
                setIsDropdownOpen(false)
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
