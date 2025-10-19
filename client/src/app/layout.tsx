import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { RecommendationsProvider } from "@/contexts/recommendations-context"
import { UserDataProvider } from "@/contexts/user-data-context"
import { Toaster } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Affinity - Where Minds Meet",
  description: "AI-powered intellectual matchmaking platform for developers and tech enthusiasts",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <UserDataProvider>
            <RecommendationsProvider>
              {children}
              <Footer />
              <Toaster />
            </RecommendationsProvider>
          </UserDataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
