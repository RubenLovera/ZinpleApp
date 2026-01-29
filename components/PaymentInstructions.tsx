"use client"

import React from "react"

import { useState } from "react"
import { Copy, CheckCircle, Building, Wallet, Smartphone, Globe, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Currency, PaymentMethod } from "@/types/database"

interface PaymentInstructionsProps {
  currency: Currency
  amount: number
  paymentMethod?: PaymentMethod
}

// Datos de cuentas de ZinpleApp por método de pago
const ZINPLE_ACCOUNTS: Record<PaymentMethod, {
  title: string
  icon: React.ReactNode
  color: string
  fields: { label: string; value: string; copyable?: boolean }[]
  instructions: string[]
}> = {
  zelle: {
    title: "Datos de Zelle - ZinpleApp",
    icon: <CreditCard className="w-5 h-5" />,
    color: "green",
    fields: [
      { label: "Zelle ID", value: "sonderenter@gmail.com", copyable: true },
      { label: "Titular", value: "SONDERENTER INC", copyable: true },
      { label: "Tipo de cuenta", value: "CORPORATIVA", copyable: false },
    ],
    instructions: [
      "Abre tu app de Zelle",
      "Envía el monto exacto al email indicado",
      "Guarda el comprobante de pago",
      "Envía el comprobante por WhatsApp",
    ],
  },
  spei: {
    title: "Datos SPEI - ZinpleApp México",
    icon: <Building className="w-5 h-5" />,
    color: "blue",
    fields: [
      { label: "CLABE", value: "012180001234567890", copyable: true },
      { label: "Banco", value: "BBVA México", copyable: false },
      { label: "Beneficiario", value: "ZINPLE MEXICO SA DE CV", copyable: true },
      { label: "Referencia", value: "Tu número de operación", copyable: false },
    ],
    instructions: [
      "Realiza una transferencia SPEI desde tu banco",
      "Usa la CLABE indicada",
      "Incluye tu número de operación como referencia",
      "Envía el comprobante por WhatsApp",
    ],
  },
  transferencia_cl: {
    title: "Datos Transferencia - ZinpleApp Chile",
    icon: <Building className="w-5 h-5" />,
    color: "red",
    fields: [
      { label: "Banco", value: "Banco de Chile", copyable: false },
      { label: "Tipo de cuenta", value: "Cuenta Corriente", copyable: false },
      { label: "Número de cuenta", value: "00-123-45678-90", copyable: true },
      { label: "RUT", value: "76.XXX.XXX-X", copyable: true },
      { label: "Beneficiario", value: "ZINPLE CHILE SPA", copyable: true },
    ],
    instructions: [
      "Realiza una transferencia desde tu banco",
      "Usa los datos de cuenta indicados",
      "Incluye tu número de operación en la descripción",
      "Envía el comprobante por WhatsApp",
    ],
  },
  transferencia_pe: {
    title: "Datos Transferencia - ZinpleApp Perú",
    icon: <Building className="w-5 h-5" />,
    color: "red",
    fields: [
      { label: "Banco", value: "BCP", copyable: false },
      { label: "Tipo de cuenta", value: "Cuenta Corriente Soles", copyable: false },
      { label: "Número de cuenta", value: "191-12345678-0-90", copyable: true },
      { label: "CCI", value: "00219112345678090123", copyable: true },
      { label: "Beneficiario", value: "ZINPLE PERU SAC", copyable: true },
    ],
    instructions: [
      "Realiza una transferencia interbancaria",
      "Usa el CCI si tu banco es diferente a BCP",
      "Incluye tu número de operación como glosa",
      "Envía el comprobante por WhatsApp",
    ],
  },
  pix: {
    title: "Datos PIX - ZinpleApp Brasil",
    icon: <Smartphone className="w-5 h-5" />,
    color: "green",
    fields: [
      { label: "Chave PIX (CNPJ)", value: "12.345.678/0001-90", copyable: true },
      { label: "Beneficiario", value: "ZINPLE BRASIL LTDA", copyable: true },
      { label: "Banco", value: "Nubank", copyable: false },
    ],
    instructions: [
      "Abre tu app bancaria con PIX",
      "Escanea el QR o usa la chave PIX indicada",
      "Confirma el monto y el beneficiario",
      "Envía el comprobante por WhatsApp",
    ],
  },
  transferencia_co: {
    title: "Datos Transferencia - ZinpleApp Colombia",
    icon: <Building className="w-5 h-5" />,
    color: "yellow",
    fields: [
      { label: "Banco", value: "Bancolombia", copyable: false },
      { label: "Tipo de cuenta", value: "Cuenta de Ahorros", copyable: false },
      { label: "Número de cuenta", value: "123-456789-01", copyable: true },
      { label: "NIT", value: "900.XXX.XXX-X", copyable: true },
      { label: "Beneficiario", value: "ZINPLE COLOMBIA SAS", copyable: true },
    ],
    instructions: [
      "Realiza una transferencia desde tu banco",
      "Usa los datos de cuenta indicados",
      "Incluye tu número de operación en la descripción",
      "Envía el comprobante por WhatsApp",
    ],
  },
  sepa: {
    title: "Datos SEPA - ZinpleApp Europa",
    icon: <Globe className="w-5 h-5" />,
    color: "blue",
    fields: [
      { label: "IBAN", value: "ES12 1234 5678 9012 3456 7890", copyable: true },
      { label: "BIC/SWIFT", value: "BBVAESMMXXX", copyable: true },
      { label: "Beneficiario", value: "ZINPLE EUROPE SL", copyable: true },
      { label: "Banco", value: "BBVA España", copyable: false },
    ],
    instructions: [
      "Realiza una transferencia SEPA desde tu banco",
      "Usa el IBAN indicado",
      "Incluye tu número de operación como concepto",
      "Envía el comprobante por WhatsApp",
    ],
  },
  pagomovil: {
    title: "Datos Pago Móvil - ZinpleApp",
    icon: <Smartphone className="w-5 h-5" />,
    color: "blue",
    fields: [
      { label: "Teléfono", value: "0414-1234567", copyable: true },
      { label: "Banco", value: "Banesco", copyable: false },
      { label: "Cédula", value: "V-12345678", copyable: true },
    ],
    instructions: [
      "Abre tu app de Pago Móvil",
      "Ingresa los datos indicados",
      "Confirma el monto exacto",
      "Envía el comprobante por WhatsApp",
    ],
  },
  usdt_polygon: {
    title: "Wallet USDT - ZinpleApp",
    icon: <Wallet className="w-5 h-5" />,
    color: "purple",
    fields: [
      { label: "Red", value: "Polygon (MATIC)", copyable: false },
      { label: "Dirección", value: "0x1234...abcd", copyable: true },
      { label: "Token", value: "USDT", copyable: false },
    ],
    instructions: [
      "Abre tu wallet de criptomonedas",
      "Selecciona la red Polygon",
      "Envía USDT a la dirección indicada",
      "Espera la confirmación y envía el hash por WhatsApp",
    ],
  },
}

