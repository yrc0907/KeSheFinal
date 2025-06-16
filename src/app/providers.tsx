"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { SystemProvider } from "@/context/SystemContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <SystemProvider>{children}</SystemProvider>
      </SessionProvider>
    </ThemeProvider>
  )
} 