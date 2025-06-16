"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSystem, SystemType } from "@/context/SystemContext"
import { BookOpen, Users, Home } from "lucide-react"

export default function SystemSelectPage() {
  const { system, setSystem } = useSystem()
  const router = useRouter()

  // 处理系统选择
  const handleSystemSelect = (selectedSystem: SystemType) => {
    setSystem(selectedSystem)
    router.push("/")
  }

  return (
    <div className="container mx-auto py-20">
      <h1 className="text-4xl font-extrabold tracking-tight text-center mb-10">
        请选择一个管理系统
      </h1>

      {system && (
        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-2">
            当前选择的系统: <span className="font-medium text-foreground">{
              system === "rental" ? "房屋租赁系统" :
                system === "book" ? "图书管理系统" :
                  "教师管理系统"
            }</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`hover:shadow-lg transition-shadow ${system === "rental" ? "ring-2 ring-primary" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-6 w-6" />
              房屋租赁系统
            </CardTitle>
            <CardDescription>管理房屋租赁信息、发布和查询租赁信息</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              用于发布、管理和查找可用的房屋租赁信息。包含房源管理、租赁申请和社区论坛功能。
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleSystemSelect("rental")}
              variant={system === "rental" ? "secondary" : "default"}
            >
              {system === "rental" ? "已选择" : "选择此系统"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${system === "book" ? "ring-2 ring-primary" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              图书管理系统
            </CardTitle>
            <CardDescription>管理图书信息、借阅和归还流程</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              用于管理图书馆藏信息、借阅记录和用户借阅权限。包含图书查询、借阅管理和用户评论功能。
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleSystemSelect("book")}
              variant={system === "book" ? "secondary" : "default"}
            >
              {system === "book" ? "已选择" : "选择此系统"}
            </Button>
          </CardFooter>
        </Card>

        <Card className={`hover:shadow-lg transition-shadow ${system === "teacher" ? "ring-2 ring-primary" : ""}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              教师管理系统
            </CardTitle>
            <CardDescription>管理教师信息、课程和评价</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              用于管理教师基本信息、授课安排和教学评价。包含教师档案、课程安排和学生评价功能。
            </p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleSystemSelect("teacher")}
              variant={system === "teacher" ? "secondary" : "default"}
            >
              {system === "teacher" ? "已选择" : "选择此系统"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <Button variant="outline" onClick={() => router.push("/")}>
          返回首页
        </Button>
      </div>
    </div>
  )
} 