"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Copy,
  ChevronLeft,
  DollarSign,
  Activity,
  Users,
  Calendar,
  Eye,
  Wallet,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface UserDetail {
  id: string
  full_name: string
  email: string
  phone: string
  country: string
  created_at: string
  document_number: string
}

interface UserStats {
  total_volume: number
  total_operations: number
  total_beneficiaries: number
  last_operation: string | null
}

interface Operation {
  id: string
  operation_number: string
  created_at: string
  completed_at: string
  status: string
  currency_pair: string
  source_amount: number
  destination_amount: number
  mode: string
  beneficiary_full_name: string
}

interface Beneficiary {
  id: string
  full_name: string
  bank_name: string
  phone: string
  document_number: string
  wallet_address: string
  wallet_network: string
  email: string
  usage_count: number
  created_at: string
}

interface UserDetailResponse {
  user: UserDetail
  stats: UserStats
  operations: Operation[]
  beneficiaries: Beneficiary[]
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [operations, setOperations] = useState<Operation[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [operationFilter, setOperationFilter] = useState("all")
  const [operationPage, setOperationPage] = useState(1)

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      const data: UserDetailResponse = await response.json()
      setUser(data.user)
      setStats(data.stats)
      setOperations(data.operations)
      setBeneficiaries(data.beneficiaries)
    } catch (error) {
      console.error("Error fetching user details:", error)
    } finally {
      setLoading(false)
    }
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completada" },
      in_progress: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "En proceso",
      },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada" },
    }
    const variant = variants[status] || variants.in_progress
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        {variant.label}
      </Badge>
    )
  }

  const getModeBadge = (mode: string) => {
    const modeLabels: Record<string, string> = {
      send: "Enviar",
      receive: "Recibir",
      buy_usdt: "Comprar USDT",
      sell_usdt: "Vender USDT",
    }
    return modeLabels[mode] || mode
  }

  const getBeneficiaryTypeIcon = (beneficiary: Beneficiary) => {
    if (beneficiary.wallet_address) return "🪙"
    if (beneficiary.email) return "💵"
    return "💳"
  }

  const filteredOperations = operations.filter((op) => {
    if (operationFilter === "all") return true
    return op.status === operationFilter
  })

  const opsPerPage = 10
  const paginatedOps = filteredOperations.slice(
    (operationPage - 1) * opsPerPage,
    operationPage * opsPerPage
  )

  // Datos para gráfico de volumen mensual
  const monthlyVolumeData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthLabel = date.toLocaleDateString("es-ES", {
      month: "short",
      year: "2-digit",
    })

    const monthVolume = operations
      .filter((op) => {
        const opDate = new Date(op.created_at)
        return (
          opDate.getMonth() === date.getMonth() &&
          opDate.getFullYear() === date.getFullYear()
        )
      })
      .reduce((sum, op) => sum + (op.source_amount || 0), 0)

    return { month: monthLabel, volume: monthVolume }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Cargando perfil de usuario...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Usuario no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/users")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver a clientes
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{user.full_name}</h1>
          <p className="text-muted-foreground">
            Admin &gt; Clientes &gt; {user.full_name}
          </p>
        </div>
      </div>

      {/* Sección 1: Datos Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Datos Personales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "Nombre completo", value: user.full_name },
              { label: "Email", value: user.email },
              { label: "Teléfono", value: user.phone },
              { label: "País", value: user.country },
              {
                label: "Fecha de registro",
                value: formatDate(user.created_at),
              },
              {
                label: "ID de usuario",
                value: user.id,
                copy: true,
              },
            ].map((field, idx) => (
              <div key={idx}>
                <p className="text-sm text-muted-foreground font-medium">
                  {field.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-semibold">{field.value}</p>
                  {field.copy && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(field.value)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div>
              <p className="text-sm text-muted-foreground font-medium">Estado</p>
              <Badge className="mt-1 bg-green-100 text-green-800">Activo</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Resumen de Actividad */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Volumen Total",
              value: formatCurrency(stats?.total_volume || 0),
              icon: DollarSign,
              color: "text-blue-600",
            },
            {
              label: "Operaciones",
              value: stats?.total_operations || 0,
              icon: Activity,
              color: "text-green-600",
            },
            {
              label: "Destinatarios",
              value: stats?.total_beneficiaries || 0,
              icon: Users,
              color: "text-purple-600",
            },
            {
              label: "Última operación",
              value: stats?.last_operation
                ? formatDate(stats.last_operation)
                : "N/A",
              icon: Calendar,
              color: "text-orange-600",
            },
          ].map((kpi, idx) => {
            const Icon = kpi.icon
            return (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                    </div>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Gráfico de volumen mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Volumen mensual (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sección 3: Historial de Operaciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Historial de Operaciones
            </CardTitle>
            <Select value={operationFilter} onValueChange={setOperationFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="in_progress">En proceso</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOperations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Este usuario no tiene operaciones aún
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="font-semibold text-muted-foreground">
                      <th className="text-left py-3 px-4">ID Operación</th>
                      <th className="text-left py-3 px-4">Fecha</th>
                      <th className="text-left py-3 px-4">Tipo</th>
                      <th className="text-left py-3 px-4">Par</th>
                      <th className="text-right py-3 px-4">Monto</th>
                      <th className="text-center py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedOps.map((op) => (
                      <tr key={op.id} className="hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          {op.operation_number}
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(op.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          {getModeBadge(op.mode)}
                        </td>
                        <td className="py-3 px-4">{op.currency_pair}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(op.source_amount)} →{" "}
                          {formatCurrency(op.destination_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(op.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {paginatedOps.map((op) => (
                  <div
                    key={op.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{op.operation_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(op.created_at)}
                        </p>
                      </div>
                      {getStatusBadge(op.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo:</span>
                        <p>{getModeBadge(op.mode)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Par:</span>
                        <p>{op.currency_pair}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Monto:</span>
                        <p className="font-medium">
                          {formatCurrency(op.source_amount)} →{" "}
                          {formatCurrency(op.destination_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {filteredOperations.length > opsPerPage && (
                <div className="flex justify-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setOperationPage(Math.max(1, operationPage - 1))
                    }
                    disabled={operationPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center text-sm">
                    Página {operationPage} de{" "}
                    {Math.ceil(filteredOperations.length / opsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setOperationPage(
                        Math.min(
                          Math.ceil(filteredOperations.length / opsPerPage),
                          operationPage + 1
                        )
                      )
                    }
                    disabled={
                      operationPage ===
                      Math.ceil(filteredOperations.length / opsPerPage)
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sección 4: Destinatarios Registrados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Destinatarios Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {beneficiaries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay destinatarios registrados
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beneficiaries.map((ben) => (
                <div
                  key={ben.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold">
                        {getBeneficiaryTypeIcon(ben)} {ben.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ben.bank_name || ben.wallet_network || "Otros"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {ben.usage_count} usos
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {ben.phone && (
                      <div>
                        <span className="text-muted-foreground">
                          Teléfono:
                        </span>
                        <p className="font-medium">{ben.phone}</p>
                      </div>
                    )}
                    {ben.document_number && (
                      <div>
                        <span className="text-muted-foreground">
                          {ben.document_type || "Cédula"}:
                        </span>
                        <p className="font-medium">{ben.document_number}</p>
                      </div>
                    )}
                    {ben.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{ben.email}</p>
                      </div>
                    )}
                    {ben.wallet_address && (
                      <div>
                        <span className="text-muted-foreground">Wallet:</span>
                        <p className="font-mono text-xs break-all">
                          {ben.wallet_address}
                        </p>
                      </div>
                    )}
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      Creado: {formatDate(ben.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
