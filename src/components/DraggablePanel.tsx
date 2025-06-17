"use client"

import React, { useState } from "react"
import { useLayout, PanelItem } from "@/context/LayoutContext"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Grip,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemePanel } from "@/components/ThemePanel"

// 面板大小映射
const sizeClasses = {
  small: "col-span-1",
  medium: "col-span-2",
  large: "col-span-3"
}

// 根据面板类型返回对应的内容组件
const getPanelContent = (type: string) => {
  switch (type) {
    case "theme":
      return <ThemePanel />
    case "welcome":
      return (
        <div className="text-center py-4">
          <h3 className="text-2xl font-bold mb-4">欢迎使用管理系统</h3>
          <p className="text-muted-foreground">
            这是一个多功能管理系统，您可以根据需要自定义面板布局。
          </p>
        </div>
      )
    case "stats":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-md p-4 text-center">
              <p className="text-2xl font-bold">128</p>
              <p className="text-xs text-muted-foreground">总用户数</p>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <p className="text-2xl font-bold">28</p>
              <p className="text-xs text-muted-foreground">今日活跃</p>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <p className="text-2xl font-bold">64</p>
              <p className="text-xs text-muted-foreground">总记录数</p>
            </div>
            <div className="bg-muted rounded-md p-4 text-center">
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">新增记录</p>
            </div>
          </div>
        </div>
      )
    case "quick_actions":
      return (
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            创建记录
          </Button>
          <Button variant="outline" className="w-full justify-start">
            查看报告
          </Button>
          <Button variant="outline" className="w-full justify-start">
            用户管理
          </Button>
          <Button variant="outline" className="w-full justify-start">
            系统设置
          </Button>
        </div>
      )
    default:
      return <div>未知面板类型</div>
  }
}

interface DraggablePanelProps {
  panel: PanelItem
  onDragStart: (e: React.DragEvent<HTMLDivElement>, panelId: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: (e: React.DragEvent<HTMLDivElement>, panelId: string) => void
}

export default function DraggablePanel({ panel, onDragStart, onDragOver, onDrop }: DraggablePanelProps) {
  const { isEditMode, togglePanelVisibility, updatePanelSize, updatePanelPosition } = useLayout()
  const [isDragging, setIsDragging] = useState(false)

  // 当开始拖拽时设置状态
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true)
    onDragStart(e, panel.id)
  }

  // 当结束拖拽时重置状态
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // 循环切换面板大小
  const toggleSize = () => {
    const sizes: Array<"small" | "medium" | "large"> = ["small", "medium", "large"]
    const currentIndex = sizes.indexOf(panel.size)
    const nextSize = sizes[(currentIndex + 1) % sizes.length]
    updatePanelSize(panel.id, nextSize)
  }

  // 切换面板位置
  const movePosition = (direction: "left" | "right") => {
    const positions: Array<"left" | "center" | "right"> = ["left", "center", "right"]
    const currentPosition = panel.position || "center"
    const currentIndex = positions.indexOf(currentPosition)

    if (direction === "left" && currentIndex > 0) {
      updatePanelPosition(panel.id, positions[currentIndex - 1])
    } else if (direction === "right" && currentIndex < positions.length - 1) {
      updatePanelPosition(panel.id, positions[currentIndex + 1])
    }
  }

  if (!panel.visible) return null

  return (
    <div
      className={cn(
        "transition-all",
        sizeClasses[panel.size],
        isDragging ? "opacity-50" : "opacity-100"
      )}
      draggable={isEditMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, panel.id)}
    >
      <Card className="h-full">
        {isEditMode && (
          <div className="bg-muted/50 p-1 flex items-center justify-between border-b">
            <div className="flex items-center">
              <Grip className="h-4 w-4 cursor-move ml-1 mr-2 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">#{panel.order + 1}</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => movePosition("left")}
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => movePosition("right")}
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={toggleSize}
              >
                {panel.size === "large" ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => togglePanelVisibility(panel.id)}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        <CardHeader className="p-4">
          <CardTitle className="text-xl">{panel.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {getPanelContent(panel.type)}
        </CardContent>
      </Card>
    </div>
  )
} 