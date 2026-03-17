"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Smartphone, Building, User, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFlow } from "@/contexts/FlowContext"
import { supabase } from "@/lib/supabase"
import type { BeneficiaryData } from "@/types/database"
import ProgressBar from "@/components/ProgressBar"

interface BeneficiaryRecord extends BeneficiaryData {
  id: string
}

export default function BeneficiaryDashboardStep() {
  const { user, setBeneficiary, setCurrentStep, getNextStep, getPreviousStep } = useFlow()
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar beneficiarios del usuario
  useEffect(() => {
    const loadBeneficiaries = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!user?.email) {
          setError("Usuario no identificado")
          setIsLoading(false)
          return
        }

        // Primero obtener el user_id del usuario actual
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", user.email)
          .single()

        if (userError || !userData) {
          setError("Error al cargar datos del usuario")
          setIsLoading(false)
          return
        }

        // Luego traer los beneficiarios de ese usuario
        const { data, error: beneficiaryError } = await supabase
          .from("beneficiaries")
          .select("*")
          .eq("user_id", userData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (beneficiaryError) {
          setError("Error al cargar beneficiarios")
          setIsLoading(false)
          return
        }

        // Mapear los datos de Supabase al formato BeneficiaryData
        const mappedBeneficiaries: BeneficiaryRecord[] = (data || []).map((item: any) => ({
          id: item.id,
          fullName: item.full_name,
          phone: item.phone,
          email: item.email,
          relationship: "otro", // Por defecto, ya que no está en la BD
          pagomovil: item.document_number
            ? {
                phone: item.phone,
                bank: item.bank_name,
                accountHolder: item.full_name,
                cedula: `${item.document_type}-${item.document_number}`,
              }
            : undefined,
          walletAddress: item.wallet_address,
        }))

        setBeneficiaries(mappedBeneficiaries)
      } catch (err) {
        console.error("[v0] Error loading beneficiaries:", err)
        setError("Error inesperado al cargar beneficiarios")
      } finally {
        setIsLoading(false)
      }
    }

    loadBeneficiaries()
  }, [user?.email])

  const handleBack = () => {
    setCurrentStep(getPreviousStep("beneficiary-dashboard"))
  }

  const handleSelectBeneficiary = (beneficiary: BeneficiaryRecord) => {
    // Guardar en el contexto sin el id
    const { id, ...beneficiaryData } = beneficiary
    setBeneficiary(beneficiaryData)
    setCurrentStep(getNextStep("beneficiary-dashboard"))
  }

  const handleAddNew = () => {
    // Limpiar beneficiario y ir al formulario vacío
    setBeneficiary(null)
    setCurrentStep("beneficiary-data")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6">
        <ProgressBar />
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <p className="text-gray-600">Cargando destinatarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 sm:p-6">
      <ProgressBar />

      <div className="max-w-2xl mx-auto mt-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Atrás
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selecciona un destinatario</h1>
          <p className="text-gray-600">Elige un beneficiario guardado o agregar uno nuevo</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {beneficiaries.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes destinatarios guardados</h3>
              <p className="text-gray-600 mb-6">Agrega tu primer destinatario para continuar</p>
              <Button onClick={handleAddNew} size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="w-5 h-5 mr-2" />
                Agregar destinatario
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {beneficiaries.map((beneficiary) => (
                <Card
                  key={beneficiary.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Nombre y relación */}
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{beneficiary.fullName}</h3>
                          <p className="text-sm text-gray-500">Beneficiario</p>
                        </div>

                        {/* Información de contacto */}
                        <div className="space-y-2 mb-4">
                          {beneficiary.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>{beneficiary.phone}</span>
                            </div>
                          )}
                          {beneficiary.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <User className="w-4 h-4 text-gray-400" />
                              <span>{beneficiary.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Datos de pago móvil si existen */}
                        {beneficiary.pagomovil && (
                          <div className="bg-blue-50 rounded-lg p-3 text-sm border border-blue-100">
                            <div className="flex items-center gap-2 mb-2 font-semibold text-blue-900">
                              <Smartphone className="w-4 h-4" />
                              Pago Móvil
                            </div>
                            <div className="space-y-1 text-blue-800">
                              <p>
                                <span className="font-medium">Banco:</span> {beneficiary.pagomovil.bank}
                              </p>
                              <p>
                                <span className="font-medium">Teléfono:</span> 0{beneficiary.pagomovil.phone}
                              </p>
                              <p>
                                <span className="font-medium">Titular:</span> {beneficiary.pagomovil.accountHolder}
                              </p>
                              {beneficiary.pagomovil.cedula && (
                                <p>
                                  <span className="font-medium">Cédula:</span> {beneficiary.pagomovil.cedula}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Cartera (wallet) si existe */}
                        {beneficiary.walletAddress && (
                          <div className="bg-purple-50 rounded-lg p-3 text-sm border border-purple-100 mt-3">
                            <div className="flex items-center gap-2 font-semibold text-purple-900 mb-1">
                              <Building className="w-4 h-4" />
                              Cartera Digital
                            </div>
                            <p className="text-purple-800 break-all">{beneficiary.walletAddress}</p>
                          </div>
                        )}
                      </div>

                      {/* Botón de selección */}
                      <Button
                        onClick={() => handleSelectBeneficiary(beneficiary)}
                        className="mt-2 bg-primary hover:bg-primary/90 whitespace-nowrap"
                      >
                        Seleccionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Botón agregar nuevo */}
            <Card className="border-2 border-dashed hover:border-primary transition-colors">
              <CardContent className="pt-6 pb-6">
                <button
                  onClick={handleAddNew}
                  className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-medium py-2"
                >
                  <Plus className="w-5 h-5" />
                  Agregar nuevo destinatario
                </button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
