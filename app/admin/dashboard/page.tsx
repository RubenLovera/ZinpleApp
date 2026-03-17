"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  LogOut,
  Settings,
  List,
  BarChart3,
  Wallet,
  Send,
  Download,
  AlertCircle,
  Eye,
  Play,
  RotateCcw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  X,
  GripVertical,
} from "lucide-react"
import UsersList from "@/components/admin/UsersList"
import UserProfile from "@/components/admin/UserProfile"
import AdminHeader from "@/components/admin/AdminHeader"

interface Stats {
  byStatus: {
    pending: number
    in_progress: number
    completedToday: number
    cancelledToday: number
  }
  volume: {
    today: number
    week: number
    month: number
  }
  byMode: {
    send: number
    receive: number
    buy_usdt: number
    sell_usdt: number
  }
  topCurrencyPairs: Array<{ pair: string; count: number }>
  totalUsers: number
  recentOperations: Operation[]
  rates: {
    active: Rate[]
    total: number
  }
}

interface Operation {
  id: string
  operation_number: string
  status: string
  mode: string
  currency_pair: string
  source_amount: number
  source_currency: string
  destination_amount: number
  destination_currency: string
  exchange_rate: number
  fee_percentage: number
  user_email: string
  user_full_name: string
  beneficiary_full_name?: string
  beneficiary_phone?: string
  beneficiary_bank_name?: string
  created_at: string
  completed_at?: string
  cancelled_at?: string
}

interface Rate {
  id: string
  currency_pair: string
  source_currency: string
  destination_currency: string
  rate: number
  fee_percentage: number
  min_amount: number
  max_amount: number
  is_active: boolean
  provider?: string
  updated_at: string
  updated_by?: string
}

interface OperationLog {
  id: string
  previous_status: string
  new_status: string
  changed_by: string
  notes: string
  created_at: string
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En Proceso",
  completed: "Completada",
  cancelled: "Cancelada",
}

const modeLabels: Record<string, string> = {
  send: "Enviar",
  receive: "Recibir",
  buy_usdt: "Comprar USDT",
  sell_usdt: "Vender USDT",
}

const modeIcons: Record<string, React.ReactNode> = {
  send: <Send className="h-4 w-4" />,
  receive: <Download className="h-4 w-4" />,
  buy_usdt: <Wallet className="h-4 w-4" />,
  sell_usdt: <DollarSign className="h-4 w-4" />,
}

