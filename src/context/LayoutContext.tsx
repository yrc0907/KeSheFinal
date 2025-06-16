"use client"

import React, { createContext, useState, useContext, useEffect } from "react"

// 定义面板类型
export interface PanelItem {
  id: string
  type: string
  title: string
  visible: boolean
  order: number
  size: "small" | "medium" | "large"
  position?: "left" | "center" | "right"
}

// 默认面板配置
export const defaultPanels: PanelItem[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "欢迎面板",
    visible: true,
    order: 0,
    size: "large",
    position: "center"
  },
  {
    id: "theme",
    type: "theme",
    title: "主题设置",
    visible: true,
    order: 1,
    size: "large",
    position: "center"
  },
  {
    id: "stats",
    type: "stats",
    title: "系统统计",
    visible: true,
    order: 2,
    size: "medium",
    position: "right"
  },
  {
    id: "quick_actions",
    type: "quick_actions",
    title: "快捷操作",
    visible: true,
    order: 3,
    size: "small",
    position: "left"
  }
]

// 定义布局上下文类型
interface LayoutContextType {
  panels: PanelItem[]
  updatePanelOrder: (updatedPanels: PanelItem[]) => void
  togglePanelVisibility: (panelId: string) => void
  resetLayout: () => void
  updatePanelSize: (panelId: string, size: "small" | "medium" | "large") => void
  updatePanelPosition: (panelId: string, position: "left" | "center" | "right") => void
  isEditMode: boolean
  toggleEditMode: () => void
}

// 创建上下文
const LayoutContext = createContext<LayoutContextType>({
  panels: defaultPanels,
  updatePanelOrder: () => { },
  togglePanelVisibility: () => { },
  resetLayout: () => { },
  updatePanelSize: () => { },
  updatePanelPosition: () => { },
  isEditMode: false,
  toggleEditMode: () => { }
})

// 创建 Provider 组件
export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [panels, setPanels] = useState<PanelItem[]>(defaultPanels)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)

  // 从本地存储加载面板布局
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem("panelLayout")
      if (savedLayout) {
        setPanels(JSON.parse(savedLayout))
      }
    } catch (e) {
      console.error("Failed to load panel layout:", e)
    }
  }, [])

  // 更新面板顺序
  const updatePanelOrder = (updatedPanels: PanelItem[]) => {
    setPanels(updatedPanels)
    try {
      localStorage.setItem("panelLayout", JSON.stringify(updatedPanels))
    } catch (e) {
      console.error("Failed to save panel layout:", e)
    }
  }

  // 切换面板可见性
  const togglePanelVisibility = (panelId: string) => {
    const updatedPanels = panels.map(panel =>
      panel.id === panelId
        ? { ...panel, visible: !panel.visible }
        : panel
    )
    setPanels(updatedPanels)
    try {
      localStorage.setItem("panelLayout", JSON.stringify(updatedPanels))
    } catch (e) {
      console.error("Failed to save panel visibility:", e)
    }
  }

  // 重置布局到默认状态
  const resetLayout = () => {
    setPanels(defaultPanels)
    try {
      localStorage.setItem("panelLayout", JSON.stringify(defaultPanels))
    } catch (e) {
      console.error("Failed to reset panel layout:", e)
    }
  }

  // 更新面板大小
  const updatePanelSize = (panelId: string, size: "small" | "medium" | "large") => {
    const updatedPanels = panels.map(panel =>
      panel.id === panelId
        ? { ...panel, size }
        : panel
    )
    setPanels(updatedPanels)
    try {
      localStorage.setItem("panelLayout", JSON.stringify(updatedPanels))
    } catch (e) {
      console.error("Failed to save panel size:", e)
    }
  }

  // 更新面板位置
  const updatePanelPosition = (panelId: string, position: "left" | "center" | "right") => {
    const updatedPanels = panels.map(panel =>
      panel.id === panelId
        ? { ...panel, position }
        : panel
    )
    setPanels(updatedPanels)
    try {
      localStorage.setItem("panelLayout", JSON.stringify(updatedPanels))
    } catch (e) {
      console.error("Failed to save panel position:", e)
    }
  }

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev)
  }

  return (
    <LayoutContext.Provider
      value={{
        panels,
        updatePanelOrder,
        togglePanelVisibility,
        resetLayout,
        updatePanelSize,
        updatePanelPosition,
        isEditMode,
        toggleEditMode
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

// 创建使用布局上下文的钩子
export function useLayout() {
  return useContext(LayoutContext)
} 