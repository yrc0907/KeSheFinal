"use client"

import React, { createContext, useState, useContext, useEffect } from "react"

// Define the system types
export type SystemType = "rental" | "book" | "teacher"

// Define the system context type
interface SystemContextType {
  system: SystemType
  setSystem: (system: SystemType) => void
  systemName: string
}

// Create the context
const SystemContext = createContext<SystemContextType>({
  system: "rental",
  setSystem: () => { },
  systemName: "房屋租赁系统"
})

// Create a provider component
export function SystemProvider({ children }: { children: React.ReactNode }) {
  // Function to get initial state from localStorage
  const getInitialState = (): SystemType => {
    // Check if running on the client
    if (typeof window !== "undefined") {
      const savedSystem = localStorage.getItem("selectedSystem") as SystemType | null
      if (savedSystem && ["rental", "book", "teacher"].includes(savedSystem)) {
        return savedSystem
      }
    }
    // Default to rental system if not set or on server
    return "rental"
  }

  const [system, setSystemState] = useState<SystemType>(getInitialState)

  // Save system to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("selectedSystem", system)
  }, [system])

  const setSystem = (newSystem: SystemType) => {
    setSystemState(newSystem)
  }

  // Get the display name for the current system
  const systemName = {
    rental: "房屋租赁系统",
    book: "图书管理系统",
    teacher: "教师管理系统"
  }[system]

  return (
    <SystemContext.Provider value={{ system, setSystem, systemName }}>
      {children}
    </SystemContext.Provider>
  )
}

// Create a hook for using the system context
export function useSystem() {
  return useContext(SystemContext)
} 