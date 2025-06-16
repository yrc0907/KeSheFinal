"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { SystemProvider } from "@/context/SystemContext"
import { ColorSchemeProvider } from "@/context/ColorSchemeContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <SystemProvider>
          <ColorSchemeProvider>
            {children}
          </ColorSchemeProvider>
        </SystemProvider>
      </SessionProvider>
    </ThemeProvider>
  )
} 