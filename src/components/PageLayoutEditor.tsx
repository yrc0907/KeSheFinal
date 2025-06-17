"use client"

import React, { useEffect } from "react"
import { usePageEditor } from "@/context/PageEditorContext"
import { Button } from "@/components/ui/button"
import {
  Pencil,
  Save,
  RefreshCcw,
  Eye
} from "lucide-react"
import { usePathname } from "next/navigation"

export function PageLayoutEditor() {
  const {
    isEditMode,
    toggleEditMode,
    currentPageId,
    setCurrentPageId,
    resetLayout,
    detectPageElements
  } = usePageEditor()

  const pathname = usePathname()

  // 当路径变化时，设置当前页面ID并检测页面元素
  useEffect(() => {
    if (pathname) {
      const pageId = pathname.replace(/^\//, '').replace(/\//g, '-') || 'home'
      setCurrentPageId(pageId)

      // 检测页面元素（延迟执行，确保页面已完全加载）
      const timer = setTimeout(() => {
        detectPageElements()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [pathname, setCurrentPageId, detectPageElements])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      <Button
        variant={isEditMode ? "default" : "outline"}
        size="sm"
        onClick={toggleEditMode}
        className="flex gap-2 items-center"
      >
        {isEditMode ? (
          <>
            <Save className="h-4 w-4" />
            <span>保存布局</span>
          </>
        ) : (
          <>
            <Pencil className="h-4 w-4" />
            <span>编辑布局</span>
          </>
        )}
      </Button>

      {isEditMode && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => resetLayout(currentPageId || '')}
          className="flex gap-2 items-center"
        >
          <RefreshCcw className="h-4 w-4" />
          <span>重置布局</span>
        </Button>
      )}

      {isEditMode && (
        <div className="bg-background border rounded-md shadow-md p-3 fixed bottom-16 right-4 w-64">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            编辑模式已启用
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            您可以拖动页面上带有蓝色虚线边框的元素来调整布局。
          </p>
          <p className="text-xs text-muted-foreground">
            拖动元素右下角的手柄可以调整元素大小。
          </p>
        </div>
      )}
    </div>
  )
} 