"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSystem } from "@/context/SystemContext"
import { useEffect, useState } from "react"
import { systemContent } from "@/types/system"
import { Textarea } from "@/components/ui/textarea"

export default function HomePage() {
  const router = useRouter()
  const { system } = useSystem()
  const [isMounted, setIsMounted] = useState(false)
  const [showLayoutInput, setShowLayoutInput] = useState(false)
  const [layoutQuery, setLayoutQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedSystem = localStorage.getItem("selectedSystem")
    if (!savedSystem) {
      router.push("/system-select")
    }
  }, [router])

  if (!isMounted) {
    return null
  }

  const content = systemContent[system]

  const handleGenerateLayout = async () => {
    if (!layoutQuery) {
      alert("请输入你的想法！")
      return
    }
    setIsGenerating(true)
    try {
      const response = await fetch("/api/design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: layoutQuery, filePath: "src/app/page.tsx" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate layout")
      }

      alert("布局已更新！页面将刷新以应用更改。")
      window.location.reload()
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        alert(`发生错误: ${error.message}`)
      } else {
        alert("发生未知错误")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSwitchSystem = () => {
    router.push("/system-select")
  }

  return (
    <div className="flex">
      <nav className="flex flex-col w-64 bg-gray-800 text-white h-screen p-6 fixed">
        <h1 className="text-2xl font-bold mb-8">{content.title}</h1>
        <div className="flex flex-col space-y-2">
          <Button variant="link" onClick={() => router.push(content.primaryButton.link)} className="text-white">
            {content.primaryButton.text}
          </Button>
          <Button variant="link" onClick={() => router.push(content.secondaryButton.link)} className="text-white">
            {content.secondaryButton.text}
          </Button>
        </div>
        <div className="mt-auto">
          <Button variant="link" onClick={handleSwitchSystem} className="text-white">
            切换系统
          </Button>
        </div>
      </nav>

      <main className="ml-64 bg-gray-100 flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-700">欢迎回来！</h2>
          <Button variant="outline" onClick={() => setShowLayoutInput(!showLayoutInput)}>
            ✨ 使用 AI 修改布局
          </Button>
        </div>

        {showLayoutInput && (
          <div className="mt-4 w-full max-w-lg flex flex-col items-center gap-4 p-6 border rounded-lg shadow-md bg-white">
            <p className="text-gray-600 text-center">
              描述一下你想要的页面布局，比如："将主按钮和次要按钮水平排列，并在下方添加一个三列的卡片区域。"
            </p>
            <Textarea
              value={layoutQuery}
              onChange={(e) => setLayoutQuery(e.target.value)}
              placeholder="例如：将页面标题放大，按钮居中..."
              className="w-full p-3 border rounded-lg h-32"
            />
            <Button onClick={handleGenerateLayout} disabled={isGenerating} className="w-full">
              {isGenerating ? "生成中..." : "生成新布局"}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold">数据分析</h3>
            <p className="text-gray-600">这是数据分析的描述</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold">用户管理</h3>
            <p className="text-gray-600">这是用户管理的描述</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-bold">系统设置</h3>
            <p className="text-gray-600">这是系统设置的描述</p>
          </div>
        </div>
      </main>
    </div>
  )
}