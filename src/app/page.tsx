"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSystem } from "@/context/SystemContext"
import { useEffect } from "react"
import { systemContent } from "@/types/system"

export default function HomePage() {
  const router = useRouter()
  const { system, systemName, setSystem } = useSystem()

  // Check if system is selected
  useEffect(() => {
    const savedSystem = localStorage.getItem("selectedSystem")
    if (!savedSystem) {
      router.push("/system-select")
    }
  }, [router])

  // System specific content


  const content = systemContent[system]

  // 处理切换系统按钮点击
  const handleSwitchSystem = () => {
    // Simply navigate to the selection page without resetting the state.
    router.push("/system-select")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <header className="mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
            {content.title}
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </header>
        <div className="space-x-4">
          <Button size="lg" onClick={() => router.push(content.primaryButton.link)}>
            {content.primaryButton.text}
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push(content.secondaryButton.link)}>
            {content.secondaryButton.text}
          </Button>
        </div>

        <Button
          className="mt-6"
          variant="link"
          onClick={handleSwitchSystem}
        >
          切换系统
        </Button>
      </div>

      {/* 自定义面板布局区域 */}
      <div className="mb-20">

      </div>
    </div>
  )
}
