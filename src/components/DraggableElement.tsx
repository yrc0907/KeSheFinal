"use client"

import React, { useRef, useState, useEffect } from "react"
import { usePageEditor, PageElement } from "@/context/PageEditorContext"
import { Grip, Maximize } from "lucide-react"

interface DraggableElementProps {
  element: PageElement;
  children: React.ReactNode;
}

export function DraggableElement({ element, children }: DraggableElementProps) {
  const { isEditMode, currentPageId, updateElementPosition } = usePageEditor();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // 拖拽开始
  const handleDragStart = (e: React.MouseEvent) => {
    if (!isEditMode || !currentPageId) return;

    e.preventDefault();
    setIsDragging(true);

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 调整大小开始
  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isEditMode || !currentPageId) return;

    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const rect = elementRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      });
    }
  };

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!currentPageId) return;

      if (isDragging && elementRef.current) {
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;

        elementRef.current.style.left = `${x}px`;
        elementRef.current.style.top = `${y}px`;
      }

      if (isResizing && elementRef.current) {
        const deltaWidth = e.clientX - resizeStart.x;
        const deltaHeight = e.clientY - resizeStart.y;

        const newWidth = Math.max(100, resizeStart.width + deltaWidth);
        const newHeight = Math.max(50, resizeStart.height + deltaHeight);

        elementRef.current.style.width = `${newWidth}px`;
        elementRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = () => {
      if (isDragging && elementRef.current && currentPageId) {
        const rect = elementRef.current.getBoundingClientRect();
        const dx = rect.left - (element.originalPosition.x + element.x);
        const dy = rect.top - (element.originalPosition.y + element.y);

        updateElementPosition(
          currentPageId,
          element.id,
          dx,
          dy
        );
      }

      if (isResizing && elementRef.current && currentPageId) {
        const rect = elementRef.current.getBoundingClientRect();
        const dx = rect.left - (element.originalPosition.x + element.x);
        const dy = rect.top - (element.originalPosition.y + element.y);

        updateElementPosition(
          currentPageId,
          element.id,
          dx,
          dy,
          rect.width,
          rect.height
        );
      }

      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, currentPageId, element.id, updateElementPosition]);

  // 应用初始位置和尺寸
  useEffect(() => {
    if (elementRef.current && isEditMode) {
      elementRef.current.style.position = "relative";
      elementRef.current.style.left = `${element.x}px`;
      elementRef.current.style.top = `${element.y}px`;

      if (element.width) {
        elementRef.current.style.width = `${element.width}px`;
      }

      if (element.height) {
        elementRef.current.style.height = `${element.height}px`;
      }
    }
  }, [element, isEditMode]);

  if (!isEditMode) {
    return <>{children}</>;
  }

  return (
    <div
      ref={elementRef}
      className="relative transition-all"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        border: "2px dashed #3b82f6",
        padding: "4px",
        margin: "4px",
        zIndex: isDragging || isResizing ? 1000 : 1
      }}
      onMouseDown={handleDragStart}
    >
      <div
        className="absolute top-0 left-0 bg-blue-500 text-white px-2 py-1 text-xs flex items-center gap-1 z-10"
        style={{ cursor: "move" }}
      >
        <Grip className="h-3 w-3" />
        <span>{element.label || element.type}</span>
      </div>

      <div
        className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 cursor-se-resize"
        onMouseDown={handleResizeStart}
      >
        <Maximize className="h-3 w-3" />
      </div>

      {children}
    </div>
  );
} 