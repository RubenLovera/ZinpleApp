"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface User {
  id: string
  full_name: string
  email: string
  phone: string
  country: string
  created_at: string
  total_operations: number
  total_volume: number
}

interface UsersResponse {
  users: User[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchUsers()
  }, [search, sortBy, page])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        sortBy,
        page: page.toString(),
      })
      const response = await fetch(`/api/admin/users?${params}`)
      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <p className="text-muted-foreground">
          Visualiza y gestiona todos los usuarios de ZinpleApp
        </p>
      </div>

      {/* Controles de búsqueda y filtro */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-2">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">
            Buscar usuario
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="text-sm font-medium mb-2 block">Ordenar por</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Fecha de registro ↓</SelectItem>
              <SelectItem value="total_volume">Volumen total ↓</SelectItem>
              <SelectItem value="name">Nombre A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          ) : (
            <>
              {/* Tabla desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-sm font-semibold text-muted-foreground">
                      <th className="text-left py-3 px-4">Nombre</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Teléfono</th>
                      <th className="text-left py-3 px-4">Fecha registro</th>
                      <th className="text-center py-3 px-4">Operaciones</th>
                      <th className="text-right py-3 px-4">Volumen total</th>
                      <th className="text-center py-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{user.full_name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="py-3 px-4 text-sm">{user.phone}</td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium">
                          {user.total_operations}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(user.total_volume)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabla mobile */}
              <div className="md:hidden space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Teléfono:</span>
                        <p>{user.phone}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Registro:</span>
                        <p>{formatDate(user.created_at)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Operaciones:</span>
                        <p className="font-medium">{user.total_operations}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Volumen:</span>
                        <p className="font-medium">
                          {formatCurrency(user.total_volume)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
                  .map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