// Componente para fila sorteable de tasa
function RateRow({
  rate,
  editingRate,
  editRateValues,
  actionLoading,
  onEdit,
  onSave,
  onCancel,
  onToggle,
  onEditChange,
}: {
  rate: any
  editingRate: string | null
  editRateValues: { rate: string; fee: string }
  actionLoading: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onToggle: () => void
  onEditChange: (values: { rate: string; fee: string }) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rate.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-lg border ${
        !rate.is_active ? "opacity-50 bg-muted/30" : ""
      } ${isDragging ? "shadow-lg bg-accent/10" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold">{rate.currency_pair.replace("_", " / ")}</p>
          <p className="text-xs text-muted-foreground">
            {rate.provider || "Manual"} - Actualizado: {formatDate(rate.updated_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {editingRate === rate.id ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.0001"
              className="w-28"
              value={editRateValues.rate}
              onChange={(e) => onEditChange({ ...editRateValues, rate: e.target.value })}
              placeholder="Tasa"
            />
            <Input
              type="number"
              step="0.01"
              className="w-20"
              value={editRateValues.fee}
              onChange={(e) => onEditChange({ ...editRateValues, fee: e.target.value })}
              placeholder="Fee %"
            />
            <Button size="sm" onClick={onSave} disabled={actionLoading}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="text-right">
              <p className="font-semibold">{rate.rate}</p>
              <p className="text-xs text-muted-foreground">
                Fee: {(rate.fee_percentage * 100).toFixed(2)}%
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={rate.is_active ? "ghost" : "default"}
                onClick={onToggle}
              >
                {rate.is_active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [adminEmail, setAdminEmail] = useState("")

  // Date range state
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
    startDate: (() => {
      const d = new Date()
      d.setDate(d.getDate() - 7)
      return d
    })(),
    endDate: new Date(),
  })
  const [dateRangeMode, setDateRangeMode] = useState<"today" | "7days" | "30days" | "custom">("7days")

  // Operations state
  const [operations, setOperations] = useState<Operation[]>([])
  const [operationsLoading, setOperationsLoading] = useState(false)
  const [operationsTotal, setOperationsTotal] = useState(0)
  const [operationsPage, setOperationsPage] = useState(0)
  const [operationsFilter, setOperationsFilter] = useState({
    status: "all",
    mode: "all",
    search: "",
  })
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  // Rates state
  const [rates, setRates] = useState<Rate[]>([])
  const [ratesLoading, setRatesLoading] = useState(false)
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [editRateValues, setEditRateValues] = useState<{rate: string, fee: string}>({rate: "", fee: ""})
  const [ratesSortOrder, setRatesSortOrder] = useState<string[]>([])

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Users state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("zinple_admin_auth")
    const email = localStorage.getItem("adminEmail")
    if (isAuthenticated !== "true") {
      router.push("/admin")
      return
    }
    setAdminEmail(email || "admin@zinpleapp.com")
    fetchStats()
  }, [router])

  useEffect(() => {
    if (activeTab === "operations") {
      fetchOperations()
    } else if (activeTab === "rates") {
      fetchRates()
    }
  }, [activeTab, operationsPage, operationsFilter])

  useEffect(() => {
    if (activeTab === "overview") {
      fetchStats()
    }
  }, [dateRange])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const startDate = formatDateForAPI(dateRange.startDate)
      const endDate = formatDateForAPI(dateRange.endDate)
      const response = await fetch(`/api/admin/stats?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()
      if (data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOperations = async () => {
    setOperationsLoading(true)
    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: String(operationsPage * 20),
      })
      if (operationsFilter.status !== "all") params.set("status", operationsFilter.status)
      if (operationsFilter.mode !== "all") params.set("mode", operationsFilter.mode)
      if (operationsFilter.search) params.set("search", operationsFilter.search)

      const response = await fetch(`/api/admin/operations?${params}`)
      const data = await response.json()
      setOperations(data.operations || [])
      setOperationsTotal(data.total || 0)
    } catch (error) {
      console.error("Error fetching operations:", error)
    } finally {
      setOperationsLoading(false)
    }
  }

  const fetchRates = async () => {
    setRatesLoading(true)
    try {
      const response = await fetch("/api/admin/rates")
      const data = await response.json()
      setRates(data.rates || [])
    } catch (error) {
      console.error("Error fetching rates:", error)
    } finally {
      setRatesLoading(false)
    }
  }

  const fetchOperationDetail = async (operationId: string) => {
    try {
      const response = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationId }),
      })
      const data = await response.json()
      if (data.operation) {
        setSelectedOperation(data.operation)
        setOperationLogs(data.logs || [])
      }
    } catch (error) {
      console.error("Error fetching operation detail:", error)
    }
  }

  const handleOperationAction = async (action: string, notes?: string) => {
    if (!selectedOperation) return
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/operations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationId: selectedOperation.id,
          action,
          adminEmail,
          notes,
        }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchOperationDetail(selectedOperation.id)
        await fetchOperations()
        await fetchStats()
      } else {
        alert(data.error || "Error al ejecutar acción")
      }
    } catch (error) {
      console.error("Error executing action:", error)
      alert("Error al ejecutar acción")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateRate = async (rateId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch("/api/admin/rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateId,
          rate: parseFloat(editRateValues.rate),
          feePercentage: parseFloat(editRateValues.fee),
          adminEmail,
          reason: "Actualización manual desde dashboard",
        }),
      })
      const data = await response.json()
      if (data.success) {
        setEditingRate(null)
        await fetchRates()
        await fetchStats()
      } else {
        alert(data.error || "Error al actualizar tasa")
      }
    } catch (error) {
      console.error("Error updating rate:", error)
      alert("Error al actualizar tasa")
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleRateActive = async (rate: Rate) => {
    try {
      const response = await fetch("/api/admin/rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateId: rate.id,
          isActive: !rate.is_active,
          adminEmail,
        }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchRates()
      }
    } catch (error) {
      console.error("Error toggling rate:", error)
    }
  }

  const handleDateRangeChange = (mode: "today" | "7days" | "30days" | "custom", customStart?: Date, customEnd?: Date) => {
    setDateRangeMode(mode)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    let start = new Date()
    start.setHours(0, 0, 0, 0)

    switch (mode) {
      case "today":
        start = new Date()
        start.setHours(0, 0, 0, 0)
        break
      case "7days":
        start.setDate(start.getDate() - 7)
        break
      case "30days":
        start.setDate(start.getDate() - 30)
        break
      case "custom":
        if (customStart && customEnd) {
          start = customStart
          end.setTime(customEnd.getTime())
        }
        break
    }
    setDateRange({ startDate: start, endDate: end })
  }

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split("T")[0]
  }

  const handleDragEndRates = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = rates.findIndex((r) => r.id === active.id)
      const newIndex = rates.findIndex((r) => r.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newRates = arrayMove(rates, oldIndex, newIndex)
        setRates(newRates)

        // Guardar el nuevo orden en BD
        const updates = newRates.map((rate, index) => ({
          id: rate.id,
          display_order: index + 1,
        }))

        const response = await fetch("/api/admin/rates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates, adminEmail }),
        })

        const data = await response.json()
        if (!data.success) {
          console.error("Error updating rates order:", data.error)
          fetchRates() // Revert en caso de error
        }
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("zinple_admin_auth")
    localStorage.removeItem("adminEmail")
    router.push("/admin")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const pendingTotal = (stats?.byStatus?.in_progress || 0)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <AdminHeader />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Operaciones</span>
              {pendingTotal > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {pendingTotal}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Tasas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Date Range Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateRangeMode === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeChange("today")}
              >
                Hoy
              </Button>
              <Button
                variant={dateRangeMode === "7days" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeChange("7days")}
              >
                7 días
              </Button>
              <Button
                variant={dateRangeMode === "30days" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDateRangeChange("30days")}
              >
                30 días
              </Button>
            </div>

            {/* KPIs with Change Indicators */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* GTV KPI */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volumen Bruto</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats?.volume?.today ? stats.volume.today.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "0"}
                  </div>
                  <p className={`text-xs font-semibold ${(stats?.volume?.today || 0) >= (stats?.volume?.yesterday || 0) ? "text-emerald-600" : "text-red-600"}`}>
                    {(stats?.volume?.today || 0) >= (stats?.volume?.yesterday || 0) ? "↑" : "↓"} {Math.abs(((stats?.volume?.today || 0) - (stats?.volume?.yesterday || 0)) / (stats?.volume?.yesterday || 1) * 100).toFixed(2)}% vs ayer
                  </p>
                </CardContent>
              </Card>

              {/* TTV KPI */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.rates?.total || 0}</div>
                  <p className={`text-xs font-semibold ${(stats?.rates?.total || 0) >= (stats?.rates?.previousTotal || 0) ? "text-emerald-600" : "text-red-600"}`}>
                    {(stats?.rates?.total || 0) >= (stats?.rates?.previousTotal || 0) ? "↑" : "↓"} {Math.abs(((stats?.rates?.total || 0) - (stats?.rates?.previousTotal || 0)) / (stats?.rates?.previousTotal || 1) * 100).toFixed(2)}% vs anterior
                  </p>
                </CardContent>
              </Card>

              {/* Revenue KPI */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats?.kpis?.revenue?.current ? stats.kpis.revenue.current.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "0"}
                  </div>
                  <p className={`text-xs font-semibold ${(stats?.kpis?.revenue?.change || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {(stats?.kpis?.revenue?.change || 0) >= 0 ? "↑" : "↓"} {Math.abs(stats?.kpis?.revenue?.change || 0)}% vs anterior
                  </p>
                </CardContent>
              </Card>

              {/* Beneficiaries KPI */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Destinatarios</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Únicos en período</p>
                </CardContent>
              </Card>
            </div>

            {/* Status Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                  <RefreshCw className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus?.in_progress || 0}</div>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus?.completedToday || 0}</div>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus?.cancelledToday || 0}</div>
                  <p className="text-xs text-muted-foreground">Hoy</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Currency Pairs Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Pares Más Utilizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(stats?.topCurrencyPairs || []).map((pair) => (
                    <div key={pair.pair} className="flex items-center justify-between">
                      <span className="text-sm">{pair.pair.replace("_", " / ")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${((pair.count / (stats?.topCurrencyPairs?.[0]?.count || 1)) * 100) || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold w-8 text-right">{pair.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Operations */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Usuarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-sm text-muted-foreground">Usuarios registrados</p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Operaciones Recientes</CardTitle>
                  <CardDescription>Últimas operaciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats?.recentOperations?.length === 0 && (
                      <p className="text-sm text-muted-foreground">Sin operaciones aún</p>
                    )}
                    {stats?.recentOperations?.slice(0, 5).map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab("operations")
                          fetchOperationDetail(op.id)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={statusColors[op.status]}>{statusLabels[op.status]}</Badge>
                          <div>
                            <p className="text-sm font-medium">{op.operation_number}</p>
                            <p className="text-xs text-muted-foreground">{op.user_email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatCurrency(op.source_amount)} {op.source_currency}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(op.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <List className="h-5 w-5" />
                      Gestión de Operaciones
                    </CardTitle>
                    <CardDescription>
                      {operationsTotal} operaciones encontradas
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        className="pl-8 w-48"
                        value={operationsFilter.search}
                        onChange={(e) => {
                          setOperationsFilter({ ...operationsFilter, search: e.target.value })
                          setOperationsPage(0)
                        }}
                      />
                    </div>
                    <Select
                      value={operationsFilter.status}
                      onValueChange={(v) => {
                        setOperationsFilter({ ...operationsFilter, status: v })
                        setOperationsPage(0)
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En Proceso</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={operationsFilter.mode}
                      onValueChange={(v) => {
                        setOperationsFilter({ ...operationsFilter, mode: v })
                        setOperationsPage(0)
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="send">Enviar</SelectItem>
                        <SelectItem value="receive">Recibir</SelectItem>
                        <SelectItem value="buy_usdt">Comprar USDT</SelectItem>
                        <SelectItem value="sell_usdt">Vender USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {operationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Cargando...
                  </div>
                ) : operations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No se encontraron operaciones
                  </div>
                ) : (
                  <div className="space-y-2">
                    {operations.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[op.status]}>{statusLabels[op.status]}</Badge>
                              <Badge variant="outline">{modeLabels[op.mode]}</Badge>
                            </div>
                            <p className="text-sm font-medium">{op.operation_number}</p>
                            <p className="text-xs text-muted-foreground">{op.user_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(op.source_amount)} {op.source_currency}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              → {formatCurrency(op.destination_amount)} {op.destination_currency}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(op.created_at)}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchOperationDetail(op.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {operationsTotal > 20 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {operationsPage * 20 + 1} - {Math.min((operationsPage + 1) * 20, operationsTotal)} de {operationsTotal}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={operationsPage === 0}
                        onClick={() => setOperationsPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={(operationsPage + 1) * 20 >= operationsTotal}
                        onClick={() => setOperationsPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operation Detail Modal */}
            {selectedOperation && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedOperation.operation_number}</CardTitle>
                        <CardDescription>Detalle de operación</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOperation(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[selectedOperation.status]}>
                        {statusLabels[selectedOperation.status]}
                      </Badge>
                      <Badge variant="outline">{modeLabels[selectedOperation.mode]}</Badge>
                      <Badge variant="outline">{selectedOperation.currency_pair?.replace("_", " / ")}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Monto Origen</Label>
                        <p className="font-semibold">
                          {formatCurrency(selectedOperation.source_amount)} {selectedOperation.source_currency}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Monto Destino</Label>
                        <p className="font-semibold">
                          {formatCurrency(selectedOperation.destination_amount)} {selectedOperation.destination_currency}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Tasa</Label>
                        <p className="font-semibold">{selectedOperation.exchange_rate}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Comisión</Label>
                        <p className="font-semibold">{(selectedOperation.fee_percentage * 100).toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <Label className="text-muted-foreground">Usuario</Label>
                      <p className="font-semibold">{selectedOperation.user_full_name || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{selectedOperation.user_email}</p>
                    </div>

                    {selectedOperation.beneficiary_full_name && (
                      <div className="border-t pt-4">
                        <Label className="text-muted-foreground">Beneficiario</Label>
                        <p className="font-semibold">{selectedOperation.beneficiary_full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOperation.beneficiary_phone} - {selectedOperation.beneficiary_bank_name}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t pt-4 flex flex-wrap gap-2">
                      {selectedOperation.status !== "completed" && selectedOperation.status !== "cancelled" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              if (window.confirm("¿Estás seguro de que deseas finalizar esta orden?")) {
                                handleOperationAction("complete")
                              }
                            }}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Finalizar orden
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm("¿Estás seguro de que deseas cancelar esta orden?")) {
                                handleOperationAction("cancel")
                              }
                            }}
                            disabled={actionLoading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancelar orden
                          </Button>
                        </>
                      )}
                      {selectedOperation.status === "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOperationAction("revive")}
                          disabled={actionLoading}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Revivir
                        </Button>
                      )}
                    </div>

                    {/* Logs */}
                    {operationLogs.length > 0 && (
                      <div className="border-t pt-4">
                        <Label className="text-muted-foreground mb-2 block">Historial</Label>
                        <div className="space-y-2">
                          {operationLogs.map((log) => (
                            <div key={log.id} className="text-sm p-2 rounded bg-muted/50">
                              <p>
                                <span className="font-medium">{log.previous_status || "nuevo"}</span>
                                {" → "}
                                <span className="font-medium">{log.new_status}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {log.changed_by} - {formatDate(log.created_at)}
                              </p>
                              {log.notes && <p className="text-xs mt-1">{log.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {!selectedUserId ? (
              <UsersList onSelectUser={setSelectedUserId} />
            ) : (
              <UserProfile userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
            )}
          </TabsContent>

          {/* Rates Tab */}
          <TabsContent value="rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Gestión de Tasas de Cambio
                </CardTitle>
                <CardDescription>
                  Administra las tasas de cambio para todos los pares
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ratesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Cargando...
                  </div>
                ) : rates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay tasas configuradas
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndRates}
                  >
                    <SortableContext
                      items={rates.map((r) => r.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {rates.map((rate) => (
                          <RateRow
                            key={rate.id}
                            rate={rate}
                            editingRate={editingRate}
                            editRateValues={editRateValues}
                            actionLoading={actionLoading}
                            onEdit={() => {
                              setEditingRate(rate.id)
                              setEditRateValues({
                                rate: String(rate.rate),
                                fee: String(rate.fee_percentage),
                              })
                            }}
                            onSave={() => handleUpdateRate(rate.id)}
                            onCancel={() => setEditingRate(null)}
                            onToggle={() => handleToggleRateActive(rate)}
                            onEditChange={setEditRateValues}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Administrador actual</p>
                    <p className="text-sm text-muted-foreground">{adminEmail}</p>
                  </div>
                  <Badge variant="outline">Activo</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Tasas activas</p>
                    <p className="text-sm text-muted-foreground">
                      {rates.filter((r) => r.is_active).length} de {rates.length} pares
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("rates")}>
                    Gestionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
