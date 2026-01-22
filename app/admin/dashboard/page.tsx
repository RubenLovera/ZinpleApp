"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Shield,
  LogOut,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Eye,
  RefreshCw,
  History,
  X,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Operation {
  id: string
  user_email: string
  amount: number
  currency: string
  result: number
  payer_name: string
  payer_email: string
  payer_phone: string
  payer_is_user: boolean
  status: "pending" | "completed" | "cancelled"
  created_at: string
}

interface Stats {
  pendingOperations: number
  completedToday: number
  totalProcessedToday: number
  totalUsers: number
}

export default function AdminDashboard() {
  const [pendingOperations, setPendingOperations] = useState<Operation[]>([])
  const [completedOperations, setCompletedOperations] = useState<Operation[]>([])
  const [cancelledOperations, setCancelledOperations] = useState<Operation[]>([])
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "cancelled">("pending")
  const [stats, setStats] = useState<Stats>({
    pendingOperations: 0,
    completedToday: 0,
    totalProcessedToday: 0,
    totalUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [operationToCancel, setOperationToCancel] = useState<Operation | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  // Verificar autenticación
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("zinple_admin_auth")
    if (isAuthenticated !== "true") {
      router.push("/admin")
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [pendingRes, completedRes, cancelledRes, statsRes] = await Promise.all([
        fetch("/api/admin/operations?status=pending"),
        fetch("/api/admin/operations?status=completed"),
        fetch("/api/admin/operations?status=cancelled"),
        fetch("/api/admin/stats"),
      ])

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        setPendingOperations(pendingData.operations)
      }

      if (completedRes.ok) {
        const completedData = await completedRes.json()
        setCompletedOperations(completedData.operations)
      }

      if (cancelledRes.ok) {
        const cancelledData = await cancelledRes.json()
        setCancelledOperations(cancelledData.operations)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("zinple_admin_auth")
    router.push("/admin")
  }

  const handleCompleteOperation = async (operationId: string) => {
    try {
      const response = await fetch("/api/operations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationId,
          status: "completed",
        }),
      })

      if (response.ok) {
        // Recargar datos
        await loadData()
        setSelectedOperation(null)
      } else {
        alert("Error al completar la operación")
      }
    } catch (error) {
      console.error("Error completing operation:", error)
      alert("Error al completar la operación")
    }
  }

  const handleCancelOperation = async () => {
    if (!operationToCancel) return

    setIsCancelling(true)
    try {
      const response = await fetch("/api/operations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operationId: operationToCancel.id,
          status: "cancelled",
          reason: cancellationReason.trim() || undefined,
        }),
      })

      if (response.ok) {
        // Recargar datos
        await loadData()
        setSelectedOperation(null)
        setOperationToCancel(null)
        setCancellationReason("")
      } else {
        alert("Error al cancelar la operación")
      }
    } catch (error) {
      console.error("Error cancelling operation:", error)
      alert("Error al cancelar la operación")
    } finally {
      setIsCancelling(false)
    }
  }

  const openCancelModal = (operation: Operation) => {
    setOperationToCancel(operation)
    setCancellationReason("")
  }

  const closeCancelModal = () => {
    setOperationToCancel(null)
    setCancellationReason("")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "usdt") {
      return `${amount.toFixed(2)} USDT`
    } else {
      return `${amount.toFixed(2)} VES`
    }
  }

  const currentOperations =
    activeTab === "pending" ? pendingOperations : activeTab === "completed" ? completedOperations : cancelledOperations

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#5B38B5" }}>
                Panel Administrativo
              </h1>
              <p className="text-sm text-gray-600">ZinpleApp</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operaciones Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOperations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Procesado Hoy</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${stats.totalProcessedToday.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Operations List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Operaciones</CardTitle>
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "pending" ? "bg-white text-orange-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2 inline" />
                  Pendientes ({pendingOperations.length})
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "completed"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <History className="w-4 h-4 mr-2 inline" />
                  Completadas ({completedOperations.length})
                </button>
                <button
                  onClick={() => setActiveTab("cancelled")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "cancelled" ? "bg-white text-red-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <X className="w-4 h-4 mr-2 inline" />
                  Canceladas ({cancelledOperations.length})
                </button>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </CardHeader>
          <CardContent>
            {currentOperations.length === 0 ? (
              <div className="text-center py-8">
                {activeTab === "pending" ? (
                  <>
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">¡No hay operaciones pendientes!</p>
                  </>
                ) : activeTab === "completed" ? (
                  <>
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay operaciones completadas aún</p>
                  </>
                ) : (
                  <>
                    <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay operaciones canceladas</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {currentOperations.map((operation) => (
                  <div
                    key={operation.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {operation.id}
                          </Badge>
                          <Badge
                            variant={
                              operation.status === "pending"
                                ? "destructive"
                                : operation.status === "completed"
                                  ? "default"
                                  : "outline"
                            }
                            className={
                              operation.status === "pending"
                                ? "bg-orange-100 text-orange-800"
                                : operation.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {operation.status === "pending"
                              ? "Pendiente"
                              : operation.status === "completed"
                                ? "Completada"
                                : "Cancelada"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Usuario:</p>
                            <p className="font-medium">{operation.user_email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Monto:</p>
                            <p className="font-medium">
                              ${operation.amount.toFixed(2)} USD →{" "}
                              {formatCurrency(operation.result, operation.currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">
                              {operation.status === "pending" ? "Creada:" : "Completada:"}
                            </p>
                            <p className="font-medium">{formatDate(operation.created_at)}</p>
                          </div>
                        </div>
                        {!operation.payer_is_user && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <p className="text-blue-800">
                              <strong>Pago de tercero:</strong> {operation.payer_name} ({operation.payer_phone})
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedOperation(operation)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {operation.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleCompleteOperation(operation.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Completar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openCancelModal(operation)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Operation Detail Modal */}
      {selectedOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Detalles de la Operación</h2>
                <Button variant="ghost" onClick={() => setSelectedOperation(null)}>
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">ID de Operación</Label>
                    <p className="font-mono font-bold">{selectedOperation.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Estado</Label>
                    <Badge
                      variant={
                        selectedOperation.status === "pending"
                          ? "destructive"
                          : selectedOperation.status === "completed"
                            ? "default"
                            : "outline"
                      }
                      className={
                        selectedOperation.status === "pending"
                          ? "bg-orange-100 text-orange-800"
                          : selectedOperation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {selectedOperation.status === "pending"
                        ? "Pendiente"
                        : selectedOperation.status === "completed"
                          ? "Completada"
                          : "Cancelada"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Monto USD</Label>
                    <p className="text-xl font-bold">${selectedOperation.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Resultado</Label>
                    <p className="text-xl font-bold">
                      {formatCurrency(selectedOperation.result, selectedOperation.currency)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Usuario</Label>
                  <p className="font-medium">{selectedOperation.user_email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Pagador</Label>
                    <p className="font-medium">{selectedOperation.payer_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Teléfono</Label>
                    <p className="font-medium">{selectedOperation.payer_phone}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Tipo de Pago</Label>
                  <p className="font-medium">{selectedOperation.payer_is_user ? "Pago propio" : "Pago de tercero"}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Fecha de Creación</Label>
                  <p className="font-medium">{formatDate(selectedOperation.created_at)}</p>
                </div>

                {selectedOperation.status === "pending" && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => handleCompleteOperation(selectedOperation.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Completada
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Operation Modal */}
      {operationToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Cancelar Operación</h2>
                  <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">ID de Operación:</span>
                    <span className="font-mono font-bold">{operationToCancel.id}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Usuario:</span>
                    <span className="font-medium">{operationToCancel.user_email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Monto:</span>
                    <span className="font-bold">${operationToCancel.amount.toFixed(2)} USD</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                    Motivo de cancelación (opcional)
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Ej: Datos incorrectos, solicitud del usuario, etc."
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este motivo se incluirá en el email de notificación al usuario
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 font-medium text-sm">¿Estás seguro?</p>
                      <p className="text-red-700 text-sm mt-1">
                        Al cancelar esta operación, el usuario recibirá un email de notificación y no podrá completar el
                        pago.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCancelOperation}
                    disabled={isCancelling}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isCancelling ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Sí, Cancelar Operación
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={closeCancelModal} disabled={isCancelling} className="flex-1">
                    No, Mantener
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
