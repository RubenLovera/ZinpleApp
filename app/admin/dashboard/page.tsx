"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
  Eye,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  X,
  Plus,
  GripVertical,
  Trash2,
  Power,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react"

interface Stats {
  byStatus: {
    pending: number
    awaiting_payment: number
    processing: number
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
  user_phone?: string
  user_document_type?: string
  user_document_number?: string
  beneficiary_full_name?: string
  beneficiary_phone?: string
  beneficiary_bank_name?: string
  beneficiary_bank_code?: string
  beneficiary_account_number?: string
  beneficiary_document_type?: string
  beneficiary_document_number?: string
  sender_full_name?: string
  sender_email?: string
  destination_bank_name?: string
  destination_account_number?: string
  wallet_address?: string
  wallet_network?: string
  payment_reference?: string
  admin_notes?: string
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
  display_order?: number
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
  awaiting_payment: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  awaiting_payment: "Esperando Pago",
  processing: "Procesando",
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

const currencyFlags: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  VES: "🇻🇪",
  COP: "🇨🇴",
  MXN: "🇲🇽",
  ARS: "🇦🇷",
  BRL: "🇧🇷",
  CLP: "🇨🇱",
  PEN: "🇵🇪",
  USDT: "₮",
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [adminEmail, setAdminEmail] = useState("")

  // Operations state
  const [operations, setOperations] = useState<Operation[]>([])
  const [operationsLoading, setOperationsLoading] = useState(false)
  const [operationsTotal, setOperationsTotal] = useState(0)
  const [operationsPage, setOperationsPage] = useState(0)
  const [operationsFilter, setOperationsFilter] = useState({
    status: "all",
    mode: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
  })
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [actionNotes, setActionNotes] = useState("")

  // Rates state
  const [rates, setRates] = useState<Rate[]>([])
  const [ratesLoading, setRatesLoading] = useState(false)
  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [editRateValues, setEditRateValues] = useState<{rate: string, fee: string, min: string, max: string}>({rate: "", fee: "", min: "", max: ""})
  const [showNewRateForm, setShowNewRateForm] = useState(false)
  const [newRate, setNewRate] = useState({
    sourceCurrency: "",
    destinationCurrency: "",
    rate: "",
    feePercentage: "5",
    minAmount: "1",
    maxAmount: "10000",
  })

  // Settings state
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)

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

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/stats")
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
      if (operationsFilter.dateFrom) params.set("date_from", operationsFilter.dateFrom)
      if (operationsFilter.dateTo) params.set("date_to", operationsFilter.dateTo)

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
      // Sort by display_order
      const sortedRates = (data.rates || []).sort((a: Rate, b: Rate) => 
        (a.display_order || 0) - (b.display_order || 0)
      )
      setRates(sortedRates)
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

