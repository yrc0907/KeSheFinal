"use client"

import React, { createContext, useState, useContext, useEffect } from "react"

// 定义页面元素类型
export interface PageElement {
  id: string;
  selector: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  originalPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 定义页面布局类型
export interface PageLayout {
  pageId: string;
  elements: PageElement[];
}

// 定义页面编辑器上下文类型
interface PageEditorContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  currentPageId: string | null;
  setCurrentPageId: (pageId: string) => void;
  pageLayouts: Record<string, PageLayout>;
  saveLayout: (pageId: string, elements: PageElement[]) => void;
  resetLayout: (pageId: string) => void;
  updateElementPosition: (pageId: string, elementId: string, x: number, y: number, width?: number, height?: number) => void;
  detectPageElements: () => void;
}

// 创建上下文
const PageEditorContext = createContext<PageEditorContextType>({
  isEditMode: false,
  toggleEditMode: () => { },
  currentPageId: null,
  setCurrentPageId: () => { },
  pageLayouts: {},
  saveLayout: () => { },
  resetLayout: () => { },
  updateElementPosition: () => { },
  detectPageElements: () => { },
});

// 创建 Provider 组件
export function PageEditorProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [pageLayouts, setPageLayouts] = useState<Record<string, PageLayout>>({});

  // 从本地存储加载页面布局
  useEffect(() => {
    try {
      const savedLayouts = localStorage.getItem("pageLayouts");
      if (savedLayouts) {
        setPageLayouts(JSON.parse(savedLayouts));
      }
    } catch (e) {
      console.error("Failed to load page layouts:", e);
    }
  }, []);

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditMode(prev => !prev);

    // 如果退出编辑模式，应用当前布局
    if (isEditMode && currentPageId && pageLayouts[currentPageId]) {
      applyLayout(currentPageId);
    }
  };

  // 保存页面布局
  const saveLayout = (pageId: string, elements: PageElement[]) => {
    const updatedLayouts = {
      ...pageLayouts,
      [pageId]: {
        pageId,
        elements,
      },
    };

    setPageLayouts(updatedLayouts);

    try {
      localStorage.setItem("pageLayouts", JSON.stringify(updatedLayouts));
    } catch (e) {
      console.error("Failed to save page layout:", e);
    }
  };

  // 重置页面布局
  const resetLayout = (pageId: string) => {
    if (pageLayouts[pageId]) {
      // 恢复原始位置
      const elements = pageLayouts[pageId].elements.map(element => ({
        ...element,
        x: element.originalPosition.x,
        y: element.originalPosition.y,
        width: element.originalPosition.width,
        height: element.originalPosition.height,
      }));

      saveLayout(pageId, elements);

      // 应用重置的布局
      applyLayout(pageId);
    }
  };

  // 更新元素位置
  const updateElementPosition = (
    pageId: string,
    elementId: string,
    x: number,
    y: number,
    width?: number,
    height?: number
  ) => {
    if (!pageLayouts[pageId]) return;

    const updatedElements = pageLayouts[pageId].elements.map(element => {
      if (element.id === elementId) {
        return {
          ...element,
          x,
          y,
          width: width || element.width,
          height: height || element.height,
        };
      }
      return element;
    });

    saveLayout(pageId, updatedElements);
  };

  // 应用布局到DOM
  const applyLayout = (pageId: string) => {
    if (!pageLayouts[pageId]) return;

    pageLayouts[pageId].elements.forEach(element => {
      const domElement = document.querySelector(element.selector);
      if (domElement && domElement instanceof HTMLElement) {
        domElement.style.position = "relative";
        domElement.style.left = `${element.x}px`;
        domElement.style.top = `${element.y}px`;
        if (element.width) domElement.style.width = `${element.width}px`;
        if (element.height) domElement.style.height = `${element.height}px`;
      }
    });
  };

  // 检测页面元素
  const detectPageElements = () => {
    if (!currentPageId) return;

    // 定义可拖拽元素的选择器
    const selectors = [
      ".card",
      "main > div",
      "section",
      ".grid > div",
      "aside",
      "header"
    ];

    const elements: PageElement[] = [];

    selectors.forEach((selector, index) => {
      document.querySelectorAll(selector).forEach((element, elementIndex) => {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const id = `${selector.replace(/[^a-zA-Z0-9]/g, '')}-${elementIndex}`;

          elements.push({
            id,
            selector: `${selector}:nth-of-type(${elementIndex + 1})`,
            type: element.tagName.toLowerCase(),
            label: element.innerText?.substring(0, 20) || `Element ${index}-${elementIndex}`,
            x: 0,
            y: 0,
            width: rect.width,
            height: rect.height,
            originalPosition: {
              x: 0,
              y: 0,
              width: rect.width,
              height: rect.height,
            },
          });
        }
      });
    });

    // 如果是新页面，保存检测到的元素
    if (!pageLayouts[currentPageId]) {
      saveLayout(currentPageId, elements);
    }
  };

  return (
    <PageEditorContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        currentPageId,
        setCurrentPageId,
        pageLayouts,
        saveLayout,
        resetLayout,
        updateElementPosition,
        detectPageElements,
      }}
    >
      {children}
    </PageEditorContext.Provider>
  );
}

// 创建使用页面编辑器上下文的钩子
export function usePageEditor() {
  return useContext(PageEditorContext);
} 