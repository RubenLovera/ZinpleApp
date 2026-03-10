"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { ChevronDown, ArrowRight, Send, Download, Wallet, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFlow } from "@/contexts/FlowContext"
import useSWR from "swr"

type OperationMode = "send" | "receive" | "buy_usdt" | "sell_usdt"

interface CurrencyOption {
  code: string
  name: string
  symbol: string
  country: string
}

interface RateData {
  rate: number
  fee: number
  min: number
  max: number
}

// Monedas disponibles
const currencies: Record<string, CurrencyOption> = {
  USD: { code: "USD", name: "Dolar", symbol: "$", country: "Estados Unidos" },
  EUR: { code: "EUR", name: "Euro", symbol: "\u20AC", country: "Europa" },
  CLP: { code: "CLP", name: "Peso Chileno", symbol: "$", country: "Chile" },
  MXN: { code: "MXN", name: "Peso Mexicano", symbol: "$", country: "Mexico" },
  PEN: { code: "PEN", name: "Sol Peruano", symbol: "S/", country: "Peru" },
  BRL: { code: "BRL", name: "Real Brasileno", symbol: "R$", country: "Brasil" },
  COP: { code: "COP", name: "Peso Colombiano", symbol: "$", country: "Colombia" },
  VES: { code: "VES", name: "Bolivar", symbol: "Bs", country: "Venezuela" },
  USDT: { code: "USDT", name: "Tether", symbol: "\u20AE", country: "Crypto" },
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const modeConfig: Record<OperationMode, {
  label: string
  icon: React.ReactNode
  sourceLabel: string
  destLabel: string
  ctaLabel: string
  description: string
}> = {
  send: {
    label: "Enviar a Venezuela",
    icon: <Send className="w-4 h-4" />,
    sourceLabel: "Tu envias",
    destLabel: "Beneficiario recibe",
    ctaLabel: "Enviar ahora",
    description: "Envia dinero a tus familiares en Venezuela",
  },
  receive: {
    label: "Recibir en Venezuela",
    icon: <Download className="w-4 h-4" />,
    sourceLabel: "Remitente envia",
    destLabel: "Tu recibes",
    ctaLabel: "Crear link de pago",
    description: "Crea un link para que te envien dinero",
  },
  buy_usdt: {
    label: "Comprar USDT",
    icon: <Wallet className="w-4 h-4" />,
    sourceLabel: "Tu envias",
    destLabel: "Recibes",
    ctaLabel: "Comprar USDT",
    description: "Convierte tu dinero fiat a criptomonedas",
  },
  sell_usdt: {
    label: "Vender USDT",
    icon: <RefreshCw className="w-4 h-4" />,
    sourceLabel: "Tu envias",
    destLabel: "Recibes",
    ctaLabel: "Vender USDT",
    description: "Convierte tus USDT a bolivares",
  },
}

export default function MultiCurrencyCalculator() {
  const { setQuote, setCurrentStep, setOperationMode } = useFlow()

  // Fetch rates from API with SWR (revalidate every 30s and on focus)
  const { data, error, isLoading } = useSWR<{ rates: Record<string, RateData>; updatedAt: string }>(
    "/api/rates",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  )

  const exchangeRates = data?.rates || {}

  // Build available currency pairs dynamically from the fetched rates
  const { sourceCurrenciesByMode, destCurrenciesByMode } = useMemo(() => {
    const srcByMode: Record<OperationMode, string[]> = {
      send: [],
      receive: [],
      buy_usdt: [],
      sell_usdt: [],
    }
    const dstByMode: Record<OperationMode, string[]> = {
      send: [],
      receive: [],
      buy_usdt: [],
      sell_usdt: [],
    }

    const srcSets: Record<OperationMode, Set<string>> = {
      send: new Set(),
      receive: new Set(),
      buy_usdt: new Set(),
      sell_usdt: new Set(),
    }
    const dstSets: Record<OperationMode, Set<string>> = {
      send: new Set(),
      receive: new Set(),
      buy_usdt: new Set(),
      sell_usdt: new Set(),
    }

    for (const pair of Object.keys(exchangeRates)) {
      const [src, dst] = pair.split("-")
      if (!src || !dst) continue

      // send/receive: fiat -> VES
      if (dst === "VES" && src !== "USDT") {
        srcSets.send.add(src)
        dstSets.send.add(dst)
        srcSets.receive.add(src)
        dstSets.receive.add(dst)
      }
      // buy_usdt: fiat -> USDT
      if (dst === "USDT" && src !== "USDT") {
        srcSets.buy_usdt.add(src)
        dstSets.buy_usdt.add(dst)
      }
      // sell_usdt: USDT -> VES
      if (src === "USDT" && dst === "VES") {
        srcSets.sell_usdt.add(src)
        dstSets.sell_usdt.add(dst)
      }
    }

    // Preferred order
    const order = ["USD", "EUR", "CLP", "MXN", "PEN", "BRL", "COP", "USDT", "VES"]
    const sortByOrder = (a: string, b: string) => order.indexOf(a) - order.indexOf(b)

    for (const m of Object.keys(srcSets) as OperationMode[]) {
      srcByMode[m] = [...srcSets[m]].sort(sortByOrder)
      dstByMode[m] = [...dstSets[m]].sort(sortByOrder)
    }

    return { sourceCurrenciesByMode: srcByMode, destCurrenciesByMode: dstByMode }
  }, [exchangeRates])

  const [mode, setMode] = useState<OperationMode>("send")
  const [amount, setAmount] = useState("")
  const [sourceCurrency, setSourceCurrency] = useState("USD")
  const [destCurrency, setDestCurrency] = useState("VES")
  const [result, setResult] = useState(0)
  const [currentRate, setCurrentRate] = useState(0)
  const [currentFee, setCurrentFee] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false)
  const [isDestDropdownOpen, setIsDestDropdownOpen] = useState(false)
  const [isMobileSourceModalOpen, setIsMobileSourceModalOpen] = useState(false)
  const [isMobileDestModalOpen, setIsMobileDestModalOpen] = useState(false)

  const sourceDropdownRef = useRef<HTMLDivElement>(null)
  const destDropdownRef = useRef<HTMLDivElement>(null)

  // Detect mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setIsSourceDropdownOpen(false)
      }
      if (destDropdownRef.current && !destDropdownRef.current.contains(event.target as Node)) {
        setIsDestDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update currencies when mode changes
  useEffect(() => {
    const srcCurrencies = sourceCurrenciesByMode[mode]
    const dstCurrencies = destCurrenciesByMode[mode]

    if (srcCurrencies.length > 0 && !srcCurrencies.includes(sourceCurrency)) {
      setSourceCurrency(srcCurrencies[0])
    }
    if (dstCurrencies.length > 0 && !dstCurrencies.includes(destCurrency)) {
      setDestCurrency(dstCurrencies[0])
    }
  }, [mode, sourceCurrenciesByMode, destCurrenciesByMode])

  // Calculate result
  useEffect(() => {
    const inputAmount = Number.parseFloat(amount) || 0
    const pairKey = `${sourceCurrency}-${destCurrency}`
    const pair = exchangeRates[pairKey]

    if (pair && inputAmount > 0) {
      const amountAfterFee = inputAmount * (1 - pair.fee)
      setResult(amountAfterFee * pair.rate)
      setCurrentRate(pair.rate)
      setCurrentFee(pair.fee * 100)
    } else {
      setResult(0)
      setCurrentRate(0)
      setCurrentFee(0)
    }
  }, [amount, sourceCurrency, destCurrency, exchangeRates])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  const handleStartOperation = () => {
    if (result === 0) return

    setOperationMode(mode)

    setQuote({
      amount: Number.parseFloat(amount),
      currency: destCurrency === "USDT" ? "usdt" : "bolivares",
      result,
      sourceCurrency,
      destinationCurrency: destCurrency,
      rate: currentRate,
      fee: currentFee,
    })

    setCurrentStep("terms")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleStartOperation()
    }
  }

  const getTextSize = (value: number) => {
    const formattedValue = value.toFixed(2)
    const digitCount = formattedValue.length
    if (digitCount <= 6) return "text-2xl md:text-3xl"
    if (digitCount <= 8) return "text-xl md:text-2xl"
    if (digitCount <= 10) return "text-lg md:text-xl"
    return "text-base md:text-lg"
  }

  const config = modeConfig[mode]
  const availableSourceCurrencies = sourceCurrenciesByMode[mode]
  const availableDestCurrencies = destCurrenciesByMode[mode]

  // Check if current mode has available pairs
  const modeHasPairs = availableSourceCurrencies.length > 0 && availableDestCurrencies.length > 0

  const renderCurrencySelector = (
    type: "source" | "dest",
    currentValue: string,
    availableCurrenciesList: string[],
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    onSelect: (code: string) => void,
    dropdownRef: React.RefObject<HTMLDivElement | null>,
    isMobileModalOpen: boolean,
    setIsMobileModalOpen: (open: boolean) => void
  ) => {
    const currency = currencies[currentValue]

    return (
      <div className="relative overflow-visible" ref={dropdownRef}>
        <button
          onClick={() => isMobile ? setIsMobileModalOpen(true) : setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          disabled={availableCurrenciesList.length <= 1}
        >
          <span className="text-lg">{currency?.symbol}</span>
          <span>{currentValue}</span>
          {availableCurrenciesList.length > 1 && (
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          )}
        </button>

        {/* Desktop dropdown */}
        {!isMobile && isOpen && availableCurrenciesList.length > 1 && (
          <div className="absolute top-full right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-[9999] min-w-[200px] overflow-visible">
            {availableCurrenciesList.map((code) => {
              const curr = currencies[code]
              return (
                <button
                  key={code}
                  onClick={() => { onSelect(code); setIsOpen(false) }}
                  className={`w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 transition-colors ${
                    currentValue === code ? "bg-secondary" : ""
                  }`}
                >
                  <span className="text-xl">{curr?.symbol}</span>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{code}</div>
                    <div className="text-xs text-muted-foreground">{curr?.country}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Mobile/Tablet dropdown */}
        {isMobile && isOpen && availableCurrenciesList.length > 1 && (
          <div className="absolute top-full right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-[9999] max-w-[90vw] max-h-[60vh] overflow-y-auto">
            {availableCurrenciesList.map((code) => {
              const curr = currencies[code]
              return (
                <button
                  key={code}
                  onClick={() => { onSelect(code); setIsOpen(false) }}
                  className={`w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 transition-colors text-sm ${
                    currentValue === code ? "bg-secondary" : ""
                  }`}
                >
                  <span className="text-base">{curr?.symbol}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{code}</div>
                    <div className="text-xs text-muted-foreground truncate">{curr?.country}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Mode Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {(Object.keys(modeConfig) as OperationMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              mode === m
                ? "bg-background text-primary shadow-lg"
                : "bg-white/20 text-white/90 hover:bg-white/30"
            }`}
          >
            {modeConfig[m].icon}
            <span className="hidden sm:inline">{modeConfig[m].label}</span>
            <span className="sm:hidden">{modeConfig[m].label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Calculator Card */}
      <div className="bg-background rounded-2xl p-6 md:p-8 shadow-2xl">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando tasas...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-destructive">Error al cargar las tasas. Intenta recargar la pagina.</p>
          </div>
        )}

        {/* No pairs for this mode */}
        {!isLoading && !error && !modeHasPairs && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Este servicio no esta disponible en este momento.</p>
          </div>
        )}

        {/* Calculator */}
        {!isLoading && !error && modeHasPairs && (
          <>
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              {/* Source Amount */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {config.sourceLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={handleAmountChange}
                    onKeyDown={handleKeyDown}
                    className="w-full text-2xl md:text-3xl font-bold p-4 pr-28 border-2 border-border rounded-xl focus:border-primary focus:outline-none bg-background"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {renderCurrencySelector(
                      "source",
                      sourceCurrency,
                      availableSourceCurrencies,
                      isSourceDropdownOpen,
                      setIsSourceDropdownOpen,
                      setSourceCurrency,
                      sourceDropdownRef,
                      isMobileSourceModalOpen,
                      setIsMobileSourceModalOpen
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center lg:pt-8">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
              </div>

              {/* Destination Amount */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {config.destLabel}
                </label>
                <div className="relative">
                  <div className="w-full min-h-[72px] border-2 border-border rounded-xl bg-muted p-4 pr-28 flex items-center">
                    <span className={`${getTextSize(result)} font-bold text-foreground`}>
                      {result.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {renderCurrencySelector(
                      "dest",
                      destCurrency,
                      availableDestCurrencies,
                      isDestDropdownOpen,
                      setIsDestDropdownOpen,
                      setDestCurrency,
                      destDropdownRef,
                      isMobileDestModalOpen,
                      setIsMobileDestModalOpen
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="lg:pt-8">
                <Button
                  onClick={handleStartOperation}
                  disabled={result === 0}
                  size="lg"
                  className="w-full lg:w-auto h-[72px] px-8 text-lg font-semibold bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl disabled:opacity-50"
                >
                  {config.ctaLabel}
                </Button>
              </div>
            </div>

            {/* Rate Info */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                {currentRate > 0 && (
                  <>
                    <span>
                      {"Tasa: "}
                      <span className="font-semibold text-foreground">
                        {"1 "}{sourceCurrency}{" = "}{currentRate.toLocaleString()}{" "}{destCurrency}
                      </span>
                    </span>
                    <span className="hidden sm:inline text-border">|</span>
                    <span>
                      {"Comision: "}
                      <span className="font-semibold text-foreground">{currentFee.toFixed(1)}%</span>
                      {" incluida"}
                    </span>
                  </>
                )}
                {currentRate === 0 && (
                  <span>Ingresa un monto para ver la cotizacion</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Modals */}
      {isMobile && isMobileSourceModalOpen && (
        <CurrencyModal
          title="Selecciona moneda de origen"
          currencies={availableSourceCurrencies}
          currentValue={sourceCurrency}
          onSelect={(code) => { setSourceCurrency(code); setIsMobileSourceModalOpen(false) }}
          onClose={() => setIsMobileSourceModalOpen(false)}
        />
      )}

      {isMobile && isMobileDestModalOpen && (
        <CurrencyModal
          title="Selecciona moneda de destino"
          currencies={availableDestCurrencies}
          currentValue={destCurrency}
          onSelect={(code) => { setDestCurrency(code); setIsMobileDestModalOpen(false) }}
          onClose={() => setIsMobileDestModalOpen(false)}
        />
      )}
    </div>
  )
}

// Modal Component for Mobile
function CurrencyModal({
  title,
  currencies: currencyCodes,
  currentValue,
  onSelect,
  onClose
}: {
  title: string
  currencies: string[]
  currentValue: string
  onSelect: (code: string) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            {currencyCodes.map((code) => {
              const curr = currencies[code]
              return (
                <button
                  key={code}
                  onClick={() => onSelect(code)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    currentValue === code
                      ? "border-primary bg-secondary"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                    {curr?.symbol}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-foreground">{code}</div>
                    <div className="text-sm text-muted-foreground">{curr?.country}</div>
                  </div>
                  {currentValue === code && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