// Mapeo de moneda a método de pago
const CURRENCY_TO_METHOD: Record<Currency, PaymentMethod> = {
  USD: "zelle",
  MXN: "spei",
  CLP: "transferencia_cl",
  PEN: "transferencia_pe",
  BRL: "pix",
  COP: "transferencia_co",
  EUR: "sepa",
  VES: "pagomovil",
  USDT: "usdt_polygon",
}

export default function PaymentInstructions({ currency, amount, paymentMethod }: PaymentInstructionsProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const method = paymentMethod || CURRENCY_TO_METHOD[currency]
  const accountData = ZINPLE_ACCOUNTS[method]

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  const colorClasses = {
    green: "border-green-200 bg-green-50 text-green-800",
    blue: "border-blue-200 bg-blue-50 text-blue-800",
    red: "border-red-200 bg-red-50 text-red-800",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-800",
    purple: "border-purple-200 bg-purple-50 text-purple-800",
  }

  return (
    <Card className={colorClasses[accountData.color as keyof typeof colorClasses]}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {accountData.icon}
          {accountData.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monto a enviar */}
        <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
          <span className="font-medium">Monto a enviar:</span>
          <span className="text-2xl font-bold">
            {currency === "USDT" ? "" : "$"}{amount.toLocaleString()} {currency}
          </span>
        </div>

        {/* Campos de la cuenta */}
        <div className="space-y-3">
          {accountData.fields.map((field) => (
            <div key={field.label} className="flex justify-between items-center">
              <span className="font-medium">{field.label}:</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono ${field.copyable ? "font-bold" : ""}`}>
                  {field.value}
                </span>
                {field.copyable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(field.value, field.label)}
                    className="h-6 w-6 p-0"
                  >
                    {copied === field.label ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instrucciones */}
        <div className="mt-4 pt-4 border-t border-current/10">
          <p className="font-medium mb-2">Instrucciones:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            {accountData.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
