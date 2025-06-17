"use client"

import React, { useState } from "react"
import { useLayout, PanelItem } from "@/context/LayoutContext"
import DraggablePanel from "@/components/DraggablePanel"
import { Button } from "@/components/ui/button"
import {
  Pencil,
  Save,
  RefreshCcw,
  Settings,
  PlusCircle,
  LayoutGrid,
  Eye,
  EyeOff
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

export function PanelLayoutEditor() {
  const {
    panels,
    updatePanelOrder,
    isEditMode,
    toggleEditMode,
    resetLayout,
    togglePanelVisibility
  } = useLayout()

  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null)

  // 开始拖拽时保存被拖拽的面板ID
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, panelId: string) => {
    setDraggedPanelId(panelId)
  }

  // 允许放置
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // 处理放置，交换两个面板的位置
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPanelId: string) => {
    e.preventDefault()

    if (!draggedPanelId || draggedPanelId === targetPanelId) return

    const updatedPanels = [...panels]
    const draggedPanel = updatedPanels.find(p => p.id === draggedPanelId)
    const targetPanel = updatedPanels.find(p => p.id === targetPanelId)

    if (draggedPanel && targetPanel) {
      // 交换两个面板的顺序
      const draggedOrder = draggedPanel.order
      draggedPanel.order = targetPanel.order
      targetPanel.order = draggedOrder

      // 更新面板顺序
      updatePanelOrder(updatedPanels.sort((a, b) => a.order - b.order))
    }

    setDraggedPanelId(null)
  }

  // 将面板分组到不同的区域
  const leftPanels = panels.filter(p => p.position === "left").sort((a, b) => a.order - b.order)
  const centerPanels = panels.filter(p => p.position === "center" || !p.position).sort((a, b) => a.order - b.order)
  const rightPanels = panels.filter(p => p.position === "right").sort((a, b) => a.order - b.order)

  // 隐藏的面板
  const hiddenPanels = panels.filter(p => !p.visible)

  return (
    <div>
      {/* 编辑控制栏 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">仪表盘</h2>
        <div className="flex gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            onClick={toggleEditMode}
            className="flex gap-2 items-center"
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4" />
                <span>完成编辑</span>
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                <span>编辑布局</span>
              </>
            )}
          </Button>

          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={resetLayout}
                className="flex gap-2 items-center"
              >
                <RefreshCcw className="h-4 w-4" />
                <span>重置布局</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex gap-2 items-center"
                  >
                    <Settings className="h-4 w-4" />
                    <span>面板管理</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>显示/隐藏面板</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {panels.map((panel) => (
                    <DropdownMenuItem
                      key={panel.id}
                      onClick={() => togglePanelVisibility(panel.id)}
                      className="flex justify-between"
                    >
                      <span>{panel.title}</span>
                      {panel.visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {isEditMode && (
        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>编辑模式：</strong>拖拽面板调整顺序，使用面板上的控制按钮调整大小和位置。
          </p>
          {hiddenPanels.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              <strong>隐藏面板：</strong>{hiddenPanels.map(p => p.title).join('、')}（通过面板管理可恢复）
            </p>
          )}
        </div>
      )}

      {/* 面板区域 - 三列布局 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 左侧区域 */}
        <div className="grid grid-cols-1 gap-4 auto-rows-min md:col-span-1">
          {leftPanels.map((panel) => (
            <DraggablePanel
              key={panel.id}
              panel={panel}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* 中央区域 */}
        <div className="grid grid-cols-1 gap-4 auto-rows-min md:col-span-1">
          {centerPanels.map((panel) => (
            <DraggablePanel
              key={panel.id}
              panel={panel}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* 右侧区域 */}
        <div className="grid grid-cols-1 gap-4 auto-rows-min md:col-span-1">
          {rightPanels.map((panel) => (
            <DraggablePanel
              key={panel.id}
              panel={panel}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 