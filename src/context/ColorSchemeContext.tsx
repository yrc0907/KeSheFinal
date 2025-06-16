"use client"

import React, { createContext, useState, useContext, useEffect } from "react"

// Define the available color schemes
export type ColorScheme = "default" | "blue" | "green" | "purple" | "orange"

// Define the color scheme context type
interface ColorSchemeContextType {
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  // Map of color scheme names to display names
  schemeNames: Record<ColorScheme, string>
}

// Create the context with default values
const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: "default",
  setColorScheme: () => { },
  schemeNames: {
    default: "默认",
    blue: "蓝色",
    green: "绿色",
    purple: "紫色",
    orange: "橙色"
  }
})

// Create a provider component
export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  // Default to "default" scheme if not set
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>("default")

  // Load color scheme from localStorage if available (client-side only)
  useEffect(() => {
    try {
      const savedColorScheme = localStorage.getItem("selectedColorScheme") as ColorScheme | null
      if (savedColorScheme && ["default", "blue", "green", "purple", "orange"].includes(savedColorScheme)) {
        setColorSchemeState(savedColorScheme)
        document.documentElement.setAttribute("data-color-scheme", savedColorScheme)
      }
    } catch (e) {
      console.error("Failed to load color scheme from localStorage:", e)
    }
  }, [])

  // Save color scheme to localStorage and update the document attribute
  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme)
    try {
      localStorage.setItem("selectedColorScheme", newScheme)
      document.documentElement.setAttribute("data-color-scheme", newScheme)
    } catch (e) {
      console.error("Failed to save color scheme to localStorage:", e)
    }
  }

  // Map of scheme IDs to display names
  const schemeNames: Record<ColorScheme, string> = {
    default: "默认",
    blue: "蓝色",
    green: "绿色",
    purple: "紫色",
    orange: "橙色"
  }

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme, schemeNames }}>
      {children}
    </ColorSchemeContext.Provider>
  )
}

// Create a hook for using the color scheme context
export function useColorScheme() {
  return useContext(ColorSchemeContext)
} 