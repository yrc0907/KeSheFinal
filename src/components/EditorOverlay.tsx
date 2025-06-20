"use client"

import React, { useEffect, useState } from "react"
import { usePageEditor, PageElement } from "@/context/PageEditorContext"
import { DraggableOverlay } from "@/components/DraggableOverlay"
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core"

interface EditorOverlayProps {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
}

export function EditorOverlay({ iframeRef }: EditorOverlayProps) {
  const { isEditMode, currentPageId, pageLayouts, updateElementPosition, applyLayout } = usePageEditor();
  const [elements, setElements] = useState<PageElement[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  // When edit mode or current page changes, update the elements
  useEffect(() => {
    if (!isEditMode || !currentPageId || !pageLayouts[currentPageId]) {
      setElements([]);
      return;
    }

    setElements(pageLayouts[currentPageId].elements);
  }, [isEditMode, currentPageId, pageLayouts]);

  // Refresh element positions based on iframe content
  const refreshElementPositions = () => {
    if (!iframeRef.current?.contentDocument || !currentPageId) return;

    const iframeDoc = iframeRef.current.contentDocument;

    const updatedElements = elements.map(element => {
      const domElement = iframeDoc.querySelector(element.selector);
      if (!domElement || !(domElement instanceof HTMLElement)) {
        return element;
      }

      const rect = domElement.getBoundingClientRect();

      return {
        ...element,
        originalPosition: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        }
      };
    });

    setElements(updatedElements);
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    if (!currentPageId) return;

    const { active, delta } = event;
    const { x, y } = delta;

    // Update element position in context
    updateElementPosition(currentPageId, active.id as string, x, y);

    // Apply layout to iframe document
    if (iframeRef.current?.contentDocument) {
      applyLayout(currentPageId, iframeRef.current.contentDocument, true);
    }
  };

  // No overlay if not in edit mode
  if (!isEditMode || !elements.length) {
    return null;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="pointer-events-auto">
          {elements.map(element => (
            <DraggableOverlay key={element.id} element={element} />
          ))}
        </div>
      </div>
    </DndContext>
  );
} 