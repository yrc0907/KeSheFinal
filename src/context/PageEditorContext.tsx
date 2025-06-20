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
  updateElementPosition: (pageId: string, elementId: string, dx: number, dy: number, width?: number, height?: number) => void;
  detectPageElements: (iframeDoc: Document) => void;
  applyLayout: (pageId: string, iframeDoc: Document, isDragEnd?: boolean) => void;
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
  applyLayout: () => { },
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
      // When exiting edit mode, we would ideally re-apply to the main document.
      // However, the context of where to apply (iframe vs main) is complex.
      // For now, the main save/apply logic is inside the editor itself.
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

      // We might need to re-apply layout to an iframe if it's active
      // This part is tricky as the context doesn't know about the iframe.
      // The calling component should handle applying the layout.
    }
  };

  // 更新元素位置 (handles deltas)
  const updateElementPosition = (
    pageId: string,
    elementId: string,
    dx: number,
    dy: number,
    width?: number,
    height?: number,
  ) => {
    if (!pageLayouts[pageId]) return;

    const updatedElements = pageLayouts[pageId].elements.map(element => {
      if (element.id === elementId) {
        const updatedElement = {
          ...element,
          x: element.x + dx,
          y: element.y + dy,
        };

        // Update width and height if provided
        if (width !== undefined) {
          updatedElement.width = width;
        }

        if (height !== undefined) {
          updatedElement.height = height;
        }

        return updatedElement;
      }
      return element;
    });

    setPageLayouts(prev => ({
      ...prev,
      [pageId]: { ...prev[pageId], elements: updatedElements },
    }))
    // Note: We don't save to localStorage on every move for performance.
    // Saving will happen on a dedicated action, like a "Save" button.
  };

  // 应用布局到DOM
  const applyLayout = (pageId: string, iframeDoc: Document, isDragEnd: boolean = false) => {
    if (!pageLayouts[pageId]) return;

    pageLayouts[pageId].elements.forEach(element => {
      const domElement = iframeDoc.querySelector(element.selector);
      if (domElement && domElement instanceof HTMLElement) {
        domElement.style.position = "relative";
        domElement.style.transform = `translate(${element.x}px, ${element.y}px)`;
        if (isDragEnd) {
          // Persist final position to localStorage after drag
          try {
            localStorage.setItem("pageLayouts", JSON.stringify(pageLayouts));
          } catch (e) {
            console.error("Failed to save page layout:", e);
          }
        }
      }
    });
  };

  // 检测页面元素
  const detectPageElements = (iframeDoc: Document) => {
    if (!currentPageId) return;

    // Do not re-detect if layout already exists
    if (pageLayouts[currentPageId]) {
      return;
    }

    // 定义可拖拽元素的选择器
    const selectors = [
      ".card",
      "main > div",
      "section",
      ".grid > div",
      "aside",
      "header",
      ".container > div",
      ".flex-col > div",
      "article",
      ".panel",
      "footer"
    ];

    const elements: PageElement[] = [];

    selectors.forEach((selector, index) => {
      iframeDoc.querySelectorAll(selector).forEach((element, elementIndex) => {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect();
          const id = `${selector.replace(/[^a-zA-Z0-9]/g, '')}-${elementIndex}`;

          elements.push({
            id,
            selector: `${selector}:nth-of-type(${elementIndex + 1})`,
            type: element.tagName.toLowerCase(),
            label: element.innerText?.substring(0, 20).trim() || `Element ${index}-${elementIndex}`,
            x: 0, // Initial relative position
            y: 0, // Initial relative position
            width: rect.width,
            height: rect.height,
            originalPosition: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
            },
          });
        }
      });
    });

    // 保存检测到的元素
    saveLayout(currentPageId, elements);
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
        applyLayout,
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