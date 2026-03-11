'use client'

import { ArrowLeft, CheckCircle, Shield, Users, Globe, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFlow } from '@/contexts/FlowContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function WelcomeStep() {
  const { currentStep, setCurrentStep, getPreviousStep } = useFlow()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
    }
    getUser()
  }, [])

  const goBack = () => {
    setCurrentStep(getPreviousStep(currentStep))
  }

  const handleContinue = async () => {
    console.log('[v0] BUTTON CLICKED')
    if (!user) return
    
    setLoading(true)
    try {
      // Marcar que el usuario ya vio la pantalla de bienvenida
      const { error } = await supabase
        .from('users')
        .update({ has_seen_welcome: true })
        .eq('id', user.id)
      
      if (error) throw error
      
      // Ir al siguiente paso (user-data para completar datos personales)
      setCurrentStep('user-data')
    } catch (err) {
      console.error('Error marking welcome as seen:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="space-y-8">
          {/* Título */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              ¡Bienvenido a ZinpleApp!
            </h1>
            <p className="text-lg text-muted-foreground">
              Tu plataforma segura para enviar dinero internacionalmente
            </p>
          </div>

          {/* Cards Informativos */}
          <div className="space-y-6">
            {/* Seguridad */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  Seguridad Garantizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Tus transacciones están protegidas con los más altos estándares de encriptación. 
                  Trabajamos con proveedores regulados internacionalmente (BITSO, BRIDGE, CRIXTO) 
                  para garantizar la seguridad de tu dinero.
                </p>
              </CardContent>
            </Card>

            {/* Facilidad */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Send className="w-5 h-5 text-primary" />
                  </div>
                  Envíos Rápidos y Fáciles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Realiza transferencias internacionales en minutos. Solo necesitas la información 
                  del beneficiario y podrás enviar dinero a más de 150 países sin complicaciones.
                </p>
              </CardContent>
            </Card>

            {/* Tarifas */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  Tarifas Competitivas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Disfruta de tasas de cambio actualizadas en tiempo real y comisiones bajas y transparentes. 
                  Sin cargos ocultos, siempre sabes exactamente cuánto pagarás.
                </p>
              </CardContent>
            </Card>

            {/* Soporte */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  Soporte Disponible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Nuestro equipo está disponible para ayudarte en WhatsApp. Responde tus preguntas 
                  sobre transacciones, beneficiarios y cualquier duda que tengas sobre la plataforma.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Botón de Continuar */}
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="w-full text-white text-lg py-6 bg-primary hover:bg-primary/90"
          >
            {loading ? 'Procesando...' : 'Comenzar a Operar'}
          </Button>

          {/* Nota informativa */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Esta pantalla de bienvenida solo aparece una vez. La próxima vez que inicies sesión, 
                irás directamente a la calculadora de transferencias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
