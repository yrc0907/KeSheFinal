"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { SystemProvider } from "@/context/SystemContext"
import { ColorSchemeProvider } from "@/context/ColorSchemeContext"
import { LayoutProvider } from "@/context/LayoutContext"
import { PageEditorProvider } from "@/context/PageEditorContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <SystemProvider>
          <ColorSchemeProvider>
            <LayoutProvider>
              <PageEditorProvider>
                {children}
              </PageEditorProvider>
            </LayoutProvider>
          </ColorSchemeProvider>
        </SystemProvider>
      </SessionProvider>
    </ThemeProvider>
  )
} 