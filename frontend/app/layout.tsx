import type React from "react"
import type { Metadata } from "next"
import { Inter, Sora, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/hooks/use-auth"
import { CartProvider } from "@/hooks/use-cart"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kola - Empowering African Entrepreneurs",
  description: "Discover unique products and support African entrepreneurs on Kola marketplace",
  keywords: ["African entrepreneurs", "marketplace", "handmade", "crafts", "fashion", "art"],
  authors: [{ name: "Kola Team" }],
  creator: "Kola",
  publisher: "Kola",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} font-body antialiased dark`}>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="dark" 
              enableSystem 
              disableTransitionOnChange
            >
              <div className="relative flex min-h-screen flex-col">
                <Navigation />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
