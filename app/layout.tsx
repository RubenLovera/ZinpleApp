import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import Script from "next/script"
import { EmailWebhooksInitializer } from "@/components/EmailWebhooksInitializer"
import "./globals.css"

const montserrat = Montserrat({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZinpleApp - Cambia tu Zelle por USDT o Bolívares",
  description: "La forma más rápida y segura de convertir tus dólares Zelle a criptomonedas o bolívares venezolanos",
  icons: {
    icon: "/favicon.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-QK45FR1ZV0" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QK45FR1ZV0');
          `}
        </Script>
      </head>
      <body className={montserrat.className}>
        <EmailWebhooksInitializer />
        {children}
      </body>
    </html>
  )
}
