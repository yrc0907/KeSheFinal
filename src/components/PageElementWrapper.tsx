"use client"

import React, { useEffect, useState } from "react"
import { usePageEditor, PageElement } from "@/context/PageEditorContext"
import { DraggableElement } from "@/components/DraggableElement"

interface PageElementWrapperProps {
  selector: string;
  children: React.ReactNode;
}

export function PageElementWrapper({ selector, children }: PageElementWrapperProps) {
  const { isEditMode, currentPageId, pageLayouts } = usePageEditor();
  const [element, setElement] = useState<PageElement | null>(null);

  // 查找当前元素在布局中的配置
  useEffect(() => {
    if (!currentPageId || !pageLayouts[currentPageId]) return;

    const foundElement = pageLayouts[currentPageId].elements.find(
      el => el.selector === selector
    );

    if (foundElement) {
      setElement(foundElement);
    }
  }, [currentPageId, pageLayouts, selector]);

  if (!isEditMode || !element) {
    return <>{children}</>;
  }

  return (
    <DraggableElement element={element}>
      {children}
    </DraggableElement>
  );
} 