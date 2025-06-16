"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSystem } from "@/context/SystemContext"
import { useEffect } from "react"
import { ThemePanel } from "@/components/ThemePanel"
import { PanelLayoutEditor } from "@/components/PanelLayoutEditor"

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
  const systemContent = {
    rental: {
      title: "欢迎来到房屋租赁平台",
      description: "在这里找到您理想的家。我们提供最新、最全的房源信息，助您轻松开启新生活。",
      primaryButton: {
        text: "开始浏览房源",
        link: "/houses"
      },
      secondaryButton: {
        text: "进入社区论坛",
        link: "/forum"
      }
    },
    book: {
      title: "欢迎来到图书管理系统",
      description: "查找、借阅和管理图书馆的藏书。我们提供高效、便捷的图书管理服务。",
      primaryButton: {
        text: "浏览书目",
        link: "/houses" // Reusing the houses route for books
      },
      secondaryButton: {
        text: "读者论坛",
        link: "/forum"
      }
    },
    teacher: {
      title: "欢迎来到教师管理系统",
      description: "管理和查询教师信息、课程安排和教学评价。为学校提供全面的教师资源管理。",
      primaryButton: {
        text: "浏览教师",
        link: "/houses" // Reusing the houses route for teachers
      },
      secondaryButton: {
        text: "教师论坛",
        link: "/forum"
      }
    }
  }

  const content = systemContent[system]

  // 处理切换系统按钮点击
  const handleSwitchSystem = () => {
    // 清除本地存储的系统选择
    localStorage.removeItem("selectedSystem")
    // 重置系统状态（可选，因为重定向后会重新加载）
    setSystem("rental")
    // 重定向到系统选择页面
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
        <PanelLayoutEditor />
      </div>
    </div>
  )
}
