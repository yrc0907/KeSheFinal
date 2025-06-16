"use client"

import React, { useEffect, useState } from "react"
import { usePageEditor } from "@/context/PageEditorContext"
import { DraggableElement } from "@/components/DraggableElement"

interface PageEditorWrapperProps {
  children: React.ReactNode;
}

export function PageEditorWrapper({ children }: PageEditorWrapperProps) {
  const { isEditMode, currentPageId, pageLayouts } = usePageEditor();
  const [elements, setElements] = useState<React.ReactNode[]>([]);

  // 当编辑模式或页面ID变化时，重新渲染元素
  useEffect(() => {
    if (!isEditMode || !currentPageId || !pageLayouts[currentPageId]) {
      setElements([]);
      return;
    }

    // 获取当前页面的布局元素
    const pageElements = pageLayouts[currentPageId].elements;

    // 延迟执行，确保页面已完全加载
    const timer = setTimeout(() => {
      const wrappedElements: React.ReactNode[] = [];

      pageElements.forEach(element => {
        try {
          const domElement = document.querySelector(element.selector);

          if (domElement && domElement instanceof HTMLElement) {
            // 创建一个包装元素的标记，用于后续处理
            domElement.setAttribute('data-page-element-id', element.id);

            // 添加元素到列表
            // 注意：我们不能直接将DOM元素作为React子元素传递
            // 而是使用位置和尺寸信息来创建一个覆盖层
            const rect = domElement.getBoundingClientRect();
            wrappedElements.push(
              <div
                key={element.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${rect.left}px`,
                  top: `${rect.top}px`,
                  width: `${rect.width}px`,
                  height: `${rect.height}px`,
                  zIndex: 1000
                }}
              >
                <DraggableElement element={element}>
                  <div className="w-full h-full" />
                </DraggableElement>
              </div>
            );
          }
        } catch (error) {
          console.error(`Failed to process element ${element.id}:`, error);
        }
      });

      setElements(wrappedElements);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isEditMode, currentPageId, pageLayouts]);

  return (
    <>
      {children}
      {isEditMode && elements.length > 0 && (
        <div className="page-editor-elements">
          {elements}
        </div>
      )}
    </>
  );
} 