  const handleOperationAction = async (action: string) => {
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
          notes: actionNotes,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setActionNotes("")
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
          minAmount: parseFloat(editRateValues.min),
          maxAmount: parseFloat(editRateValues.max),
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

  const handleCreateRate = async () => {
    if (!newRate.sourceCurrency || !newRate.destinationCurrency || !newRate.rate) {
      alert("Completa todos los campos requeridos")
      return
    }
    setActionLoading(true)
    try {
      const currencyPair = `${newRate.sourceCurrency}-${newRate.destinationCurrency}`
      const response = await fetch("/api/admin/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyPair,
          sourceCurrency: newRate.sourceCurrency,
          destinationCurrency: newRate.destinationCurrency,
          rate: parseFloat(newRate.rate),
          feePercentage: parseFloat(newRate.feePercentage) / 100,
          minAmount: parseFloat(newRate.minAmount),
          maxAmount: parseFloat(newRate.maxAmount),
          adminEmail,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setShowNewRateForm(false)
        setNewRate({
          sourceCurrency: "",
          destinationCurrency: "",
          rate: "",
          feePercentage: "5",
          minAmount: "1",
          maxAmount: "10000",
        })
        await fetchRates()
      } else {
        alert(data.error || "Error al crear tasa")
      }
    } catch (error) {
      console.error("Error creating rate:", error)
      alert("Error al crear tasa")
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

  const handleDeleteRate = async (rateId: string) => {
    if (!confirm("¿Estás seguro de eliminar este par? Se desactivará permanentemente.")) return
    try {
      const response = await fetch(`/api/admin/rates?id=${rateId}&admin_email=${adminEmail}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (data.success) {
        await fetchRates()
      }
    } catch (error) {
      console.error("Error deleting rate:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("zinple_admin_auth")
    localStorage.removeItem("adminEmail")
    router.push("/admin")
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatCurrency = (amount: number, decimals = 2) => {
    return new Intl.NumberFormat("es-CL", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate preview for rate
  const calculatePreview = (rate: Rate) => {
    const testAmount = 100
    const received = testAmount * rate.rate * (1 - rate.fee_percentage)
    return {
      send: testAmount,
      receive: received,
    }
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span>Cargando dashboard...</span>
        </div>
      </div>
    )
  }

  const pendingTotal =
    (stats?.byStatus.pending || 0) +
    (stats?.byStatus.awaiting_payment || 0) +
    (stats?.byStatus.processing || 0)

  // Separate rates by type
  const mainRates = rates.filter(r => r.currency_pair === "USD-VES" || r.currency_pair === "VES-USDT")
  const otherRates = rates.filter(r => r.currency_pair !== "USD-VES" && r.currency_pair !== "VES-USDT")

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary">Zinple Admin</h1>
            <Badge variant="outline" className="hidden sm:flex">
              {adminEmail}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus.pending || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    + {stats?.byStatus.awaiting_payment || 0} esperando pago
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                  <RefreshCw className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus.processing || 0}</div>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus.completedToday || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    Exitosas
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Canceladas Hoy</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus.cancelledToday || 0}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    Fallidas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Volumen Procesado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Hoy</span>
                    <span className="font-semibold">${formatCurrency(stats?.volume.today || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Últimos 7 días</span>
                    <span className="font-semibold">${formatCurrency(stats?.volume.week || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Últimos 30 días</span>
                    <span className="font-semibold">${formatCurrency(stats?.volume.month || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Por Tipo de Operación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(stats?.byMode || {}).map(([mode, count]) => (
                    <div key={mode} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        {modeIcons[mode]}
                        {modeLabels[mode] || mode}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

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
            </div>

            {/* Recent Operations */}
            <Card>
              <CardHeader>
                <CardTitle>Operaciones Recientes</CardTitle>
                <CardDescription>Últimas 5 operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentOperations?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Sin operaciones recientes</p>
                  )}
                  {stats?.recentOperations?.slice(0, 5).map((op) => (
                    <div key={op.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {modeIcons[op.mode]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{op.operation_number}</p>
                          <p className="text-xs text-muted-foreground">{op.user_email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(op.source_amount)} {op.source_currency}
                        </p>
                        <Badge className={statusColors[op.status]} variant="secondary">
                          {statusLabels[op.status] || op.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid gap-4 md:grid-cols-6">
                  <div className="md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ID, email, nombre..."
                        className="pl-9"
                        value={operationsFilter.search}
                        onChange={(e) => {
                          setOperationsFilter(prev => ({ ...prev, search: e.target.value }))
                          setOperationsPage(0)
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Select
                      value={operationsFilter.status}
                      onValueChange={(value) => {
                        setOperationsFilter(prev => ({ ...prev, status: value }))
                        setOperationsPage(0)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="awaiting_payment">Esperando Pago</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Select
                      value={operationsFilter.mode}
                      onValueChange={(value) => {
                        setOperationsFilter(prev => ({ ...prev, mode: value }))
                        setOperationsPage(0)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                  <div>
                    <Label className="text-xs text-muted-foreground">Desde</Label>
                    <Input
                      type="date"
                      value={operationsFilter.dateFrom}
                      onChange={(e) => {
                        setOperationsFilter(prev => ({ ...prev, dateFrom: e.target.value }))
                        setOperationsPage(0)
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Hasta</Label>
                    <Input
                      type="date"
                      value={operationsFilter.dateTo}
                      onChange={(e) => {
                        setOperationsFilter(prev => ({ ...prev, dateTo: e.target.value }))
                        setOperationsPage(0)
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operations Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">ID</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Usuario</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Par</th>
                        <th className="text-right p-3 text-xs font-medium text-muted-foreground">Envía</th>
                        <th className="text-right p-3 text-xs font-medium text-muted-foreground">Recibe</th>
                        <th className="text-center p-3 text-xs font-medium text-muted-foreground">Estado</th>
                        <th className="text-center p-3 text-xs font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {operationsLoading ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center">
                            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary" />
                          </td>
                        </tr>
                      ) : operations.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted-foreground">
                            No se encontraron operaciones
                          </td>
                        </tr>
                      ) : (
                        operations.map((op) => (
                          <tr key={op.id} className="hover:bg-muted/30">
                            <td className="p-3">
                              <span className="font-mono text-xs">{op.operation_number}</span>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {formatDateShort(op.created_at)}
                            </td>
                            <td className="p-3">
                              <div>
                                <p className="text-sm font-medium truncate max-w-[150px]">{op.user_full_name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{op.user_email}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-xs">
                                <span>{currencyFlags[op.source_currency] || ""}</span>
                                <span>{op.source_currency}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>{currencyFlags[op.destination_currency] || ""}</span>
                                <span>{op.destination_currency}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono text-sm">
                              {formatCurrency(op.source_amount)} {op.source_currency}
                            </td>
                            <td className="p-3 text-right font-mono text-sm">
                              {formatCurrency(op.destination_amount)} {op.destination_currency}
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={statusColors[op.status]} variant="secondary">
                                {statusLabels[op.status] || op.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchOperationDetail(op.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {operationsPage * 20 + 1}-{Math.min((operationsPage + 1) * 20, operationsTotal)} de {operationsTotal}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={operationsPage === 0}
                      onClick={() => setOperationsPage(p => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(operationsPage + 1) * 20 >= operationsTotal}
                      onClick={() => setOperationsPage(p => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operation Detail Modal */}
            {selectedOperation && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  <CardHeader className="flex flex-row items-start justify-between sticky top-0 bg-background z-10">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Operación {selectedOperation.operation_number}
                        <Badge className={statusColors[selectedOperation.status]} variant="secondary">
                          {statusLabels[selectedOperation.status]}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Creada el {formatDate(selectedOperation.created_at)}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOperation(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Operation Summary */}
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatCurrency(selectedOperation.source_amount)}</p>
                          <p className="text-sm text-muted-foreground">{selectedOperation.source_currency}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <ArrowRight className="h-6 w-6 text-primary" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Tasa: {selectedOperation.exchange_rate} | Comisión: {(selectedOperation.fee_percentage * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatCurrency(selectedOperation.destination_amount)}</p>
                          <p className="text-sm text-muted-foreground">{selectedOperation.destination_currency}</p>
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Datos del Cliente
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Nombre</p>
                          <p className="font-medium">{selectedOperation.user_full_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{selectedOperation.user_email}</p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(selectedOperation.user_email, "email")}
                            >
                              {copiedField === "email" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                        {selectedOperation.user_phone && (
                          <div>
                            <p className="text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{selectedOperation.user_phone}</p>
                          </div>
                        )}
                        {selectedOperation.user_document_number && (
                          <div>
                            <p className="text-muted-foreground">Documento</p>
                            <p className="font-medium">{selectedOperation.user_document_type} {selectedOperation.user_document_number}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Beneficiary Info */}
                    {selectedOperation.beneficiary_full_name && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Datos del Beneficiario
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Nombre</p>
                            <p className="font-medium">{selectedOperation.beneficiary_full_name}</p>
                          </div>
                          {selectedOperation.beneficiary_phone && (
                            <div>
                              <p className="text-muted-foreground">Teléfono</p>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{selectedOperation.beneficiary_phone}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(selectedOperation.beneficiary_phone || "", "phone")}
                                >
                                  {copiedField === "phone" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedOperation.beneficiary_bank_name && (
                            <div>
                              <p className="text-muted-foreground">Banco</p>
                              <p className="font-medium">{selectedOperation.beneficiary_bank_name}</p>
                            </div>
                          )}
                          {selectedOperation.beneficiary_account_number && (
                            <div>
                              <p className="text-muted-foreground">Cuenta</p>
                              <div className="flex items-center gap-2">
                                <p className="font-medium font-mono">{selectedOperation.beneficiary_account_number}</p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(selectedOperation.beneficiary_account_number || "", "account")}
                                >
                                  {copiedField === "account" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              </div>
                            </div>
                          )}
                          {selectedOperation.beneficiary_document_number && (
                            <div>
                              <p className="text-muted-foreground">Documento</p>
                              <p className="font-medium">{selectedOperation.beneficiary_document_type} {selectedOperation.beneficiary_document_number}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Wallet Info */}
                    {selectedOperation.wallet_address && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Datos de Wallet
                        </h4>
                        <div className="text-sm space-y-2">
                          <div>
                            <p className="text-muted-foreground">Dirección</p>
                            <div className="flex items-center gap-2">
                              <p className="font-medium font-mono text-xs break-all">{selectedOperation.wallet_address}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => copyToClipboard(selectedOperation.wallet_address || "", "wallet")}
                              >
                                {copiedField === "wallet" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                          {selectedOperation.wallet_network && (
                            <div>
                              <p className="text-muted-foreground">Red</p>
                              <p className="font-medium">{selectedOperation.wallet_network}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Reference */}
                    {selectedOperation.payment_reference && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Referencia de Pago</p>
                        <p className="font-mono font-medium">{selectedOperation.payment_reference}</p>
                      </div>
                    )}

                    {/* Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Historial
                      </h4>
                      <div className="space-y-3">
                        {operationLogs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Sin cambios registrados</p>
                        ) : (
                          operationLogs.map((log) => (
                            <div key={log.id} className="flex gap-3 text-sm">
                              <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                              <div>
                                <p>
                                  <span className="font-medium">{statusLabels[log.previous_status]}</span>
                                  {" → "}
                                  <span className="font-medium">{statusLabels[log.new_status]}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(log.created_at)} por {log.changed_by}
                                </p>
                                {log.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">"{log.notes}"</p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {selectedOperation.status !== "completed" && selectedOperation.status !== "cancelled" && (
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3">Acciones</h4>
                        <div className="space-y-3">
                          <div>
                            <Label>Notas (opcional)</Label>
                            <Input
                              placeholder="Agregar nota a la acción..."
                              value={actionNotes}
                              onChange={(e) => setActionNotes(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedOperation.status === "pending" && (
                              <Button
                                onClick={() => handleOperationAction("approve")}
                                disabled={actionLoading}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aprobar
                              </Button>
                            )}
                            {selectedOperation.status === "awaiting_payment" && (
                              <Button
                                onClick={() => handleOperationAction("confirm_payment")}
                                disabled={actionLoading}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Confirmar Pago
                              </Button>
                            )}
                            {selectedOperation.status === "processing" && (
                              <Button
                                onClick={() => handleOperationAction("complete")}
                                disabled={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Completar
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              onClick={() => handleOperationAction("cancel")}
                              disabled={actionLoading}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Revive Action */}
                    {selectedOperation.status === "cancelled" && (
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Operación Cancelada</p>
                            <p className="text-xs text-muted-foreground">Puedes reactivar esta operación si fue cancelada por error</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOperationAction("revive")}
                            disabled={actionLoading}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Revivir
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Rates Tab */}
          <TabsContent value="rates" className="space-y-6">
            {/* Main Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Pares Principales
                </CardTitle>
                <CardDescription>USD/VES y VES/USDT - Los pares más importantes</CardDescription>
              </CardHeader>
              <CardContent>
                {ratesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {mainRates.map((rate) => {
                      const preview = calculatePreview(rate)
                      const isEditing = editingRate === rate.id
                      return (
                        <Card key={rate.id} className={`border-2 ${rate.is_active ? "border-primary/20" : "border-red-200 bg-red-50/50"}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{currencyFlags[rate.source_currency]}</span>
                                <span className="font-bold">{rate.source_currency}</span>
                                <ArrowRight className="h-4 w-4" />
                                <span className="text-2xl">{currencyFlags[rate.destination_currency]}</span>
                                <span className="font-bold">{rate.destination_currency}</span>
                              </div>
                              <Badge variant={rate.is_active ? "default" : "secondary"}>
                                {rate.is_active ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>

                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Tasa</Label>
                                    <Input
                                      type="number"
                                      step="0.0001"
                                      value={editRateValues.rate}
                                      onChange={(e) => setEditRateValues(prev => ({ ...prev, rate: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Comisión %</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editRateValues.fee}
                                      onChange={(e) => setEditRateValues(prev => ({ ...prev, fee: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Mín</Label>
                                    <Input
                                      type="number"
                                      value={editRateValues.min}
                                      onChange={(e) => setEditRateValues(prev => ({ ...prev, min: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Máx</Label>
                                    <Input
                                      type="number"
                                      value={editRateValues.max}
                                      onChange={(e) => setEditRateValues(prev => ({ ...prev, max: e.target.value }))}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleUpdateRate(rate.id)} disabled={actionLoading}>
                                    <Save className="h-4 w-4 mr-1" />
                                    Guardar
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingRate(null)}>
                                    <X className="h-4 w-4 mr-1" />
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Tasa</p>
                                    <p className="text-xl font-bold">{formatCurrency(rate.rate, 4)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Comisión</p>
                                    <p className="text-xl font-bold">{(rate.fee_percentage * 100).toFixed(2)}%</p>
                                  </div>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg mb-4">
                                  <p className="text-xs text-muted-foreground mb-1">Preview en calculadora</p>
                                  <p className="text-sm">
                                    {preview.send} {rate.source_currency} → <strong>{formatCurrency(preview.receive)}</strong> {rate.destination_currency}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingRate(rate.id)
                                      setEditRateValues({
                                        rate: rate.rate.toString(),
                                        fee: (rate.fee_percentage * 100).toString(),
                                        min: rate.min_amount.toString(),
                                        max: rate.max_amount.toString(),
                                      })
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={rate.is_active ? "destructive" : "default"}
                                    onClick={() => handleToggleRateActive(rate)}
                                  >
                                    <Power className="h-4 w-4 mr-1" />
                                    {rate.is_active ? "Desactivar" : "Activar"}
                                  </Button>
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Rates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Otros Pares de Divisas</CardTitle>
                  <CardDescription>{otherRates.length} pares configurados</CardDescription>
                </div>
                <Button onClick={() => setShowNewRateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Par
                </Button>
              </CardHeader>
              <CardContent>
                {ratesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {otherRates.map((rate) => {
                      const isEditing = editingRate === rate.id
                      return (
                        <div
                          key={rate.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border ${
                            rate.is_active ? "bg-background" : "bg-red-50/50 border-red-200"
                          }`}
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <span>{currencyFlags[rate.source_currency]}</span>
                            <span className="font-medium">{rate.source_currency}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span>{currencyFlags[rate.destination_currency]}</span>
                            <span className="font-medium">{rate.destination_currency}</span>
                          </div>

                          {isEditing ? (
                            <div className="flex-1 flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.0001"
                                value={editRateValues.rate}
                                onChange={(e) => setEditRateValues(prev => ({ ...prev, rate: e.target.value }))}
                                className="w-28"
                                placeholder="Tasa"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={editRateValues.fee}
                                onChange={(e) => setEditRateValues(prev => ({ ...prev, fee: e.target.value }))}
                                className="w-20"
                                placeholder="% Com"
                              />
                              <Button size="sm" onClick={() => handleUpdateRate(rate.id)} disabled={actionLoading}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingRate(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 flex items-center gap-6">
                                <div>
                                  <p className="text-xs text-muted-foreground">Tasa</p>
                                  <p className="font-mono font-medium">{formatCurrency(rate.rate, 4)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Comisión</p>
                                  <p className="font-medium">{(rate.fee_percentage * 100).toFixed(2)}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Rango</p>
                                  <p className="text-sm">{formatCurrency(rate.min_amount, 0)} - {formatCurrency(rate.max_amount, 0)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditingRate(rate.id)
                                    setEditRateValues({
                                      rate: rate.rate.toString(),
                                      fee: (rate.fee_percentage * 100).toString(),
                                      min: rate.min_amount.toString(),
                                      max: rate.max_amount.toString(),
                                    })
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className={`h-8 w-8 ${rate.is_active ? "text-emerald-600" : "text-red-600"}`}
                                  onClick={() => handleToggleRateActive(rate)}
                                >
                                  <Power className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => handleDeleteRate(rate.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* New Rate Modal */}
            {showNewRateForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Agregar Nuevo Par</CardTitle>
                    <CardDescription>Configura un nuevo par de divisas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Moneda Origen</Label>
                        <Select
                          value={newRate.sourceCurrency}
                          onValueChange={(v) => setNewRate(prev => ({ ...prev, sourceCurrency: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {["USD", "EUR", "VES", "COP", "MXN", "ARS", "BRL", "CLP", "PEN", "USDT"].map((c) => (
                              <SelectItem key={c} value={c}>
                                {currencyFlags[c]} {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Moneda Destino</Label>
                        <Select
                          value={newRate.destinationCurrency}
                          onValueChange={(v) => setNewRate(prev => ({ ...prev, destinationCurrency: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {["USD", "EUR", "VES", "COP", "MXN", "ARS", "BRL", "CLP", "PEN", "USDT"].map((c) => (
                              <SelectItem key={c} value={c}>
                                {currencyFlags[c]} {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Tasa de Cambio</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="Ej: 36.50"
                        value={newRate.rate}
                        onChange={(e) => setNewRate(prev => ({ ...prev, rate: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Comisión %</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newRate.feePercentage}
                          onChange={(e) => setNewRate(prev => ({ ...prev, feePercentage: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Mínimo</Label>
                        <Input
                          type="number"
                          value={newRate.minAmount}
                          onChange={(e) => setNewRate(prev => ({ ...prev, minAmount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Máximo</Label>
                        <Input
                          type="number"
                          value={newRate.maxAmount}
                          onChange={(e) => setNewRate(prev => ({ ...prev, maxAmount: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" onClick={handleCreateRate} disabled={actionLoading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Par
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewRateForm(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nueva Contraseña</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label>Confirmar Contraseña</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!newPassword || newPassword !== confirmPassword}
                    onClick={() => {
                      alert("Funcionalidad pendiente de implementar")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    Actualizar Contraseña
                  </Button>
                </CardContent>
              </Card>

              {/* Create Admin */}
              <Card>
                <CardHeader>
                  <CardTitle>Crear Nuevo Admin</CardTitle>
                  <CardDescription>Agrega un nuevo administrador al sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="admin@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label>Contraseña</Label>
                    <Input
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!newAdminEmail || !newAdminPassword}
                    onClick={() => {
                      alert("Funcionalidad pendiente de implementar")
                      setNewAdminEmail("")
                      setNewAdminPassword("")
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Admin
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pares Activos</p>
                    <p className="text-2xl font-bold">{rates.filter(r => r.is_active).length}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Usuarios</p>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Operaciones Hoy</p>
                    <p className="text-2xl font-bold">
                      {(stats?.byStatus.completedToday || 0) + (stats?.byStatus.cancelledToday || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
