"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSystem, SystemType } from "@/context/SystemContext"
import { BookOpen, Users, Home } from "lucide-react"

export default function SystemSelectPage() {
  const { system, setSystem } = useSystem()
  const router = useRouter()

  const handleSystemSelect = (selectedSystem: SystemType) => {
    setSystem(selectedSystem)
    setTimeout(() => {
      router.push("/")
    }, 300)
  }

  const systems = [
    {
      key: "rental" as SystemType,
      icon: Home,
      title: "房屋租赁系统",
      description: "管理房屋租赁信息、发布和查询租赁信息",
      content: "用于发布、管理和查找可用的房屋租赁信息。包含房源管理、租赁申请和社区论坛功能。",
    },
    {
      key: "book" as SystemType,
      icon: BookOpen,
      title: "图书管理系统",
      description: "管理图书信息、借阅和归还流程",
      content: "用于管理图书馆藏信息、借阅记录和用户借阅权限。包含图书查询、借阅管理和用户评论功能。",
    },
    {
      key: "teacher" as SystemType,
      icon: Users,
      title: "教师管理系统",
      description: "管理教师信息、课程和评价",
      content: "用于管理教师基本信息、授课安排和教学评价。包含教师档案、课程安排和学生评价功能。",
    },
  ]

  return (
    <div className="container mx-auto py-20">
      <h1 className="text-4xl font-extrabold tracking-tight text-center mb-10">
        请选择一个管理系统
      </h1>

      {system && (
        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-2">
            当前选择的系统: <span className="font-medium text-foreground">{
              systems.find(s => s.key === system)?.title
            }</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {systems.map(({ key, icon: Icon, title, description, content }) => (
          <Card key={key} className={`hover:shadow-lg transition-shadow ${system === key ? "ring-2 ring-primary" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-6 w-6" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{content}</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleSystemSelect(key)}
                variant={system === key ? "secondary" : "default"}
              >
                {system === key ? "已选择" : "选择此系统"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button variant="outline" onClick={() => router.push("/")}>
          返回首页
        </Button>
      </div>
    </div>
  )
} 