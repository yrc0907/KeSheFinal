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
import { signIn } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSystem } from "@/context/SystemContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { system, systemName } = useSystem()

  // Redirect to system selection if no system is selected
  useEffect(() => {
    const savedSystem = localStorage.getItem("selectedSystem")
    if (!savedSystem) {
      router.push("/system-select")
    }
  }, [router])

  // System-specific content
  const systemContent = {
    rental: {
      title: "登录",
      description: "输入您的凭据以登录租房系统。",
      registerButtonText: "注册",
      loginButtonText: "登录",
    },
    book: {
      title: "图书管理系统登录",
      description: "输入您的凭据以登录图书管理系统。",
      registerButtonText: "注册新账号",
      loginButtonText: "登录系统",
    },
    teacher: {
      title: "教师管理系统登录",
      description: "输入您的凭据以登录教师管理系统。",
      registerButtonText: "注册新账号",
      loginButtonText: "登录系统",
    },
  }

  const content = systemContent[system]

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        systemType: system, // Pass the system type to the sign in function
      })

      if (result?.ok) {
        router.push("/dashboard")
        router.refresh() // Force a refresh to get the new session state
      } else {
        setError("登录失败，请检查您的邮箱和密码。")
        console.error("Login failed:", result)
        setIsLoading(false)
      }
    } catch (e) {
      console.error("An exception occurred during login:", e)
      setError("登录时发生意外错误。")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
          <CardDescription>
            {content.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/register")} disabled={isLoading}>
            {content.registerButtonText}
          </Button>
          <Button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "登录中..." : content.loginButtonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 