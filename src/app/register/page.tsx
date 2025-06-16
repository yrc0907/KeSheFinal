"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSystem } from "@/context/SystemContext"
import { systems } from "@/config/systems"

export default function RegisterPage() {
  const router = useRouter()
  const { system } = useSystem()
  const [formData, setFormData] = useState<Record<string, string>>({})

  // Redirect to system selection if no system is selected
  useEffect(() => {
    const savedSystem = localStorage.getItem("selectedSystem")
    if (!savedSystem) {
      router.push("/system-select")
    } else {
      // Initialize form data based on system fields
      const initialData: Record<string, string> = {}
      systems[system as keyof typeof systems].register.fields.forEach(field => {
        initialData[field.id] = ""
      })
      setFormData(initialData)
    }
  }, [router, system])

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleRegister = async () => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...formData, systemType: system }),
    })

    if (response.ok) {
      router.push("/login")
    } else {
      // Handle error
      console.error("Failed to register")
    }
  }

  // Get the configuration for the current system
  const systemConfig = systems[system as keyof typeof systems]

  if (!systemConfig) {
    return null  // Or a loading state
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{systemConfig.register.title}</CardTitle>
          <CardDescription>
            {systemConfig.register.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            {systemConfig.register.fields.map((field) => (
              <div key={field.id} className="flex flex-col space-y-1.5">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/login")}>
            {systemConfig.register.backButton}
          </Button>
          <Button onClick={handleRegister}>{systemConfig.register.submitButton}</Button>
        </CardFooter>
      </Card>
    </div>
  )
} 